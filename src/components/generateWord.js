const downloadWord = async () => {
    try {
        const response = await fetch('https://nehrugamal09.pythonanywhere.com/generate-word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Date: '2025-11-19',
                SubmittalNo: 'SUB-001',
                Subject: 'Test document'
            }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const blob = await response.blob();

        // إنشاء رابط التنزيل
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SUB-001.docx';
        document.body.appendChild(a);
        a.click();
        a.remove();

        // تنظيف الـ URL بعد التنزيل
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Download error:", error);
    }
};
