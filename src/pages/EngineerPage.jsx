import React, { useEffect, useState } from "react";
import RequestForm from "../components/RequestForm";
import { saveRequest, listenRequests } from "../firebaseService";

export default function EngineerPage() {
    const [nextIR, setNextIR] = useState("BADYA-CON-A1-IR-ARCH-001");

    // 🟢 توليد رقم IR تلقائي
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

    // 💾 حفظ الطلب الجديد
    async function handleSave(formData) {
        try {
            const today = new Date().toISOString().split("T")[0];

            const finalData = {
                ...formData,
                irNo: nextIR,
                irLatestRev: "L",
                hypwr: "HYPWRLINK",
                desc: formData.desc?.trim() || "No Description",
                receivedDate: formData.receivedDate || today,
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
