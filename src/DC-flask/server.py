from flask import Flask, request, send_file, jsonify, abort
from docxtpl import DocxTemplate
from io import BytesIO
from flask_cors import CORS
import os
import json
import threading
import re

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TEMPLATE_PATH = os.path.join(BASE_DIR, "template-clean-safe.docx")
PROJECTS_JSON = os.path.join(BASE_DIR, "projects.json")
LOCATION_RULES_JSON = os.path.join(BASE_DIR, "location_rules.json")
GENERAL_DESC_JSON = os.path.join(BASE_DIR, "general_descriptions.json")

# Lock بسيط لحماية عمليات القراءة/الكتابة المتزامنة على الملفات
_lock = threading.Lock()

def _ensure_file(path, default):
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(default, f, ensure_ascii=False, indent=2)

def read_json(path, default):
    _ensure_file(path, default)
    with _lock:
        with open(path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                return data
            except Exception:
                return default

def write_json(path, data):
    _ensure_file(path, data)
    with _lock:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

# ----------------- helpers for patterns -----------------
def _expand_pattern(pattern):
    """
    Expand patterns like:
      A6.02.(1/2/3)   -> A6-02-01, A6-02-02, A6-02-03
      A6.04.0(1/2)    -> A6-04-01, A6-04-02 (0 prefix + inner)
      A6.05.03        -> A6-05-03
      A6.04.(3/5/7)   -> A6-04-03, A6-04-05, A6-04-07
    Return a sorted list of expanded location strings (with '-' and zero-padded numbers).
    """
    parts = pattern.split(".")
    tokens = []
    for p in parts:
        p = p.strip()
        m = re.match(r'^([0-9]+)\(([0-9\/]+)\)$', p)
        if m:
            prefix = m.group(1)
            inner = m.group(2).split("/")
            tokens.append([prefix + x for x in [i.strip() for i in inner]])
            continue

        if p.startswith("(") and p.endswith(")"):
            inner = p[1:-1].split("/")
            tokens.append([i.strip() for i in inner])
            continue

        tokens.append([p])

    combos = [[]]
    for token_list in tokens:
        new = []
        for c in combos:
            for t in token_list:
                new.append(c + [t])
        combos = new

    expanded = []
    for combo in combos:
        segs = []
        for seg in combo:
            m = re.search(r'(\d+)$', seg)
            if m:
                num = m.group(1)
                padded = num.zfill(2)
                seg_prefix = seg[:len(seg)-len(num)]
                segs.append(seg_prefix + padded)
            else:
                segs.append(seg)
        expanded.append("-".join(segs))

    expanded = sorted(list(dict.fromkeys(expanded)))
    return expanded

# ----------------- CORS headers -----------------
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE")
    return response

# ----------------- simple home -----------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "✅ Flask Word Generator & IR Counter API is running"}), 200

# ----------------- Projects management -----------------
@app.route("/projects", methods=["GET"])
def get_projects():
    projects = read_json(PROJECTS_JSON, {})
    return jsonify({"projects": projects}), 200

@app.route("/projects", methods=["POST"])
def add_project():
    payload = request.get_json(force=True) or {}
    project = payload.get("project")
    if not project or not isinstance(project, str):
        return jsonify({"error": "project (string) is required"}), 400

    projects = read_json(PROJECTS_JSON, {})
    if project in projects:
        return jsonify({"error": "Project already exists"}), 409

    projects[project] = 0
    write_json(PROJECTS_JSON, projects)
    return jsonify({"status": "created", "project": project}), 201

@app.route("/projects/<project>", methods=["DELETE"])
def delete_project(project):
    projects = read_json(PROJECTS_JSON, {})
    if project not in projects:
        return jsonify({"error": "Project not found"}), 404

    del projects[project]
    write_json(PROJECTS_JSON, projects)

    # Also remove any rules for that project
    rules = read_json(LOCATION_RULES_JSON, {})
    if project in rules:
        del rules[project]
        write_json(LOCATION_RULES_JSON, rules)

    return jsonify({"status": "deleted", "project": project}), 200

# ----------------- Next IR -----------------
@app.route("/get-next-ir", methods=["GET"])
def get_next_ir():
    project = request.args.get("project")
    if not project:
        return jsonify({"error": "project query parameter is required"}), 400

    projects = read_json(PROJECTS_JSON, {})
    if project not in projects:
        return jsonify({"error": "Project not found"}), 404

    last = int(projects.get(project, 0) or 0)
    next_ir = last + 1
    return jsonify({"project": project, "lastIR": last, "nextIR": next_ir}), 200

# ----------------- Save last IR -----------------
@app.route("/save-last-ir", methods=["POST"])
def save_last_ir():
    payload = request.get_json(force=True) or {}
    project = payload.get("project")
    last_ir = payload.get("lastIR")

    if not project or not isinstance(project, str):
        return jsonify({"error": "project (string) is required"}), 400
    if last_ir is None:
        return jsonify({"error": "lastIR (int) is required"}), 400

    try:
        last_ir = int(last_ir)
    except Exception:
        return jsonify({"error": "lastIR must be an integer"}), 400

    projects = read_json(PROJECTS_JSON, {})
    if project not in projects:
        return jsonify({"error": "Project not found"}), 404

    current = int(projects.get(project, 0) or 0)
    if last_ir < current:
        return jsonify({"error": "Provided lastIR is less than current stored value", "current": current}), 400

    projects[project] = last_ir
    write_json(PROJECTS_JSON, projects)
    return jsonify({"status": "saved", "project": project, "lastIR": last_ir}), 200

# ----------------- Location rules endpoints -----------------
@app.route("/location-rules", methods=["GET", "POST", "DELETE"])
def location_rules():
    method = request.method
    if method == "GET":
        project = request.args.get("project")
        rules = read_json(LOCATION_RULES_JSON, {})
        if project:
            proj_rules = rules.get(project, [])
            locations = []
            types_map = {}
            for r in proj_rules:
                pattern = r.get("pattern")
                t = r.get("type")
                expanded = _expand_pattern(pattern)
                for loc in expanded:
                    locations.append(loc)
                    if t:
                        types_map[loc] = t
            locations = sorted(list(dict.fromkeys(locations)))
            return jsonify({"project": project, "locations": locations, "types": types_map, "rules": proj_rules}), 200
        else:
            return jsonify({"rules": rules}), 200

    if method == "POST":
        payload = request.get_json(force=True) or {}
        project = payload.get("project")
        pattern = payload.get("pattern")
        typ = payload.get("type") or ""

        if not project or not pattern:
            return jsonify({"error": "project and pattern are required"}), 400

        rules = read_json(LOCATION_RULES_JSON, {})
        proj_rules = rules.get(project, [])

        exists = any(r.get("pattern") == pattern for r in proj_rules)
        if exists:
            return jsonify({"error": "Rule pattern already exists for this project"}), 409

        proj_rules.append({"pattern": pattern, "type": typ})
        rules[project] = proj_rules
        write_json(LOCATION_RULES_JSON, rules)
        return jsonify({"status": "created", "project": project, "pattern": pattern}), 201

    if method == "DELETE":
        project = request.args.get("project")
        pattern = request.args.get("pattern")
        if not project or not pattern:
            return jsonify({"error": "project and pattern query params are required"}), 400

        rules = read_json(LOCATION_RULES_JSON, {})
        proj_rules = rules.get(project, [])
        new_rules = [r for r in proj_rules if r.get("pattern") != pattern]
        if len(new_rules) == len(proj_rules):
            return jsonify({"error": "Rule not found"}), 404

        rules[project] = new_rules
        write_json(LOCATION_RULES_JSON, rules)
        return jsonify({"status": "deleted", "project": project, "pattern": pattern}), 200

# ----------------- General Descriptions endpoints -----------------
@app.route("/general-descriptions", methods=["GET", "POST", "DELETE"])
def general_descriptions():
    """
    GET /general-descriptions -> { descriptions: [ ... ] }
    POST /general-descriptions -> body { description: "..." }  (adds)
    DELETE /general-descriptions?description=...  (deletes by exact match)
    """
    method = request.method
    if method == "GET":
        data = read_json(GENERAL_DESC_JSON, {"descriptions": []})
        return jsonify({"descriptions": data.get("descriptions", [])}), 200

    if method == "POST":
        payload = request.get_json(force=True) or {}
        desc = payload.get("description")
        if not desc or not isinstance(desc, str):
            return jsonify({"error": "description (string) is required"}), 400

        data = read_json(GENERAL_DESC_JSON, {"descriptions": []})
        lst = data.get("descriptions", [])
        if desc in lst:
            return jsonify({"error": "Description already exists"}), 409
        lst.append(desc)
        data["descriptions"] = lst
        write_json(GENERAL_DESC_JSON, data)
        return jsonify({"status": "created", "description": desc}), 201

    if method == "DELETE":
        desc = request.args.get("description")
        if not desc:
            return jsonify({"error": "description query param is required"}), 400
        data = read_json(GENERAL_DESC_JSON, {"descriptions": []})
        lst = data.get("descriptions", [])
        if desc not in lst:
            return jsonify({"error": "Description not found"}), 404
        lst = [d for d in lst if d != desc]
        data["descriptions"] = lst
        write_json(GENERAL_DESC_JSON, data)
        return jsonify({"status": "deleted", "description": desc}), 200

# ----------------- Existing generate-word endpoint (كما كان لديك) ----------
@app.route("/generate-word", methods=["POST", "OPTIONS"])
def generate_word():
    if request.method == "OPTIONS":
        return jsonify({"status": "OK"}), 200

    try:
        data = request.get_json(force=True)

        context = {
            "Date": data.get("Date", "N/A"),
            "SubmittalNo": data.get("SubmittalNo", "N/A"),
            "Subject": data.get("Subject", "N/A"),
        }

        if not os.path.exists(TEMPLATE_PATH):
            return jsonify({"error": "Template file not found"}), 404

        doc = DocxTemplate(TEMPLATE_PATH)
        doc.render(context)

        output = BytesIO()
        doc.save(output)
        output.seek(0)

        return send_file(
            output,
            as_attachment=True,
            download_name=f"{context['SubmittalNo'] or 'Document'}.docx",
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
