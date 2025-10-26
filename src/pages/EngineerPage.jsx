import RequestForm from "../components/RequestForm";
import { saveRequest } from "../firebaseService"; // ← استخدم firebaseService مباشرة

export default function EngineerPage() {
    // 🟢 معالجة حفظ الطلب
    async function handleSave(data) {
        try {
            await saveRequest(data);
            alert("✅ Request submitted successfully!");
        } catch (err) {
            alert("❌ Failed to submit request: " + err.message);
        }
    }

    return (
        <div className="engineer-page" style={{ padding: "1rem" }}>
            <h2 style={{ color: "#2563eb", marginBottom: "1rem" }}>
                👷 Engineer – Submit Inspection Request
            </h2>

            <RequestForm onSaved={handleSave} />
        </div>
    );
}
