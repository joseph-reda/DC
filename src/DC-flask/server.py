from flask import Flask, request, send_file, jsonify
from docxtpl import DocxTemplate
from io import BytesIO
from flask_cors import CORS
import os

app = Flask(__name__)

# السماح لطلبات React من Vercel أو localhost
CORS(app, origins=[
    "https://dc-s4v9.vercel.app",
    "http://localhost:3000"
], supports_credentials=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, "template-clean-safe.docx")


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "✅ Flask Word Generator API is running"}), 200


@app.route("/generate-word", methods=["POST"])
def generate_word():
    try:
        data = request.get_json(force=True)

        context = {
            "Date": data.get("Date", "N/A"),
            "SubmittalNo": data.get("SubmittalNo", "N/A"),
            "Subject": data.get("Subject", "N/A"),
        }

        # التأكد من وجود القالب
        if not os.path.exists(TEMPLATE_PATH):
            return jsonify({"error": "Template file not found"}), 404

        # تحميل القالب ودمج القيم
        doc = DocxTemplate(TEMPLATE_PATH)
        doc.render(context)

        # إنشاء ملف DOCX في الذاكرة
        output = BytesIO()
        doc.save(output)
        output.seek(0)

        # إرسال الملف للمتصفح
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
