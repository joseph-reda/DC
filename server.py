from flask import Flask, request, send_file, jsonify
from docxtpl import DocxTemplate
from io import BytesIO
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "template-clean-safe.docx")

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "✅ Flask Word Generator API is running"}), 200

@app.route("/generate-word", methods=["POST"])
def generate_word():
    try:
        data = request.get_json(force=True)
        print("📩 Incoming JSON:", data)

        context = {
            "Date": data.get("Date", "N/A"),
            "SubmittalNo": data.get("SubmittalNo", "N/A"),
            "Subject": data.get("Subject", "N/A"),
        }

        print("🧩 Context for template:", context)
        print("📂 Template path:", TEMPLATE_PATH)
        print("📁 Exists:", os.path.exists(TEMPLATE_PATH))

        if not os.path.exists(TEMPLATE_PATH):
            return jsonify({"error": "Template file not found"}), 404

        # Load and render the Word file
        doc = DocxTemplate(TEMPLATE_PATH)
        doc.render(context)

        output = BytesIO()
        doc.save(output)
        output.seek(0)

        print("✅ Word file generated successfully")
        return send_file(
            output,
            as_attachment=True,
            download_name=f"{context['SubmittalNo'] or 'Document'}.docx",
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

    except Exception as e:
        print("❌ Word generation failed:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 Server running on http://127.0.0.1:5000")
    print("📄 Template path:", TEMPLATE_PATH)
    app.run(host="0.0.0.0", port=5000, debug=True)
