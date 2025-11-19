async function generateWord() {
  const response = await fetch(
    "https://nehrugamal09.pythonanywhere.com/generate-word",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Date: "2025-11-19",
        SubmittalNo: "SUB-001",
        Subject: "Test document",
      }),
    }
  );

  if (!response.ok) {
    console.error("Error generating Word:", await response.json());
    return;
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Document.docx";
  a.click();
  window.URL.revokeObjectURL(url);
}
