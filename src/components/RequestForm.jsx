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
        if (fixedIR) setForm(prev => ({ ...prev, irNo: fixedIR }));
    }, [fixedIR]);

    useEffect(() => {
        if (form.location && typesMap && typesMap[form.location]) {
            setForm(prev => {
                const newWT = typesMap[form.location];
                const finalAuto = prev.generalDescription ? `${prev.generalDescription} - ${form.location} - ${newWT}` : prev.finalDescription;
                return { ...prev, workType: newWT, finalDescription: finalAuto };
            });
        }
    }, [form.location, typesMap]);

    useEffect(() => {
        if (form.generalDescription) {
            const t = form.workType || typesMap[form.location] || "";
            const finalAuto = `${form.generalDescription} - ${form.location || ""} - ${t}`;
            setForm(prev => ({ ...prev, finalDescription: finalAuto }));
        }
    }, [form.generalDescription]);

    function handleChange(e) {
        const { id, value } = e.target;
        setForm(prev => ({ ...prev, [id]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.irNo) return alert("IR missing");
        if (!form.location) return alert("choose location");
        if (!form.generalDescription) return alert("choose general description");
        await onSaved(form);
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-white rounded-2xl shadow-md">
            {!hiddenIR && <input id="irNo" value={form.irNo} readOnly className="w-full p-3 border rounded-md bg-slate-100" />}

            <div>
                <label className="block mb-1 text-gray-700">Location:</label>
                <select id="location" value={form.location} onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))} className="w-full p-2 border rounded-md">
                    <option value="">-- Select Location --</option>
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
            </div>

            <div>
                <label className="block mb-1 text-gray-700">General Description:</label>
                <select id="generalDescription" value={form.generalDescription} onChange={(e) => setForm(prev => ({ ...prev, generalDescription: e.target.value }))} className="w-full p-2 border rounded-md">
                    <option value="">-- Select General Description --</option>
                    {generalDescriptions.map((d, i) => <option key={i} value={d}>{d}</option>)}
                </select>
            </div>

            {/* hidden Type */}
            <input type="hidden" id="workType" value={form.workType} />

            <div>
                <label className="block mb-1 text-gray-700">Final Description (editable):</label>
                <input id="finalDescription" value={form.finalDescription} onChange={handleChange} className="w-full p-2 border rounded-md" />
            </div>

            <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg mt-4">Save Request</button>
        </form>
    );
}
