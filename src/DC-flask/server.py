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
USERS_JSON = os.path.join(BASE_DIR, "users.json")

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
                return json.load(f)
            except Exception:
                return default

def write_json(path, data):
    _ensure_file(path, data)
    with _lock:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

# initialize default users and descriptions if not present
def ensure_defaults():
    # users default
    users_default = [
        { "username": "arch", "password": "a1236", "role": "engineer", "department": "Architectural" },
        { "username": "civil", "password": "c1236", "role": "engineer", "department": "Civil-Structure" },
        { "username": "survey", "password": "s1236", "role": "engineer", "department": "Survey" },
        { "username": "mech", "password": "m1236", "role": "engineer", "department": "Mechanics" },
        { "username": "elec", "password": "e1236", "role": "engineer", "department": "Electricity" },
        { "username": "dc", "password": "d1236", "role": "dc", "department": "DC" },
        { "username": "admin", "password": "012013", "role": "admin", "department": "Admin" }
    ]
    _ensure_file(USERS_JSON, users_default)

    # general descriptions default (per-department structure)
    general_default = {
        "Architectural": ["Installation of Stair Marble", "FINAL PAINT FOR BACK ELEVATION"],
        "Civil-Structure": ["Concrete Pour Inspection", "Rebar Placement Check"],
        "Survey": ["Site Marking", "Coordinates Verification"],
        "Mechanics": ["HVAC Duct Installation", "Pump Test"],
        "Electricity": ["Cable Tray Installation", "LV PANEL Testing"],
        "DC": [],
        "Admin": []
    }
    _ensure_file(GENERAL_DESC_JSON, general_default)

    # ensure projects file exists
    _ensure_file(PROJECTS_JSON, {})
    _ensure_file(LOCATION_RULES_JSON, {})

ensure_defaults()

# ---------- helpers for patterns (same as before) ----------
def _expand_pattern(pattern):
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

# ----------------- CORS -----------------
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE")
    return response

# ----------------- home -----------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "✅ API running"}), 200

# ----------------- USERS / LOGIN -----------------
@app.route("/login", methods=["POST"])
def login():
    payload = request.get_json(force=True) or {}
    username = payload.get("username")
    password = payload.get("password")
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    users = read_json(USERS_JSON, [])
    user = next((u for u in users if u.get("username") == username and u.get("password") == password), None)
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401

    # return user without password
    safe_user = {k:v for k,v in user.items() if k != "password"}
    return jsonify({"user": safe_user}), 200

# Optional: endpoints to manage users (only for admin if you want)
@app.route("/users", methods=["GET", "POST", "DELETE"])
def users_manage():
    # Note: This is rudimentary; in production add auth checks.
    method = request.method
    if method == "GET":
        users = read_json(USERS_JSON, [])
        safe = [{k:v for k,v in u.items() if k!="password"} for u in users]
        return jsonify({"users": safe}), 200
    if method == "POST":
        payload = request.get_json(force=True) or {}
        username = payload.get("username")
        password = payload.get("password")
        role = payload.get("role", "engineer")
        dept = payload.get("department", "")
        if not username or not password:
            return jsonify({"error":"username & password required"}), 400
        users = read_json(USERS_JSON, [])
        if any(u.get("username")==username for u in users):
            return jsonify({"error":"username exists"}), 409
        users.append({"username":username,"password":password,"role":role,"department":dept})
        write_json(USERS_JSON, users)
        return jsonify({"status":"created"}), 201
    if method == "DELETE":
        username = request.args.get("username")
        if not username:
            return jsonify({"error":"username query param required"}), 400
        users = read_json(USERS_JSON, [])
        new = [u for u in users if u.get("username")!=username]
        if len(new)==len(users):
            return jsonify({"error":"user not found"}), 404
        write_json(USERS_JSON, new)
        return jsonify({"status":"deleted"}), 200

# ----------------- Projects (same as before) -----------------
@app.route("/projects", methods=["GET","POST"])
def projects():
    if request.method == "GET":
        projects = read_json(PROJECTS_JSON, {})
        return jsonify({"projects": projects}), 200
    if request.method == "POST":
        payload = request.get_json(force=True) or {}
        project = payload.get("project")
        if not project:
            return jsonify({"error":"project required"}), 400
        projects = read_json(PROJECTS_JSON, {})
        if project in projects:
            return jsonify({"error":"exists"}), 409
        projects[project]=0
        write_json(PROJECTS_JSON, projects)
        return jsonify({"status":"created"}), 201

@app.route("/projects/<project>", methods=["DELETE"])
def delete_project(project):
    projects = read_json(PROJECTS_JSON, {})
    if project not in projects:
        return jsonify({"error":"not found"}), 404
    del projects[project]
    write_json(PROJECTS_JSON, projects)
    rules = read_json(LOCATION_RULES_JSON, {})
    if project in rules:
        del rules[project]; write_json(LOCATION_RULES_JSON, rules)
    return jsonify({"status":"deleted"}), 200

# ----------------- get-next-ir & save-last-ir (same) -----------------
@app.route("/get-next-ir", methods=["GET"])
def get_next_ir():
    project = request.args.get("project")
    if not project:
        return jsonify({"error":"project required"}), 400
    projects = read_json(PROJECTS_JSON, {})
    if project not in projects:
        return jsonify({"error":"Project not found"}), 404
    last = int(projects.get(project,0) or 0)
    return jsonify({"project":project,"lastIR":last,"nextIR": last+1}), 200

@app.route("/save-last-ir", methods=["POST"])
def save_last_ir():
    payload = request.get_json(force=True) or {}
    project = payload.get("project")
    last_ir = payload.get("lastIR")
    if not project or last_ir is None:
        return jsonify({"error":"project & lastIR required"}), 400
    try:
        last_ir = int(last_ir)
    except:
        return jsonify({"error":"lastIR int required"}), 400
    projects = read_json(PROJECTS_JSON, {})
    if project not in projects:
        return jsonify({"error":"Project not found"}), 404
    current = int(projects.get(project,0) or 0)
    if last_ir < current:
        return jsonify({"error":"Provided lastIR is less than current stored value","current":current}), 400
    projects[project]=last_ir
    write_json(PROJECTS_JSON, projects)
    return jsonify({"status":"saved"}), 200

# ----------------- location-rules endpoints (same) -----------------
@app.route("/location-rules", methods=["GET","POST","DELETE"])
def location_rules():
    method = request.method
    if method=="GET":
        project = request.args.get("project")
        rules = read_json(LOCATION_RULES_JSON, {})
        if project:
            proj_rules = rules.get(project,[])
            locations=[]
            types_map={}
            for r in proj_rules:
                pattern = r.get("pattern"); t=r.get("type")
                expanded = _expand_pattern(pattern)
                for loc in expanded:
                    locations.append(loc)
                    if t: types_map[loc]=t
            locations = sorted(list(dict.fromkeys(locations)))
            return jsonify({"project":project,"locations":locations,"types":types_map,"rules":proj_rules}), 200
        else:
            return jsonify({"rules": rules}), 200
    if method=="POST":
        payload = request.get_json(force=True) or {}
        project = payload.get("project"); pattern = payload.get("pattern"); typ = payload.get("type") or ""
        if not project or not pattern:
            return jsonify({"error":"project and pattern required"}), 400
        rules = read_json(LOCATION_RULES_JSON, {})
        proj_rules = rules.get(project,[])
        if any(r.get("pattern")==pattern for r in proj_rules):
            return jsonify({"error":"Rule exists"}), 409
        proj_rules.append({"pattern":pattern,"type":typ})
        rules[project]=proj_rules
        write_json(LOCATION_RULES_JSON, rules)
        return jsonify({"status":"created"}), 201
    if method=="DELETE":
        project = request.args.get("project"); pattern = request.args.get("pattern")
        if not project or not pattern:
            return jsonify({"error":"project & pattern required"}), 400
        rules = read_json(LOCATION_RULES_JSON, {})
        proj_rules = rules.get(project,[])
        new_rules = [r for r in proj_rules if r.get("pattern")!=pattern]
        if len(new_rules)==len(proj_rules):
            return jsonify({"error":"Rule not found"}), 404
        rules[project]=new_rules; write_json(LOCATION_RULES_JSON, rules)
        return jsonify({"status":"deleted"}), 200

# ----------------- general-descriptions endpoints (per-department) -----------------
@app.route("/general-descriptions", methods=["GET","POST","DELETE"])
def general_descriptions():
    method = request.method
    data = read_json(GENERAL_DESC_JSON, {})
    if method=="GET":
        # optional department query param
        dept = request.args.get("department")
        if dept:
            return jsonify({"department":dept,"descriptions": data.get(dept, [])}), 200
        return jsonify({"descriptions":data}), 200
    if method=="POST":
        payload = request.get_json(force=True) or {}
        dept = payload.get("department")
        desc = payload.get("description")
        if not dept or not desc:
            return jsonify({"error":"department & description required"}), 400
        lst = data.get(dept, [])
        if desc in lst:
            return jsonify({"error":"Description exists"}), 409
        lst.append(desc)
        data[dept]=lst
        write_json(GENERAL_DESC_JSON, data)
        return jsonify({"status":"created"}), 201
    if method=="DELETE":
        dept = request.args.get("department")
        desc = request.args.get("description")
        if not dept or not desc:
            return jsonify({"error":"department & description required"}), 400
        lst = data.get(dept, [])
        if desc not in lst:
            return jsonify({"error":"not found"}), 404
        data[dept] = [d for d in lst if d != desc]
        write_json(GENERAL_DESC_JSON, data)
        return jsonify({"status":"deleted"}), 200

# ----------------- generate-word (unchanged) -----------------
@app.route("/generate-word", methods=["POST","OPTIONS"])
def generate_word():
    if request.method == "OPTIONS":
        return jsonify({"status":"OK"}), 200
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
        return send_file(output, as_attachment=True, download_name=f"{context['SubmittalNo'] or 'Document'}.docx", mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
