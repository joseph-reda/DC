export async function generateWordFile(request) {
    try {
        const response = await fetch(
            "https://nehrugamal09.pythonanywhere.com/generate-word",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Date: request.receivedDate || "",
                    SubmittalNo: request.irNo || "",
                    Subject: request.desc || "",
                }),
            }
        );

        if (!response.ok) throw new Error("Server error");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${request.irNo}.docx`;
        a.click();
        a.remove();
    } catch (err) {
        console.error(err);
        alert("❌ Failed to generate Word file");
    }
}
