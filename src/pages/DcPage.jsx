import React, { useEffect, useState } from "react";
import RequestForm from "../components/RequestForm";
import {
    saveRequest,
    listenRequests,
    deleteRequest,
    copyRow,
    copyAllRows,
} from "../firebaseService";

export default function DcPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🟢 الاستماع لطلبات Firebase
    useEffect(() => {
        const unsubscribe = listenRequests((data) => {
            setRequests(data);
            setLoading(false);
        });
        return () => unsubscribe && unsubscribe();
    }, []);

    // 🟢 حفظ طلب جديد
    async function handleSave(formData) {
        try {
            await saveRequest(formData);
            alert(`✅ Request saved successfully with IR No: ${formData.irNo}`);
        } catch (err) {
            console.error("❌ Error saving request:", err);
            alert("❌ Failed to save request: " + (err.message || err));
        }
    }

    // 🗑️ حذف صف
    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            await deleteRequest(id);
            alert("🗑️ Request deleted successfully!");
        } catch (err) {
            alert("❌ Failed to delete: " + err.message);
        }
    }

    // 📋 نسخ صف
    async function handleCopyRow(row) {
        try {
            await copyRow(row);
            alert("✅ Row copied to clipboard!");
        } catch (err) {
            alert("❌ Failed to copy row: " + err.message);
        }
    }

    // 📋 نسخ جميع الصفوف
    async function handleCopyAll() {
        try {
            if (requests.length === 0) return alert("⚠️ No data to copy");
            await copyAllRows(requests);
            alert("✅ All rows copied successfully!");
        } catch (err) {
            alert("❌ Failed to copy all rows: " + err.message);
        }
    }

    // 💾 تنزيل Word
    async function generateWordFile(request) {
        try {
            const response = await fetch("http://127.0.0.1:5000/generate-word", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Date: request.receivedDate || "",
                    SubmittalNo: request.irNo || "",
                    Subject: request.desc || "",
                }),
            });

            if (!response.ok) throw new Error("Server error while generating file");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `IR-${request.irNo || "Request"}.docx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("❌ Word generation error:", err);
            alert("❌ Failed to generate Word file. Please check Flask server.");
        }
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📁 Document Controller – Inspection Requests</h2>

            {/* 🔹 Form */}
            <div style={styles.card}>
                <RequestForm onSaved={handleSave} />
            </div>

            {/* 🔹 Copy All */}
            <div style={{ textAlign: "right", margin: "1rem 0" }}>
                <button onClick={handleCopyAll} style={styles.copyAllBtn}>
                    📋 Copy All
                </button>
            </div>

            {/* 🔸 Table */}
            {loading ? (
                <p style={styles.loading}>⏳ Loading requests...</p>
            ) : requests.length === 0 ? (
                <p style={styles.noData}>No requests found.</p>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>IR No</th>
                                <th style={styles.th}>IR Rev</th>
                                <th style={styles.th}>HYPWRLINK</th>
                                <th style={styles.th}>Latest Rev</th>
                                <th style={styles.th}>Description</th>
                                <th style={styles.th}>Location</th>
                                <th style={styles.th}>Received Date</th>
                                <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((r, idx) => (
                                <tr
                                    key={r.id || idx}
                                    style={{ background: idx % 2 === 0 ? "#f9fafb" : "#fff" }}
                                >
                                    <td style={styles.td}>{r.irNo}</td>
                                    <td style={styles.td}>{r.irRev}</td>
                                    <td style={styles.td}>
                                        {r.hypwr ? (
                                            <a href={r.hypwr} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                                Link
                                            </a>
                                        ) : "-"}
                                    </td>
                                    <td style={styles.td}>{r.irLatestRev}</td>
                                    <td style={styles.td}>{r.desc}</td>
                                    <td style={styles.td}>{r.location}</td>
                                    <td style={styles.td}>{r.receivedDate}</td>
                                    <td style={{ ...styles.td, textAlign: "center" }}>
                                        <button onClick={() => handleCopyRow(r)} style={styles.btnCopy}>📋</button>
                                        <button onClick={() => generateWordFile(r)} style={styles.btnDownload}>💾</button>
                                        <button onClick={() => handleDelete(r.id)} style={styles.btnDelete}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// 🎨 Styles
const styles = {
    container: { padding: "2rem", background: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, sans-serif" },
    title: { color: "#2563eb", textAlign: "center", marginBottom: "1rem", fontWeight: "600" },
    card: { background: "#fff", borderRadius: "12px", padding: "1rem", boxShadow: "0 4px 14px rgba(0,0,0,0.08)", marginBottom: "1rem" },
    copyAllBtn: { background: "#2563eb", color: "#fff", padding: "0.6rem 1rem", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" },
    tableContainer: { overflowX: "auto", background: "#fff", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: "700px" },
    th: { padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #cbd5e1", fontWeight: "600", fontSize: "0.9rem" },
    td: { padding: "0.75rem", fontSize: "0.9rem", color: "#334155" },
    link: { color: "#2563eb", textDecoration: "underline" },
    loading: { textAlign: "center", color: "#555" },
    noData: { textAlign: "center", color: "#777" },
    btnCopy: { background: "#22c55e", color: "#fff", padding: "0.4rem 0.8rem", border: "none", borderRadius: "6px", cursor: "pointer", marginRight: "0.3rem" },
    btnDownload: { background: "#0ea5e9", color: "#fff", padding: "0.4rem 0.8rem", border: "none", borderRadius: "6px", cursor: "pointer", marginRight: "0.3rem" },
    btnDelete: { background: "#ef4444", color: "#fff", padding: "0.4rem 0.8rem", border: "none", borderRadius: "6px", cursor: "pointer" },
};
