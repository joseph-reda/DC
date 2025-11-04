import React from "react";
import RequestForm from "../components/RequestForm";
import { saveRequest } from "../firebaseService";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

export default function EngineerPage() {
    // 🟢 حفظ الطلب وإنشاء ملف Word بعد الحفظ
    async function handleSave(data) {
        try {
            await saveRequest(data);
            alert("✅ Request submitted successfully!");
            await generateWordFile(data);
        } catch (err) {
            console.error(err);
            alert("❌ Failed to submit request: " + (err.message || err));
        }
    }

    // 🧠 توليد ملف Word من القالب
    async function generateWordFile(data) {
        try {
            // تحميل القالب من مجلد public
            const response = await fetch("/template.docx");
            const blob = await response.blob();

            // قراءة القالب وتحضيره
            const zip = new PizZip(await blob.arrayBuffer());
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            // تمرير البيانات الديناميكية
            doc.setData({
                Subject: data.desc || "",
                Date: data.receivedDate || "",
                SubmittalNo: data.irNo || "",
            });

            // توليد الملف النهائي
            doc.render();
            const output = doc.getZip().generate({ type: "blob" });

            // تحميل الملف باسم مميز
            saveAs(output, `IR-${data.irNo || "Request"}.docx`);
        } catch (err) {
            console.error("Word generation error:", err);
            alert("❌ Failed to generate Word file");
        }
    }

    return (
        <div
            className="engineer-page"
            style={{
                padding: "2rem",
                maxWidth: "850px",
                margin: "2rem auto",
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
        >
            <h2
                style={{
                    color: "#2563eb",
                    marginBottom: "1.5rem",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "1.5rem",
                }}
            >
                👷 Engineer – Submit Inspection Request
            </h2>

            <RequestForm onSaved={handleSave} />
        </div>
    );
}
