import { useEffect, useState } from "react";
import { copyRow, copyAllRows } from "../firebaseService";

export default function DcPage() {
    const API = "https://nehrugamal09.pythonanywhere.com";

    const [irs, setIRs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [toast, setToast] = useState(""); 

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(""), 1500);
    }

    // Load all IRs
    useEffect(() => {
        fetch(`${API}/irs`)
            .then(res => res.json())
            .then(data => {
                setIRs(data.irs || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    function logout() {
        localStorage.removeItem("user");
        window.location.href = "/login";
    }

    // Group by project -> department
    const grouped = {};
    for (const ir of irs) {
        if (!grouped[ir.project]) grouped[ir.project] = {};
        if (!grouped[ir.project][ir.department]) grouped[ir.project][ir.department] = [];
        grouped[ir.project][ir.department].push(ir);
    }

    async function handleCopy(ir) {
        await copyRow(ir);
        showToast("✔ Copied!");
    }

    async function handleCopyAll(list) {
        await copyAllRows(list);
        showToast("✔ All Rows Copied!");
    }

    // ***************************************
    // FIXED WORD DOWNLOAD FUNCTION
    // ***************************************
    async function handleDownloadWord(ir) {
        try {
            const res = await fetch(`${API}/generate-word`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    irNo: ir.irNo,
                    desc: ir.desc,
                    receivedDate: ir.receivedDate
                })
            });

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${ir.irNo}.docx`;
            a.click();
            a.remove();

            showToast("✔ Word File Downloaded!");

        } catch (e) {
            alert("Download failed");
        }
    }

    async function handleDelete(ir) {
        if (!window.confirm(`Are you sure you want to delete ${ir.irNo}?`))
            return;

        try {
            const res = await fetch(`${API}/irs?irNo=${encodeURIComponent(ir.irNo)}`, {
                method: "DELETE"
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Delete failed");

            setIRs(prev => prev.filter(x => x.irNo !== ir.irNo));

            showToast("✔ IR Deleted!");

        } catch (err) {
            alert("❌ Delete failed: " + err.message);
        }
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

            {toast && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
                    {toast}
                </div>
            )}

            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold text-blue-700">
                    Document Controller — IR Records
                </h1>
                <button onClick={logout} className="px-3 py-1 bg-red-600 text-white rounded">
                    Logout
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : Object.keys(grouped).length === 0 ? (
                <p>No IRs found</p>
            ) : (
                Object.keys(grouped).map(project => (
                    <div key={project} className="mb-10 bg-white p-5 rounded-xl shadow-md">

                        <h2 className="text-xl font-bold text-green-700 mb-3">
                            📌 Project: {project}
                        </h2>

                        {Object.keys(grouped[project]).map(dept => {
                            const list = grouped[project][dept];

                            return (
                                <div key={dept} className="mb-6 border-l-4 border-blue-600 pl-4">

                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                        🏗️ Department: {dept}
                                    </h3>

                                    <button
                                        onClick={() => handleCopyAll(list)}
                                        className="bg-blue-700 text-white px-4 py-2 rounded-lg mb-2"
                                    >
                                        📋 Copy All ({list.length})
                                    </button>

                                    <div className="overflow-x-auto">
                                        <table className="w-full bg-white border rounded">
                                            <thead className="bg-gray-200">
                                                <tr>
                                                    <th className="p-2">IR No</th>
                                                    <th className="p-2">Description</th>
                                                    <th className="p-2">Location</th>
                                                    <th className="p-2">Date</th>
                                                    <th className="p-2 text-center">Actions</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {list.map((ir, i) => (
                                                    <tr key={i} className="border-b">
                                                        <td className="p-2">{ir.irNo}</td>
                                                        <td className="p-2">{ir.desc}</td>
                                                        <td className="p-2">{ir.location}</td>
                                                        <td className="p-2">{ir.receivedDate}</td>

                                                        <td className="p-2 text-center space-x-2">
                                                            <button
                                                                onClick={() => handleCopy(ir)}
                                                                className="bg-green-600 text-white px-3 py-1 rounded"
                                                            >
                                                                📋 Copy
                                                            </button>

                                                            <button
                                                                onClick={() => handleDownloadWord(ir)}
                                                                className="bg-indigo-600 text-white px-3 py-1 rounded"
                                                            >
                                                                💾 Word
                                                            </button>

                                                            <button
                                                                onClick={() => handleDelete(ir)}
                                                                className="bg-red-600 text-white px-3 py-1 rounded"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ))
            )}
        </div>
    );
}
