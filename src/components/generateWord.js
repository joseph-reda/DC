// -------------------------
//    GENERATE WORD FILE
// -------------------------
export async function downloadWord(ir) {
    const API = "https://nehrugamal09.pythonanywhere.com";

const payload = {
    receivedDate: ir.receivedDate || "",
    irNo: ir.irNo || "",
    desc: ir.desc || ""
};


    const res = await fetch(`${API}/generate-word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error("Failed to generate file");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${ir.irNo}.docx`;
    a.click();

    window.URL.revokeObjectURL(url);
}
