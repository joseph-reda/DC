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
                const res = await fetch("/api/get-last-ir");
                const lastNum = await res.json();
                const nextIR = `BADYA-CON-A1-IR-ARCH-${(lastNum + 1)
                    .toString()
                    .padStart(3, "0")}`;
                setForm((prev) => ({ ...prev, irNo: nextIR }));
            } catch {
                setForm((prev) => ({
                    ...prev,
                    irNo: "BADYA-CON-A1-IR-ARCH-001",
                }));
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
                ]
                    .filter(Boolean)
                    .join(" ");
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
            desc: form.desc?.trim() || "No Description",
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
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 p-6 bg-white rounded-2xl shadow-md max-w-lg mx-auto my-6 w-[95%] sm:w-[90%]"
        >
            <h3 className="text-center text-xl font-semibold text-blue-600 mb-2">
                📝 New Inspection Request
            </h3>

            <input type="hidden" id="irNo" value={form.irNo} readOnly />
            <input type="hidden" id="irLatestRev" value="L" readOnly />
            <input type="hidden" id="hypwr" value="HYPWRLINK" readOnly />

            {/* Type of Work */}
            <div>
                <label
                    htmlFor="workType"
                    className="block text-sm font-medium text-slate-700 mb-1"
                >
                    Type of Work:
                </label>
                <select
                    id="workType"
                    value={form.workType}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-md border border-slate-300 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                    <option value="">-- Select Description --</option>
                    <option value="FULL HEIGHT BIOCKWORK UNDER SOG">
                        FULL HEIGHT BIOCKWORK UNDER SOG
                    </option>
                    <option value="1st COURSE BIOCKWORK FOR 1st FLOOR">
                        1st COURSE BIOCKWORK FOR 1st FLOOR
                    </option>
                    <option value="1st COURSE FOR 1st FLOOR">
                        1st COURSE FOR 1st FLOOR
                    </option>
                    <option value="1st First Course For 2ND Floor">
                        1st First Course For 2ND Floor
                    </option>
                </select>
            </div>

            {/* Location */}
            <div>
                <label
                    htmlFor="location"
                    className="block text-sm font-medium text-slate-700 mb-1"
                >
                    Location:
                </label>
                <select
                    id="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-md border border-slate-300 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                    <option value="">-- Select Location --</option>
                    {[
                        "A1-03-01",
                        "A1-03-02",
                        "A1-03-03",
                        "A1-03-04",
                        "A1-03-05",
                        "A1-03-06",
                        "A1-03-07",
                    ].map((loc) => (
                        <option key={loc} value={loc}>
                            {loc}
                        </option>
                    ))}
                </select>
            </div>

            {/* Type */}
            <div>
                <label
                    htmlFor="area"
                    className="block text-sm font-medium text-slate-700 mb-1"
                >
                    Type:
                </label>
                <select
                    id="area"
                    value={form.area}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-md border border-slate-300 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                    <option value="">-- Select Area --</option>
                    <option value="TRIO-CM">TRIO-CM</option>
                    <option value="TRIO-C">TRIO-C</option>
                    <option value="COR-CM">COR-C</option>
                </select>
            </div>

            {/* Final Description */}
            <div>
                <label
                    htmlFor="desc"
                    className="block text-sm font-medium text-slate-700 mb-1"
                >
                    Final Description (editable):
                </label>
                <input
                    id="desc"
                    value={form.desc}
                    onChange={handleChange}
                    placeholder="Enter or edit final description"
                    className="w-full p-3 rounded-md border border-slate-300 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={saving}
                className={`mt-3 w-full py-3 rounded-lg text-white font-semibold text-base transition-all duration-200 ${saving
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                    }`}
            >
                {saving ? "Saving..." : "💾 Save Request"}
            </button>
        </form>
    );
}
