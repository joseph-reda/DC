// ضع هنا رابط Google Script الخاص بك
const scriptURL =
  "https://script.google.com/macros/s/AKfycbzE8eoPMRPQyV8pkSzOzRTTI3HKxdC-e7LPUu56IeAxR8gr1d0uwRjDvZ6wl-8-GYk/exec"; // إرسال البيانات إلى Google Sheet
function saveRequest(data) {
  return fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// جلب البيانات من Google Sheet
async function getRequests() {
  try {
    const res = await fetch(scriptURL, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Network response was not ok");
    const rows = await res.json();
    return rows.slice(1).map((r) => ({
      irNo: r[0],
      irRev: r[1],
      irLatestRev: r[2],
      hypwr: r[3],
      desc: r[4],
      location: r[5],
      receivedDate: r[6],
    }));
  } catch (error) {
    alert("❌ Error fetching data: " + error.message);
    return [];
  }
}

// نسخ صف واحد بتنسيق Excel
function copyRow(data) {
  const text = Object.values(data).join("\t");
  navigator.clipboard.writeText(text).then(() => {
    alert("✅ Row copied successfully!");
  });
}

// نسخ كل الصفوف
async function copyAllRows() {
  const rows = await getRequests();
  if (!rows.length) return alert("No rows found!");
  const text = rows.map((r) => Object.values(r).join("\t")).join("\n");
  navigator.clipboard.writeText(text).then(() => {
    alert("✅ All rows copied successfully!");
  });
}
