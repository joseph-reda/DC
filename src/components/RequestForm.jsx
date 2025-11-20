import React, { useState, useEffect } from "react";

export default function RequestForm({
    onSaved,
    fixedIR,
    hiddenIR,
    locations = [],
    typesMap = {},
    generalDescriptions = [],
}) {

    const [form, setForm] = useState({
        irNo: fixedIR || "",
        irRev: "0",
        irLatestRev: "L",
        hypwr: "HYPWRLINK",
        desc: "",
        location: "",
        receivedDate: "",
        workType: "",
        area: "",
        generalDescription: "",
        finalDescription: "",
    });

    useEffect(() => {
        if (fixedIR) {
            setForm((prev) => ({ ...prev, irNo: fixedIR }));
        }
    }, [fixedIR]);

    // clear location if list changes
    useEffect(() => {
        if (form.location && !locations.includes(form.location)) {
            setForm((prev) => ({ ...prev, location: "", workType: "" }));
        }
        // eslint-disable-next-line
    }, [locations]);

    // when location selected, auto fill workType from typesMap
    useEffect(() => {
        if (form.location && typesMap && typesMap[form.location]) {
            setForm((prev) => {
                const newWorkType = typesMap[form.location];
                // also update finalDescription auto if generalDescription exists
                const finalAuto = prev.generalDescription
                    ? `${prev.generalDescription} - ${form.location} - ${newWorkType}`
                    : prev.finalDescription;
                return ({ ...prev, workType: newWorkType, finalDescription: finalAuto });
            });
        }
        // eslint-disable-next-line
    }, [form.location]);

    // when generalDescription selected, update finalDescription automatically (but still editable)
    useEffect(() => {
        if (form.generalDescription) {
            const t = form.workType || typesMap[form.location] || "";
            const finalAuto = `${form.generalDescription} - ${form.location || ""} - ${t}`;
            setForm((prev) => ({ ...prev, finalDescription: finalAuto }));
        }
        // eslint-disable-next-line
    }, [form.generalDescription]);

    function handleChange(e) {
        const { id, value } = e.target;
        setForm((prev) => ({ ...prev, [id]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.irNo) return alert("IR number is missing (select a project first)");
        if (!form.location) return alert("Please choose a location");
        if (!form.generalDescription) return alert("Please choose a General Description");
        // allow finalDescription to be custom (if user changed it)
        await onSaved(form);
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-white rounded-2xl shadow-md">
            {!hiddenIR && (
                <input id="irNo" value={form.irNo} onChange={handleChange} className="w-full p-3 border rounded-md bg-slate-100" readOnly />
            )}

            {/* Location dropdown (populated from backend) */}
            <div>
                <label className="block mb-1 text-gray-700">Location:</label>
                <select id="location" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} className="w-full p-2 border rounded-md">
                    <option value="">-- Select Location --</option>
                    {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                </select>
            </div>

            {/* General Description dropdown (managed in Admin, not editable here) */}
            <div>
                <label className="block mb-1 text-gray-700">General Description:</label>
                <select id="generalDescription" value={form.generalDescription} onChange={(e) => setForm((prev) => ({ ...prev, generalDescription: e.target.value }))} className="w-full p-2 border rounded-md">
                    <option value="">-- Select General Description --</option>
                    {generalDescriptions.map((d, idx) => (
                        <option key={idx} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {/* Type: HIDDEN (value still in form.workType for saving) */}
            <input type="hidden" id="workType" value={form.workType} />

            {/* Final Description (auto generated but editable) */}
            <div>
                <label className="block mb-1 text-gray-700">Final Description (editable):</label>
                <input id="finalDescription" value={form.finalDescription} onChange={handleChange} className="w-full p-2 border rounded-md" />
            </div>

            <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg mt-4">Save Request</button>
        </form>
    );
}
