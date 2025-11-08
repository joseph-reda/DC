import React, { useEffect, useState } from "react";

export default function RequestsTable({
    onListen,
    onCopyRow,
    onCopyAll,
    onDeleteRow,
    onDownloadWord,
}) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🟢 الاستماع المباشر من Firebase
    useEffect(() => {
        const unsubscribe = onListen((data) => {
            setRows(data);
            setLoading(false);
        });
        return () => unsubscribe && unsubscribe();
    }, [onListen]);

    // 🗑️ حذف صف واحد
    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            await onDeleteRow(id);
            alert("🗑️ Request deleted successfully!");
        } catch (err) {
            alert("❌ Failed to delete: " + err.message);
        }
    }

    // 📋 نسخ صف واحد
    async function handleCopyRow(row) {
        try {
            await onCopyRow(row);
            alert("✅ Row copied to clipboard!");
        } catch {
            alert("❌ Failed to copy row");
        }
    }

    // 📋 نسخ جميع الصفوف
    async function handleCopyAll() {
        if (rows.length === 0) return alert("⚠️ No data to copy");
        try {
            await onCopyAll(rows);
            alert("✅ All rows copied successfully!");
        } catch {
            alert("❌ Failed to copy all rows");
        }
    }

    // 💾 تحميل ملف Word
    async function handleDownloadWord(row) {
        try {
            if (!onDownloadWord) return alert("❌ Download function not provided");
            await onDownloadWord(row);
        } catch (err) {
            console.error(err);
            alert("❌ Failed to generate Word file");
        }
    }

    return (
        <div style={styles.wrapper}>
            {/* 🔹 الأزرار العلوية */}
            <div style={styles.actions}>
                <button onClick={handleCopyAll} style={styles.copyAllBtn}>
                    📋 Copy All
                </button>
            </div>

            {/* 🔸 الجدول */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead style={styles.thead}>
                        <tr>
                            <th style={styles.th}>IR No</th>
                            <th style={styles.th}>IR Rev.</th>
                            <th style={styles.th}>Latest Rev.</th>
                            <th style={styles.th}>HYPWRLINK</th>
                            <th style={styles.th}>Description</th>
                            <th style={styles.th}>Location</th>
                            <th style={styles.th}>Received Date</th>
                            <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" style={styles.loadingCell}>
                                    ⏳ Loading requests...
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={styles.noDataCell}>
                                    No requests found
                                </td>
                            </tr>
                        ) : (
                            rows.map((r, idx) => (
                                <tr
                                    key={r.id || idx}
                                    style={{
                                        ...styles.tr,
                                        backgroundColor: idx % 2 === 0 ? "#f9fafb" : "#ffffff",
                                    }}
                                >
                                    <td style={styles.td}>{r.irNo || "-"}</td>
                                    <td style={styles.td}>{r.irRev || "-"}</td>
                                    <td style={styles.td}>{r.irLatestRev || "-"}</td>
                                    <td style={styles.td}>
                                        {r.hypwr ? (
                                            <a
                                                href={r.hypwr}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={styles.link}
                                            >
                                                Link
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td style={{ ...styles.td, maxWidth: "280px", whiteSpace: "normal" }}>
                                        {r.desc || "-"}
                                    </td>
                                    <td style={styles.td}>{r.location || "-"}</td>
                                    <td style={styles.td}>{r.receivedDate || "-"}</td>

                                    {/* الأزرار */}
                                    <td style={{ ...styles.td, textAlign: "center" }}>
                                        <button
                                            onClick={() => handleCopyRow(r)}
                                            style={styles.btnCopy}
                                            title="Copy Row"
                                        >
                                            📋
                                        </button>
                                        <button
                                            onClick={() => handleDownloadWord(r)}
                                            style={styles.btnDownload}
                                            title="Download Word"
                                        >
                                            💾
                                        </button>
                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            style={styles.btnDelete}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// 🎨 تنسيقات حديثة وأنيقة
const styles = {
    wrapper: {
        width: "95%",
        margin: "2rem auto",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        padding: "1.5rem",
        fontFamily: "Inter, sans-serif",
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "1rem",
    },
    copyAllBtn: {
        background: "#2563eb",
        color: "#fff",
        padding: "0.6rem 1.2rem",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "0.95rem",
        transition: "background 0.3s ease",
    },
    tableContainer: {
        overflowX: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.95rem",
    },
    thead: {
        background: "#f1f5f9",
        color: "#1e293b",
        textTransform: "uppercase",
    },
    th: {
        padding: "0.75rem",
        textAlign: "left",
        borderBottom: "2px solid #cbd5e1",
        fontWeight: "600",
        fontSize: "0.9rem",
    },
    tr: {
        borderBottom: "1px solid #e5e7eb",
        transition: "background 0.2s",
    },
    td: {
        padding: "0.75rem",
        color: "#334155",
        fontSize: "0.9rem",
        verticalAlign: "top",
    },
    link: {
        color: "#2563eb",
        textDecoration: "underline",
        fontWeight: "500",
    },
    loadingCell: {
        textAlign: "center",
        color: "#555",
        padding: "1rem",
    },
    noDataCell: {
        textAlign: "center",
        color: "#777",
        padding: "1rem",
    },
    btnCopy: {
        background: "#22c55e",
        color: "#fff",
        padding: "0.4rem 0.8rem",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        marginRight: "0.4rem",
    },
    btnDownload: {
        background: "#0ea5e9",
        color: "#fff",
        padding: "0.4rem 0.8rem",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        marginRight: "0.4rem",
    },
    btnDelete: {
        background: "#ef4444",
        color: "#fff",
        padding: "0.4rem 0.8rem",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
    },
};
