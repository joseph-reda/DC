from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from docxtpl import DocxTemplate
from io import BytesIO
import os, json, threading
from datetime import datetime

app = Flask(__name__)

# ---------------------- CORS FIX ----------------------
CORS(app, supports_credentials=True)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
    return response

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        return "", 200

# ---------------------- PATHS ----------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "template-clean-safe.docx")

PROJECTS_JSON = os.path.join(BASE_DIR, "projects.json")
USERS_JSON = os.path.join(BASE_DIR, "users.json")
GENERAL_DESC_JSON = os.path.join(BASE_DIR, "general_descriptions.json")
LOCATION_RULES_JSON = os.path.join(BASE_DIR, "location_rules.json")
IRS_JSON = os.path.join(BASE_DIR, "irs.json")

_lock = threading.Lock()

# ---------------------- JSON HELPERS ----------------------
def load_json(path, default):
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(default, f, indent=2)
    with open(path, "r", encoding="utf-8") as f:
        try: 
            return json.load(f)
        except:
            return default

def save_json(path, data):
    with _lock:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

# -------------------------- LOGIN --------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    users = load_json(USERS_JSON, [])

    user = next((u for u in users 
                 if u["username"] == data.get("username") 
                 and u["password"] == data.get("password")), None)

    if not user:
        return jsonify({"error": "Invalid username or password"}), 401

    user = dict(user)
    del user["password"]
    return jsonify({"user": user})

# ---------------------- PROJECTS LIST ----------------------
@app.route("/projects", methods=["GET"])
def get_projects():
    return jsonify({"projects": load_json(PROJECTS_JSON, {})})

# ---------------------- LOCATION RULES ----------------------
@app.route("/location-rules", methods=["GET"])
def get_location_rules():
    project = request.args.get("project")
    rules = load_json(LOCATION_RULES_JSON, {})

    if not project or project not in rules:
        return jsonify({"locations": [], "types": {}})

    locations = [r["pattern"] for r in rules[project]]
    types = {r["pattern"]: r["type"] for r in rules[project]}

    return jsonify({"locations": locations, "types": types})

# ---------------------- GENERAL DESCRIPTIONS ----------------------
@app.route("/general-descriptions", methods=["GET"])
def get_general():
    dept = request.args.get("department")
    data = load_json(GENERAL_DESC_JSON, {})
    return jsonify({"descriptions": data.get(dept, [])})

# ---------------------- SAVE IR ----------------------
@app.route("/irs", methods=["POST"])
def save_ir():
    data = request.get_json() or {}

    required = ["project", "department", "location", "type", "desc", "user"]
    for key in required:
        if not data.get(key):
            return jsonify({"error": f"Missing field: {key}"}), 400

    irs = load_json(IRS_JSON, [])
    counters = load_json(PROJECTS_JSON, {})

    project = data["project"]
    department = data["department"].upper().replace(" ", "")
    location = data["location"]
    desc = data["desc"]
    type_value = data["type"]
    user = data["user"]

    # generate next number
    last = int(counters.get(project, 0)) + 1

    ir_number = f"IR-BADYA-CON-{project}-IR-{department}-{last}"

    new_ir = {
        "project": project,
        "department": department,
        "location": location,
        "type": type_value,
        "desc": desc,
        "user": user,
        "irNo": ir_number,
        "receivedDate": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

    irs.append(new_ir)
    save_json(IRS_JSON, irs)

    counters[project] = last
    save_json(PROJECTS_JSON, counters)

    return jsonify({"status": "saved", "ir": new_ir})

# ---------------------- DELETE IR ----------------------
@app.route("/irs", methods=["DELETE"])
def delete_ir():
    irNo = request.args.get("irNo")

    if not irNo:
        return jsonify({"error": "irNo required"}), 400

    irs = load_json(IRS_JSON, [])
    new_list = [x for x in irs if x["irNo"] != irNo]

    if len(new_list) == len(irs):
        return jsonify({"error": "IR not found"}), 404

    save_json(IRS_JSON, new_list)
    return jsonify({"status": "deleted"})

# ---------------------- GET IR LIST ----------------------
@app.route("/irs", methods=["GET"])
def get_irs():
    return jsonify({"irs": load_json(IRS_JSON, [])})

# ---------------------- GENERATE WORD ----------------------
@app.route("/generate-word", methods=["POST"])
def generate_word():
    data = request.get_json()

    doc = DocxTemplate(TEMPLATE_PATH)
    doc.render(data)

    buf = BytesIO()
    doc.save(buf)
    buf.seek(0)

    return send_file(
        buf,
        as_attachment=True,
        download_name=f"{data.get('irNo','IR')}.docx"
    )

# ---------------------- RUN ----------------------
if __name__ == "__main__":
    app.run()
