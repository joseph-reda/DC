from flask import Flask, request, send_file, jsonify
from docxtpl import DocxTemplate
from io import BytesIO
from flask_cors import CORS
import os

app = Flask(__name__)

# CORS full open
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "template-clean-safe.docx")


@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "✅ Flask Word Generator API is running"}), 200


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
    app.run()
