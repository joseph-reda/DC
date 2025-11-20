import React, { useEffect, useState } from "react";
import {
    listenRequests,
    deleteRequest,
    copyRow,
    copyAllRows,
} from "../firebaseService";

export default function DcPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🟢 الاستماع المباشر للطلبات من Firebase
    useEffect(() => {
        const unsubscribe = listenRequests((data) => {
            setRequests(data);
            setLoading(false);
        });
        return () => unsubscribe && unsubscribe();
    }, []);

    // 🗑️ حذف طلب
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
            alert("❌ Failed to copy row: " + (err.message || err));
        }
    }

    // 📋 نسخ كل الصفوف
    async function handleCopyAll() {
        try {
            if (requests.length === 0) return alert("⚠️ No data to copy");
            await copyAllRows(requests);
            alert("✅ All rows copied successfully!");
        } catch (err) {
            alert("❌ Failed to copy all rows: " + (err.message || err));
        }
    }

    // 💾 تنزيل Word من PythonAnywhere — يعمل دائماً من أي جهاز
    async function handleDownloadWord(request) {
        try {
            const response = await fetch("https://nehrugamal09.pythonanywhere.com/generate-word", {
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
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <h2 className="text-2xl font-bold text-blue-700 text-center mb-6">
                📁 Document Controller – All Inspection Requests
            </h2>

            {/* 🔹 Copy All */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleCopyAll}
                    className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
                >
                    📋 Copy All
                </button>
            </div>

            {/* 🔸 Table */}
            {loading ? (
                <p className="text-center text-gray-500 italic">⏳ Loading requests...</p>
            ) : requests.length === 0 ? (
                <p className="text-center text-gray-500 italic">No requests found.</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-md p-3">
                    <table className="w-full border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-300 text-gray-700 uppercase text-sm">
                                <th className="text-left px-4 py-2">IR No</th>
                                <th className="text-left px-4 py-2">Department</th>
                                <th className="text-left px-4 py-2">Project</th>
                                <th className="text-left px-4 py-2">Description</th>
                                <th className="text-left px-4 py-2">Location</th>
                                <th className="text-left px-4 py-2">Received Date</th>
                                <th className="text-center px-4 py-2">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {requests.map((r, idx) => (
                                <tr
                                    key={r.id || idx}
                                    className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                        }`}
                                >
                                    <td className="px-4 py-2">{r.irNo}</td>
                                    <td className="px-4 py-2">{r.department}</td>
                                    <td className="px-4 py-2">{r.project}</td>
                                    <td className="px-4 py-2">{r.desc}</td>
                                    <td className="px-4 py-2">{r.location}</td>
                                    <td className="px-4 py-2">{r.receivedDate}</td>

                                    <td className="px-4 py-2 text-center space-x-2">
                                        <button
                                            onClick={() => handleCopyRow(r)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                                        >
                                            📋 Copy
                                        </button>

                                        <button
                                            onClick={() => handleDownloadWord(r)}
                                            className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded-md text-sm"
                                        >
                                            💾 Download
                                        </button>

                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                                        >
                                            🗑️ Delete
                                        </button>
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
