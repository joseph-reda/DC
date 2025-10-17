const scriptURL =
  "https://script.google.com/macros/s/AKfycbyZJf3pwvOusjSmz9EIrCe6xYkMBzijw4KY2V6RTps4yZvhR33nwxF1sIffUosaAOk/exec";

// إرسال البيانات إلى Google Sheet
async function saveRequest(data) {
  const form = new FormData();
  for (const key in data) {
    form.append(key, data[key]);
  }

  await fetch(scriptURL, {
    method: "POST",
    body: form,
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
