const response = await fetch('https://nehrugamal09.pythonanywhere.com/generate-word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        Date: '2025-11-19',
        SubmittalNo: 'SUB-001',
        Subject: 'Test document'
    }),
});
const blob = await response.blob();
// تنزيل الملف
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'SUB-001.docx';
document.body.appendChild(a);
a.click();
a.remove();
