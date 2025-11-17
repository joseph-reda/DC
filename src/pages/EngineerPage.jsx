import React, { useState, useEffect } from "react";
import RequestForm from "../components/RequestForm";
import { saveRequest, listenRequests } from "../firebaseService";

export default function EngineerPage() {
    const [nextIR, setNextIR] = useState("BADYA-CON-A1-IR-ARCH-001");
    const [selectedProject, setSelectedProject] = useState(""); // مشروع مختار

    const PROJECTS = [
        "A6",
        "A6.FF",
        "A7",
        "A7-F.F",
        "A1",
        "A2",
        // أضف باقي المشاريع هنا
    ];

    // توليد رقم IR تلقائي
    useEffect(() => {
        const unsubscribe = listenRequests((data) => {
            if (!data || data.length === 0) {
                setNextIR("BADYA-CON-A1-IR-ARCH-001");
                return;
            }

            const last = data
                .map((r) => r.irNo)
                .filter(Boolean)
                .sort((a, b) => {
                    const numA = parseInt(a.match(/\d+$/)?.[0] || 0);
                    const numB = parseInt(b.match(/\d+$/)?.[0] || 0);
                    return numB - numA;
                })[0];

            const lastNum = parseInt(last.match(/\d+$/)?.[0] || 0);
            const nextNum = (lastNum + 1).toString().padStart(3, "0");
            setNextIR(`BADYA-CON-A1-IR-ARCH-${nextNum}`);
        });

        return () => unsubscribe && unsubscribe();
    }, []);

    // حفظ الطلب الجديد
    async function handleSave(formData) {
        try {
            if (!selectedProject) return alert("⚠️ Please select a project");

            const today = new Date().toISOString().split("T")[0];
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            const finalData = {
                ...formData,
                irNo: nextIR,
                irLatestRev: "L",
                hypwr: "HYPWRLINK",
                desc: formData.desc?.trim() || "No Description",
                receivedDate: formData.receivedDate || today,
                project: selectedProject, // إضافة المشروع
                department: user.department, // إضافة القسم
            };

            await saveRequest(finalData);
            alert(`✅ Request submitted successfully with No: ${nextIR}`);
        } catch (err) {
            console.error("❌ Error saving request:", err);
            alert("❌ Failed to submit request: " + (err.message || err));
        }
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50 py-12 px-4 font-sans">
            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
                👷 Engineer – Submit Inspection Request
            </h2>

            <div className="bg-white w-full max-w-2xl rounded-xl shadow-md p-6">
                {/* اختيار المشروع */}
                <div className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700">Select Project:</label>
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Select Project --</option>
                        {PROJECTS.map((proj) => (
                            <option key={proj} value={proj}>{proj}</option>
                        ))}
                    </select>
                </div>

                <RequestForm
                    onSaved={handleSave}
                    hiddenIR={true}
                    fixedIR={nextIR}
                    hideLatestRev={true}
                    hideHypwr={true}
                />
            </div>
        </div>
    );
}
