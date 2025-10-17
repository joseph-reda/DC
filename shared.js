const scriptURL =
  "https://script.google.com/macros/s/AKfycbyzChOzf3y6ENY0KeAW46cyFS1oPexVch9Av1_G5FXh986gVq0cQTOzhBv-HrddnSc/exec";

// إرسال البيانات إلى Google Sheet
function saveRequest(data) {
  return fetch(scriptURL, {
    method: "POST",
    mode: "no-cors", // 👈 يمنع المتصفح من حظر الاتصال
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

// قراءة الطلبات من Google Sheet
async function getRequests() {
  const res = await fetch(scriptURL);
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
}

// نسخ صف واحد
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
