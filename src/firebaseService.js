// ✅ Firebase setup
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  get,
  remove,
  onValue,
} from "firebase/database";

// ⚙️ إعدادات Firebase
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

// ✅ تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const requestsRef = ref(db, "requests");

// 🟢 حفظ طلب جديد
export async function saveRequest(data) {
  await push(requestsRef, data);
}

// 🟡 جلب الطلبات في الوقت الحقيقي
export function listenToRequests(callback) {
  onValue(requestsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const list = Object.entries(data).map(([id, value]) => ({ id, ...value }));
    callback(list);
  });
}

// 🔴 حذف طلب
export async function deleteRequest(id) {
  await remove(ref(db, `requests/${id}`));
}

// ✅ نسخ صف واحد إلى Clipboard بترتيب الأعمدة الصحيح
export async function copyRow(row) {
  const ordered = [
    "",
    "",
    "",
    "",
    row.desc || "-",
    row.location || "-",
    row.receivedDate || "-",
  ];

  const text = ordered.join("\t"); // 🔹 Tab يفصل القيم لتكون أعمدة في Excel
  await navigator.clipboard.writeText(text);
}

// ✅ نسخ جميع الصفوف إلى Clipboard بترتيب الأعمدة الصحيح
export async function copyAllRows(rows) {
  if (!rows || rows.length === 0) throw new Error("No data to copy");

  // 🏷️ العناوين (Header Row)
  const header = [
    "Inspection Request No",
    "IR Rev",
    "IR Latest Rev",
    "HYPWRLINK",
    "Description",
    "Location",
    "Received Date",
  ];

  // 🧱 المحتوى
  const content = rows.map((r) =>
    [
      "",
      "",
      "",
      "",
      r.desc || "-",
      r.location || "-",
      r.receivedDate || "-",
    ].join("\t")
  );

  const text = [header.join("\t"), ...content].join("\n");
  await navigator.clipboard.writeText(text);
}
