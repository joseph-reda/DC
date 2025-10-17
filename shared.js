// حفظ الطلبات
function saveRequest(data) {
  const all = JSON.parse(localStorage.getItem("inspection_requests")) || [];
  all.push(data);
  localStorage.setItem("inspection_requests", JSON.stringify(all));
}

// قراءة الطلبات
function getRequests() {
  return JSON.parse(localStorage.getItem("inspection_requests")) || [];
}

// نسخ صف واحد
function copyRow(data) {
  const values = [
    data.irNo || "",
    data.irRev || "",
    data.irLatestRev || "",
    data.hypwr || "",
    data.desc || "",
    data.location || "",
    data.receivedDate || "",
  ];
  const text = values.join("\t");
  navigator.clipboard.writeText(text).then(() => {
    alert("✅ Row copied successfully!");
  });
}

// نسخ كل الصفوف
function copyAllRows() {
  const rows = getRequests();
  if (!rows.length) return alert("No rows to copy!");
  const lines = rows.map((r) =>
    [
      r.irNo,
      r.irRev,
      r.irLatestRev,
      r.hypwr,
      r.desc,
      r.location,
      r.receivedDate,
    ].join("\t")
  );
  navigator.clipboard.writeText(lines.join("\n")).then(() => {
    alert("✅ All rows copied successfully!");
  });
}
