import RequestsTable from "../components/RequestsTable";
import {
    saveRequest,
    listenToRequests,
    copyRow,
    copyAllRows,
    deleteRequest,
} from "../firebaseService";

export default function DcPage() {
    // 🟢 دالة لحفظ الطلبات (في حال احتجت لاحقاً نموذج إدخال)
    async function handleSave(data) {
        try {
            await saveRequest(data);
            alert("✅ Request saved successfully!");
        } catch (err) {
            alert("❌ Error saving request: " + err.message);
        }
    }

    return (
        <div
            className="dc-page"
            style={{
                padding: "2rem",
                fontFamily: "system-ui, sans-serif",
            }}
        >
            <h2
                className="title"
                style={{
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    color: "#2563eb",
                    textAlign: "center",
                    marginBottom: "0.5rem",
                }}
            >
                📋 Document Controller – Requests Overview
            </h2>

            <p
                className="subtitle"
                style={{
                    textAlign: "center",
                    color: "#555",
                    fontSize: "1rem",
                    marginBottom: "1.5rem",
                }}
            >
                Below are all inspection requests submitted by engineers.
                You can <b>copy</b> or <b>delete</b> any record easily.
            </p>

            {/* 🔹 جدول الطلبات */}
            <RequestsTable
                onListen={listenToRequests}
                onCopyRow={copyRow}
                onCopyAll={copyAllRows}
                onDeleteRow={deleteRequest}
            />
        </div>
    );
}
