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

    // 🗑️ حذف صف
    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            await onDeleteRow(id);
            alert("🗑️ Request deleted successfully!");
        } catch (err) {
            alert("❌ Failed to delete: " + err.message);
        }
    }

    // 📋 نسخ صف
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

    // 💾 تحميل Word
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
        <div className="w-[95%] mx-auto my-6 bg-white rounded-2xl shadow-lg p-4 sm:p-6 overflow-hidden">
            {/* 🔹 الأزرار العلوية */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleCopyAll}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 active:scale-[0.97]"
                >
                    📋 Copy All
                </button>
            </div>

            {/* 🔸 الجدول */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                        <tr>
                            <th className="p-3 text-left font-semibold border-b">IR No</th>
                            <th className="p-3 text-left font-semibold border-b">IR Rev.</th>
                            <th className="p-3 text-left font-semibold border-b">
                                Latest Rev.
                            </th>
                            <th className="p-3 text-left font-semibold border-b">HYPWRLINK</th>
                            <th className="p-3 text-left font-semibold border-b w-[250px]">
                                Description
                            </th>
                            <th className="p-3 text-left font-semibold border-b">Location</th>
                            <th className="p-3 text-left font-semibold border-b">
                                Received Date
                            </th>
                            <th className="p-3 text-center font-semibold border-b">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-slate-500">
                                    ⏳ Loading requests...
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-slate-500">
                                    No requests found
                                </td>
                            </tr>
                        ) : (
                            rows.map((r, idx) => (
                                <tr
                                    key={r.id || idx}
                                    className={`border-b transition-colors duration-150 ${idx % 2 === 0 ? "bg-slate-50" : "bg-white"
                                        } hover:bg-slate-100`}
                                >
                                    <td className="p-3">{r.irNo || "-"}</td>
                                    <td className="p-3">{r.irRev || "-"}</td>
                                    <td className="p-3">{r.irLatestRev || "-"}</td>
                                    <td className="p-3">
                                        {r.hypwr ? (
                                            <a
                                                href={r.hypwr}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                Link
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="p-3 break-words max-w-[280px]">{r.desc || "-"}</td>
                                    <td className="p-3">{r.location || "-"}</td>
                                    <td className="p-3">{r.receivedDate || "-"}</td>

                                    <td className="p-3 text-center space-x-2">
                                        <button
                                            onClick={() => handleCopyRow(r)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-xs transition-all duration-200"
                                            title="Copy Row"
                                        >
                                            📋
                                        </button>
                                        <button
                                            onClick={() => handleDownloadWord(r)}
                                            className="bg-sky-500 hover:bg-sky-600 text-white px-2 py-1 rounded-md text-xs transition-all duration-200"
                                            title="Download Word"
                                        >
                                            💾
                                        </button>
                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs transition-all duration-200"
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
