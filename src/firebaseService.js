import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, remove, onValue } from "firebase/database";

// ---------------- Firebase Config ----------------
const firebaseConfig = {
  apiKey: "AIzaSyDZCjiFFhhHeLvHHSPlil4xYxMV7ro6OVc",
  authDomain: "dc-contech.firebaseapp.com",
  databaseURL: "https://dc-contech-default-rtdb.firebaseio.com",
  projectId: "dc-contech",
  storageBucket: "dc-contech.firebasestorage.app",
  messagingSenderId: "368293059337",
  appId: "1:368293059337:web:794761aab198fc2b6311d8",
  measurementId: "G-HGLV4NXQHT",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const requestsRef = ref(db, "requests");

// ---------------- Helper Functions ----------------
function safeString(v, fallback = "") {
  if (v === null || v === undefined) return fallback;
  return String(v).trim().replace(/[\t\r\n]+/g, " ");
}

// ---------------- API FUNCTIONS ----------------

// 🟢 حفظ الطلب
export async function saveRequest(data) {
  const nowISO = new Date().toISOString().split("T")[0];
  const clean = {
    ...data,
    desc: data.desc?.trim() || "No Description", // Final Description
    location: data.location?.trim() || (data.area ? data.area : "Not Specified"),
    receivedDate: data.receivedDate || nowISO,
    irRev: data.irRev ?? "0",
    irLatestRev: data.irLatestRev ?? "L",
    hypwr: data.hypwr ?? "HYPWRLINK",
  };
  await push(requestsRef, clean);
}

// 🟣 جلب الطلبات بشكل فوري (Realtime)
export function listenRequests(callback) {
  return onValue(requestsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const list = Object.entries(data).map(([id, value]) => ({ id, ...value }));

    const normalized = list.map((r) => ({
      ...r,
      desc: r.desc || "No Description",
      location: r.location || (r.area ?? "Not Specified"),
      receivedDate: r.receivedDate || new Date().toISOString().split("T")[0],
    }));

    // ترتيب حسب التاريخ (الأحدث أولاً)
    normalized.sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate));
    callback(normalized);
  });
}

// 🔴 حذف الطلب
export async function deleteRequest(id) {
  if (!id) throw new Error("Missing id");
  const nodeRef = ref(db, `requests/${id}`);
  await remove(nodeRef);
}

// 🟢 نسخ صف واحد فقط
export async function copyRow(r) {
  if (!r) throw new Error("Invalid row data");
  const rowText = [
    safeString(r.irNo),
    safeString(r.irRev),
    safeString(r.hypwr),
    safeString(r.irLatestRev),
    "",
    safeString(r.desc),
    safeString(r.location),
    safeString(r.area),
    safeString(r.receivedDate),
  ].join("\t");

  await navigator.clipboard.writeText(rowText);
  return rowText;
}

// 🟢 نسخ كل الصفوف بالترتيب الصحيح
export async function copyAllRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("No rows to copy");

  const lines = rows.map((r) =>
    [
      safeString(r.irNo),
      safeString(r.irRev),
      safeString(r.hypwr),
      safeString(r.irLatestRev),
      "",
      safeString(r.desc),
      safeString(r.location),
      safeString(r.receivedDate),
    ].join("\t")
  );

  const allText = lines.join("\n");
  await navigator.clipboard.writeText(allText);
  return allText;
}
