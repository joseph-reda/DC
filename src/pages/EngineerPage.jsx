import React, { useEffect, useState } from "react";
import RequestForm from "../components/RequestForm";
import { saveRequest, listenRequests } from "../firebaseService";

export default function EngineerPage() {
    const [nextIR, setNextIR] = useState("BADYA-CON-A1-IR-ARCH-001");

    // 🟢 توليد رقم IR تلقائي بناءً على آخر رقم محفوظ
    useEffect(() => {
        const unsubscribe = listenRequests((data) => {
            if (!data || data.length === 0) {
                setNextIR("BADYA-CON-A1-IR-ARCH-001");
                return;
            }

            // 🔹 استخراج آخر رقم IR وحساب الرقم التالي
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
                irNo: nextIR, // رقم تلقائي
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
        <div style={styles.container}>
            <h2 style={styles.title}>👷 Engineer – Submit Inspection Request</h2>

            <div style={styles.card}>
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

// 🎨 تنسيقات احترافية ومتناغمة
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "3rem 1rem",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
    },
    title: {
        color: "#2563eb",
        fontSize: "1.6rem",
        fontWeight: "700",
        marginBottom: "1.5rem",
        textAlign: "center",
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
        padding: "2rem 1.5rem",
        width: "100%",
        maxWidth: "700px",
    },
};
