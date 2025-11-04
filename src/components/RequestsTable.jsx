import React, { useEffect, useState } from "react";

export default function RequestsTable({ onListen, onCopyRow, onCopyAll, onDeleteRow }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🟡 الاستماع لتحديثات Firebase
    useEffect(() => {
        const unsubscribe = onListen((data) => {
            setRows(data);
            setLoading(false);
        });
        return () => unsubscribe && unsubscribe();
    }, [onListen]);

    // 🔴 حذف صف واحد
    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            await onDeleteRow(id);
            alert("🗑️ Deleted successfully!");
        } catch (err) {
            alert("❌ Failed to delete: " + err.message);
        }
    }

    // 🔵 نسخ صف واحد
    async function handleCopyRow(row) {
        try {
            await onCopyRow(row);
            alert("✅ Copied row to clipboard!");
        } catch {
            alert("❌ Failed to copy row");
        }
    }

    // 🟣 نسخ جميع الصفوف
    async function handleCopyAll() {
        if (rows.length === 0) {
            alert("⚠️ No data to copy");
            return;
        }
        try {
            await onCopyAll(rows);
            alert("✅ All rows copied to clipboard!");
        } catch {
            alert("❌ Failed to copy all rows");
        }
    }

    return (
        <div
            className="requests-table"
            style={{
                width: "95%",
                margin: "2rem auto",
                background: "#fff",
                borderRadius: "10px",
                padding: "1rem",
                boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
            }}
        >
            {/* 🔹 أزرار التحكم */}
            <div
                className="actions"
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "1rem",
                    marginBottom: "1rem",
                }}
            >
                <button
                    onClick={handleCopyAll}
                    style={{
                        background: "#2563eb",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "500",
                    }}
                >
                    📋 Copy All
                </button>
            </div>

            {/* 🔸 الجدول */}
            <table
                border="1"
                cellPadding="8"
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    fontSize: "0.95rem",
                }}
            >
                <thead style={{ background: "#f1f5f9", fontWeight: "bold" }}>
                    <tr>
                        <th>IR No</th>
                        <th>IR Rev.</th>
                        <th>Latest Rev.</th>
                        <th>HYPWRLINK</th>
                        <th>Description</th>
                        <th>Location</th>
                        <th>Received Date</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center", color: "#555" }}>
                                ⏳ Loading...
                            </td>
                        </tr>
                    ) : rows.length === 0 ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center", color: "#888" }}>
                                No data found
                            </td>
                        </tr>
                    ) : (
                        rows.map((r) => (
                            <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td>{r.irNo || "-"}</td>
                                <td>{r.irRev || "-"}</td>
                                <td>{r.irLatestRev || "-"}</td>
                                <td>
                                    {r.hypwr ? (
                                        <a
                                            href={r.hypwr}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: "#2563eb",
                                                textDecoration: "underline",
                                            }}
                                        >
                                            Link
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                                <td style={{ maxWidth: "250px", whiteSpace: "normal" }}>{r.desc || "-"}</td>
                                <td>{r.location || "-"}</td>
                                <td>{r.receivedDate || "-"}</td>

                                <td style={{ textAlign: "center" }}>
                                    <button
                                        onClick={() => handleCopyRow(r)}
                                        style={{
                                            marginRight: "0.5rem",
                                            background: "#22c55e",
                                            color: "#fff",
                                            border: "none",
                                            padding: "0.3rem 0.7rem",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        📄 Copy
                                    </button>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        style={{
                                            background: "#ef4444",
                                            color: "#fff",
                                            border: "none",
                                            padding: "0.3rem 0.7rem",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
