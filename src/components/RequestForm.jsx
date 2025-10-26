import React, { useState } from "react";

export default function RequestForm({ onSaved }) {
    const [form, setForm] = useState({
        irNo: "",
        irRev: "",
        irLatestRev: "",
        hypwr: "",
        desc: "",
        location: "",
        receivedDate: "",
    });

    const [saving, setSaving] = useState(false);

    // 🟡 تحديث الحقول عند الكتابة
    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    }

    // 🟢 حفظ الطلب الجديد
    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await onSaved(form);
            alert("✅ Request saved successfully!");
            // إعادة تعيين الحقول بعد الحفظ
            setForm({
                irNo: "",
                irRev: "",
                irLatestRev: "",
                hypwr: "",
                desc: "",
                location: "",
                receivedDate: "",
            });
        } catch (err) {
            alert("❌ Error saving request: " + (err.message || err));
        } finally {
            setSaving(false);
        }
    }

    return (
        <form
            className="request-form"
            onSubmit={handleSubmit}
            style={{
                maxWidth: "600px",
                margin: "2rem auto",
                background: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
        >
            <h3 style={{ textAlign: "center", color: "#1e3a8a" }}>
                📝 New Inspection Request
            </h3>

            {[
            ].map((f) => (
                <div key={f.id} style={{ marginBottom: "0.75rem" }}>
                    <label htmlFor={f.id} style={{ display: "block", fontWeight: "600" }}>
                        {f.label}:
                    </label>
                    <input
                        id={f.id}
                        type={f.type}
                        value={form[f.id]}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        style={{
                            width: "100%",
                            padding: "0.5rem",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            marginTop: "0.3rem",
                        }}
                    />
                </div>
            ))}

            <div style={{ marginBottom: "0.75rem" }}>
                <label htmlFor="desc" style={{ display: "block", fontWeight: "600" }}>
                    Description:
                </label>
                <textarea
                    id="desc"
                    rows="2"
                    value={form.desc}
                    onChange={handleChange}
                    placeholder="Enter short description"
                    style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        marginTop: "0.3rem",
                    }}
                />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
                <label htmlFor="location" style={{ display: "block", fontWeight: "600" }}>
                    Location:
                </label>
                <input
                    id="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                    style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        marginTop: "0.3rem",
                    }}
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="receivedDate" style={{ display: "block", fontWeight: "600" }}>
                    Received Date:
                </label>
                <input
                    type="date"
                    id="receivedDate"
                    value={form.receivedDate}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        marginTop: "0.3rem",
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={saving}
                style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    backgroundColor: saving ? "#94a3b8" : "#2563eb",
                    color: "#fff",
                    border: "none",
                    fontSize: "1rem",
                    cursor: saving ? "not-allowed" : "pointer",
                    transition: "0.3s",
                }}
            >
                {saving ? "Saving..." : "💾 Save Request"}
            </button>
        </form>
    );
}
