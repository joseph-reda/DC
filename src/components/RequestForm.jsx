import React, { useState, useEffect } from "react";

export default function RequestForm({ onSaved }) {
    const [form, setForm] = useState({
        irNo: "",
        irRev: "0",
        irLatestRev: "L",
        hypwr: "HYPWRLINK",
        desc: "",
        location: "",
        receivedDate: "",
        workType: "",
        area: "",
    });

    const [saving, setSaving] = useState(false);

    // 🟢 توليد رقم IR تلقائي عند التحميل
    useEffect(() => {
        async function generateNextIRNo() {
            try {
                const res = await fetch("/api/get-last-ir"); // مثال يمكن تغييره حسب Firebase
                const lastNum = await res.json();
                const nextIR = `BADYA-CON-A1-IR-ARCH-${(lastNum + 1).toString().padStart(3, "0")}`;
                setForm((prev) => ({ ...prev, irNo: nextIR }));
            } catch {
                setForm((prev) => ({ ...prev, irNo: "BADYA-CON-A1-IR-ARCH-001" }));
            }
        }
        generateNextIRNo();
    }, []);

    // 🟡 تحديث القيم + توليد Final Description تلقائي
    function handleChange(e) {
        const { id, value } = e.target;
        setForm((prev) => {
            const updated = { ...prev, [id]: value };

            if (["workType", "location", "area"].includes(id)) {
                updated.desc = [
                    updated.workType || "",
                    updated.location ? `AT ${updated.location}` : "",
                    updated.area ? `(${updated.area})` : "",
                ].filter(Boolean).join(" ");
            }

            return updated;
        });
    }

    // 🟢 حفظ الطلب
    async function handleSubmit(e) {
        e.preventDefault();
        const today = new Date().toISOString().split("T")[0];

        const finalData = {
            ...form,
            receivedDate: form.receivedDate || today,
            desc: form.desc?.trim() || "No Description", // Final Description
        };

        try {
            setSaving(true);
            await onSaved(finalData);
            alert("✅ Request saved successfully!");
        } catch (err) {
            alert("❌ Error saving request: " + (err.message || err));
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.header}>📝 New Inspection Request</h3>

            <input type="hidden" id="irNo" value={form.irNo} readOnly />
            <input type="hidden" id="irLatestRev" value="L" readOnly />
            <input type="hidden" id="hypwr" value="HYPWRLINK" readOnly />

            {/* <label style={styles.label}>IR Rev.:</label>
            <input id="irRev" value={form.irRev} onChange={handleChange} style={styles.input} /> */}

            <label style={styles.label}>Type of Work:</label>
            <select id="workType" value={form.workType} onChange={handleChange} style={styles.select}>
                <option value="">-- Select Description --</option>
                <option value="FULL HEIGHT BLOCK WORK">FULL HEIGHT BLOCK WORK</option>
                <option value="FINAL PLASTER">FINAL PLASTER</option>
                <option value="GYPSUM BOARD CEILING">GYPSUM BOARD CEILING</option>
            </select>

            <label style={styles.label}>Location:</label>
            <input id="location" value={form.location} onChange={handleChange} placeholder="Example: A6-04-03" style={styles.input} />

            <label style={styles.label}>Area:</label>
            <select id="area" value={form.area} onChange={handleChange} style={styles.select}>
                <option value="">-- Select Area --</option>
                <option value="COR-CM">COR-CM</option>
                <option value="TRIO-CM">TRIO-CM</option>
                <option value="TRIO-C">TRIO-C</option>
            </select>

            <label style={styles.label}>Final Description (editable):</label>
            <input id="desc" value={form.desc} onChange={handleChange} placeholder="Enter or edit final description" style={styles.inputDesc} />

            {/* <label style={styles.label}>Received Date:</label>
            <input type="date" id="receivedDate" value={form.receivedDate} onChange={handleChange} style={styles.input} /> */}

            <button type="submit" disabled={saving} style={styles.submitBtn}>
                {saving ? "Saving..." : "💾 Save Request"}
            </button>
        </form>
    );
}

// 🎨 Styles
const styles = {
    form: { display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1.5rem", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", maxWidth: "650px", margin: "auto" },
    header: { textAlign: "center", fontSize: "1.3rem", fontWeight: "600", color: "#2563eb", marginBottom: "0.5rem" },
    label: { fontWeight: "500", color: "#1e293b", marginBottom: "0.2rem" },
    input: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" },
    select: { padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", background: "#f8fafc" },
    inputDesc: { padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", background: "#f9fafb" },
    submitBtn: { marginTop: "1rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "0.75rem", cursor: "pointer", fontWeight: "600", fontSize: "1rem", transition: "background 0.3s ease" },
};
