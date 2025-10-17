// ضع هنا رابط Google Script الخاص بك
const scriptURL = "https://script.google.com/macros/s/AKfycbx9R-53K7tvfbc_KO-jOLtdxPKlqxtfFwUQMNjavSK803g27c9rQnTWJIdh8A5ZMkAu/exec";

// إرسال البيانات إلى Google Sheet
function saveRequest(data) {
  return fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// جلب البيانات من Google Sheet
async function getRequests() {
  const res = await fetch(scriptURL);
  const rows = await res.json();
  return rows.slice(1).map(r => ({
    irNo: r[0],
    irRev: r[1],
    irLatestRev: r[2],
    hypwr: r[3],
    desc: r[4],
    location: r[5],
    receivedDate: r[6],
  }));
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
  const text = rows.map(r => Object.values(r).join("\t")).join("\n");
  navigator.clipboard.writeText(text).then(() => {
    alert("✅ All rows copied successfully!");
  });
}
