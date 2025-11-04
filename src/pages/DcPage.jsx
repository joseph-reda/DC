import React, { useEffect, useState } from "react";
import { listenRequests } from "../firebaseService";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

export default function DcPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 🟢 تحميل البيانات من Firebase
    useEffect(() => {
        const unsubscribe = listenRequests((data) => {
            // ترتيب الطلبات بحيث الأحدث يظهر أولًا
            const sorted = [...data].sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate));
            setRequests(sorted);
            setLoading(false);
        });

        return () => unsubscribe && unsubscribe();
    }, []);

    // 🧠 دالة إنشاء ملف Word من القالب
    async function generateWordFile(request) {
        try {
            // ✅ تحميل القالب من مجلد public
            const response = await fetch("/template.docx");
            const arrayBuffer = await response.arrayBuffer();
            const zip = new PizZip(arrayBuffer);

            // ✅ إعداد docxtemplater
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            // ✅ تمرير البيانات المطلوبة
            doc.render({
                Subject: request.desc || "N/A",
                Date: request.receivedDate || "N/A",
                SubmittalNo: request.irNo || "N/A",
            });

            // ✅ توليد ملف Word جديد
            const out = doc.getZip().generate({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });

            saveAs(out, `IR-${request.irNo || "Unknown"}.docx`);
        } catch (err) {
            console.error("Word generation error:", err);
            setError("❌ Failed to generate Word file. Check template format.");
        }
    }

    return (
        <div
            style={{
                padding: "2rem",
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
                fontFamily: "Inter, sans-serif",
            }}
        >
            <h2 style={{ color: "#2563eb", marginBottom: "1rem" }}>
                📁 Document Controller – Inspection Requests
            </h2>

            {error && (
                <div
                    style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        padding: "0.75rem",
                        borderRadius: "6px",
                        marginBottom: "1rem",
                    }}
                >
                    {error}
                </div>
            )}

            {loading ? (
                <p style={{ color: "#555" }}>⏳ Loading requests...</p>
            ) : requests.length === 0 ? (
                <p style={{ color: "#777" }}>No requests found.</p>
            ) : (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        background: "#fff",
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    }}
                >
                    <thead style={{ background: "#e2e8f0", color: "#1e293b" }}>
                        <tr>
                            <th style={thStyle}>IR No</th>
                            <th style={thStyle}>Description</th>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Location</th>
                            <th style={thStyle}>Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((r, idx) => (
                            <tr
                                key={idx}
                                style={{
                                    background: idx % 2 === 0 ? "#f9fafb" : "#fff",
                                    borderBottom: "1px solid #e5e7eb",
                                }}
                            >
                                <td style={tdStyle}>{r.irNo || "-"}</td>
                                <td style={tdStyle}>{r.desc || "-"}</td>
                                <td style={tdStyle}>{r.receivedDate || "-"}</td>
                                <td style={tdStyle}>{r.location || "-"}</td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => generateWordFile(r)}
                                        style={btnStyle}
                                    >
                                        📄 Download
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const thStyle = {
    padding: "0.75rem",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "0.9rem",
    borderBottom: "2px solid #cbd5e1",
};

const tdStyle = {
    padding: "0.75rem",
    fontSize: "0.9rem",
    color: "#334155",
};

const btnStyle = {
    background: "#2563eb",
    color: "#fff",
    padding: "0.4rem 0.8rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.85rem",
};
