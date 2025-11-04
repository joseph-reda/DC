import React, { useState } from "react";

export default function RequestForm({ onSaved }) {
    const [form, setForm] = useState({
        irNo: "",
        irRev: "",
        irLatestRev: "",
        hypwr: "",
        workType: "",
        areaCode: "",
        companyCode: "",
        desc: "",
        location: "",
        receivedDate: "",
    });

    const [saving, setSaving] = useState(false);

    // 🟡 تحديث الحقول وتوليد الوصف
    function handleChange(e) {
        const { id, value } = e.target;
        setForm((prev) => {
            const updated = { ...prev, [id]: value };

            if (id === "workType" || id === "areaCode" || id === "companyCode") {
                updated.desc = `${updated.workType || ""}${updated.areaCode ? ` AT ${updated.areaCode}` : ""
                    }${updated.companyCode ? ` ${updated.companyCode}` : ""}`;
            }

            return updated;
        });
    }

    // 🟢 إرسال النموذج
    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.irNo.trim()) {
            alert("⚠️ Please enter Inspection Request No");
            return;
        }

        setSaving(true);
        try {
            await onSaved(form);
            alert("✅ Request saved successfully!");
            setForm({
                irNo: "",
                irRev: "",
                irLatestRev: "",
                hypwr: "",
                workType: "",
                areaCode: "",
                companyCode: "",
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
        <form className="request-form" onSubmit={handleSubmit}>
            <h3>📝 New Inspection Request</h3>

            <label>Inspection Request No:</label>
            <input
                id="irNo"
                value={form.irNo}
                onChange={handleChange}
                required
                placeholder="Enter IR number"
            />

            <label>IR Rev.:</label>
            <input id="irRev" value={form.irRev} onChange={handleChange} />

            <label>IR Latest Rev.:</label>
            <input id="irLatestRev" value={form.irLatestRev} onChange={handleChange} />

            <label>HYPWRLINK:</label>
            <input
                id="hypwr"
                value={form.hypwr}
                onChange={handleChange}
                placeholder="Paste hyperlink here"
            />

            <h4 style={{ marginTop: "1rem" }}>🧩 Description Builder</h4>

            {/* ✅ Work Type Dropdown */}
            <label>Type of Work:</label>
            <select
                id="workType"
                value={form.workType}
                onChange={handleChange}
                style={{ width: "100%", marginBottom: "0.5rem" }}
            >
                <option value="">-- Select Work Type --</option>
                <option value="FULL HEIGHT FOR MASONARY UNDER SOG">FULL HEIGHT FOR MASONARY UNDER SOG</option>
                <option value="FULL HEIGHT BLOCK WORK FOR MASONARY">FULL HEIGHT BLOCK WORK FOR MASONARY</option>
                <option value="FULL HEIGHT BLOCK WORK FOR 1ST FLOOR">FULL HEIGHT BLOCK WORK FOR 1ST FLOOR</option>
                <option value="FULL HEIGHT BLOCK WORK FOR 2ND FLOOR">FULL HEIGHT BLOCK WORK FOR 2ND FLOOR</option>
                <option value="FULL HEIGHT BLOCK WORK FOR 3RD FLOOR">FULL HEIGHT BLOCK WORK FOR 3RD FLOOR</option>
                <option value="FULL HEIGHT BLOCK WORK FOR 4TH FLOOR">FULL HEIGHT BLOCK WORK FOR 4TH FLOOR</option>
                <option value="FULL HEIGHT BLOCK WORK FOR GROUND FLOOR">FULL HEIGHT BLOCK WORK FOR GROUND FLOOR</option>
                <option value="FULL HEIGHT BLOCK WORK FOR ROOF FLOOR">FULL HEIGHT BLOCK WORK FOR ROOF FLOOR</option>
                <option value="1ST COURSE BLOCK WORK FOR GROUND FLOOR">1ST COURSE BLOCK WORK FOR GROUND FLOOR</option>
                <option value="1ST COURSE BLOCK WORK FOR 1ST FLOOR">1ST COURSE BLOCK WORK FOR 1ST FLOOR</option>
                <option value="1ST COURSE BLOCK WORK FOR 2ND FLOOR">1ST COURSE BLOCK WORK FOR 2ND FLOOR</option>
                <option value="1ST COURSE BLOCK WORK FOR 3RD FLOOR">1ST COURSE BLOCK WORK FOR 3RD FLOOR</option>
                <option value="1ST COURSE BLOCK WORK FOR 4TH FLOOR">1ST COURSE BLOCK WORK FOR 4TH FLOOR</option>
                <option value="1ST COURSE BLOCK WORK FOR ROOF FLOOR">1ST COURSE BLOCK WORK FOR ROOF FLOOR</option>
                <option value="FULL HEIGHT FOR 1ST FLOOR">FULL HEIGHT FOR 1ST FLOOR</option>
                <option value="SPATTER DASH AND DOTS FOR SIDE ELEVATION">SPATTER DASH AND DOTS FOR SIDE ELEVATION</option>
                <option value="FINAL PLASTER FOR FLAT NO. 2 1ST FLOOR MOCKUP (WITHOUT WET AREA)">
                    FINAL PLASTER FOR FLAT NO. 2 1ST FLOOR MOCKUP (WITHOUT WET AREA)
                </option>
                <option value="FINAL PLASTER FOR WET AREA FOR FLAT NO. 2 1ST FLOOR MOCKUP">
                    FINAL PLASTER FOR WET AREA FOR FLAT NO. 2 1ST FLOOR MOCKUP
                </option>
                <option value="FINAL PLASTER FOR CEILING OF FLAT NO. 2 1ST FLOOR MOCKUP">
                    FINAL PLASTER FOR CEILING OF FLAT NO. 2 1ST FLOOR MOCKUP
                </option>
                <option value="SURFACE PREPARATION & PRIMER COAT OF INSULATION FOR TERRACE AT MOCKUP FLAT NO. 2 1ST FLOOR">
                    SURFACE PREPARATION & PRIMER COAT OF INSULATION FOR TERRACE AT MOCKUP FLAT NO. 2 1ST FLOOR
                </option>
                <option value="PREPARATION FOR UPPER ROOF SLOPED CONCRETE">
                    PREPARATION FOR UPPER ROOF SLOPED CONCRETE
                </option>
                <option value="SURFACE PREPARATION BEFOR INSULATION FOR WET AREA">
                    SURFACE PREPARATION BEFOR INSULATION FOR WET AREA
                </option>
                <option value="INSULATION FOR MEMBRANE WORKS AND WATER TEST FOR UPPER ROOF FLOOR">
                    INSULATION FOR MEMBRANE WORKS AND WATER TEST FOR UPPER ROOF FLOOR
                </option>
                <option value="INSULATION FOR MEMBRANE WORKS FOR TERRACE AT MOCKUP FLAT NO. 2 1ST FLOOR">
                    INSULATION FOR MEMBRANE WORKS FOR TERRACE AT MOCKUP FLAT NO. 2 1ST FLOOR
                </option>
                <option value="CEMENTITIOUS INSULATION FOR WET AREA AT MOCKUP FLAT NO. 2 1ST FLOOR">
                    CEMENTITIOUS INSULATION FOR WET AREA AT MOCKUP FLAT NO. 2 1ST FLOOR
                </option>
                <option value="PRIMER COAT (SEALER) FOR CEILING OF FLAT 1ST FLOOR (MOCKUP)">
                    PRIMER COAT (SEALER) FOR CEILING OF FLAT 1ST FLOOR (MOCKUP)
                </option>
                <option value="PRIMER COAT (SEALER) FOR INTERNAL WALLS FOR FLAT 1ST FLOOR (MOCKUP)">
                    PRIMER COAT (SEALER) FOR INTERNAL WALLS FOR FLAT 1ST FLOOR (MOCKUP)
                </option>
                <option value="FIRST COAT PUTTY FOR INTERNAL WALLS FOR FLAT NO. 2 1ST FLOOR (MOCKUP)">
                    FIRST COAT PUTTY FOR INTERNAL WALLS FOR FLAT NO. 2 1ST FLOOR (MOCKUP)
                </option>
                <option value="FIRST COAT PUTTY FOR CEILING OF FLAT NO. 2 1ST FLOOR (MOCKUP)">
                    FIRST COAT PUTTY FOR CEILING OF FLAT NO. 2 1ST FLOOR (MOCKUP)
                </option>
                <option value="SECOND PUTTY FOR INTERNAL WALLS FOR FLAT NO. 2 1ST FLOOR (MOCKUP)">
                    SECOND PUTTY FOR INTERNAL WALLS FOR FLAT NO. 2 1ST FLOOR (MOCKUP)
                </option>
                <option value="SECOND PUTTY FOR CEILING OF FLAT NO. 2 1ST FLOOR (MOCKUP)">
                    SECOND PUTTY FOR CEILING OF FLAT NO. 2 1ST FLOOR (MOCKUP)
                </option>
                <option value="1ST FIX FOR GYPSUM BOARD FOR CEILING OF FLAT (MOCKUP) NO. 2">
                    1ST FIX FOR GYPSUM BOARD FOR CEILING OF FLAT (MOCKUP) NO. 2
                </option>
                <option value="WATER TEST OF INSULATION FOR FLAT NO. 2 1ST FLOOR (MOCKUP)">
                    WATER TEST OF INSULATION FOR FLAT NO. 2 1ST FLOOR (MOCKUP)
                </option>
            </select>

            <label>Area / Level Code:</label>
            <input
                id="areaCode"
                value={form.areaCode}
                onChange={handleChange}
                placeholder="Example: A6-04-03"
            />

            <label>Company Code:</label>
            <select id="companyCode" value={form.companyCode} onChange={handleChange}>
                <option value="">-- Select Company --</option>
                <option value="COR-CM">COR-CM</option>
                <option value="TRIO-CM">TRIO-CM</option>
                <option value="TRIO-C">TRIO-C</option>
                <option value="PARK-D">PARK-D</option>
            </select>

            <label>Final Description (auto-generated):</label>
            <input
                id="desc"
                value={form.desc}
                readOnly
                style={{ width: "100%", background: "#f7f7f7" }}
            />

            <label>Location:</label>
            <input
                id="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter location"
            />

            <label>Received Date:</label>
            <input
                type="date"
                id="receivedDate"
                value={form.receivedDate}
                onChange={handleChange}
            />

            <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "💾 Save Request"}
            </button>
        </form>
    );
}
