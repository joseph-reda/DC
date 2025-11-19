import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ setUser }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const USERS = [
        { username: "arch", password: "a1236", role: "engineer", department: "Architectural" },
        { username: "civil", password: "c1236", role: "engineer", department: "Civil-Structure" },
        { username: "survey", password: "s1236", role: "engineer", department: "Survey" },
        { username: "mech", password: "m1236", role: "engineer", department: "Mechanics" },
        { username: "elec", password: "e1236", role: "engineer", department: "Electricity" },
        { username: "dc", password: "d1236", role: "dc", department: "DC" },
    ];

    function handleLogin(e) {
        e.preventDefault();

        const user = USERS.find(
            (u) => u.username === username && u.password === password
        );

        if (!user) {
            setMessage("❌ اسم المستخدم أو كلمة المرور غير صحيحة");
            return;
        }

        // حفظ في localStorage
        localStorage.setItem("user", JSON.stringify(user));

        // تحديث الـ state في App
        setUser(user);

        // توجيه حسب الدور
        if (user.role === "engineer") navigate("/", { replace: true });
        if (user.role === "dc") navigate("/dc", { replace: true });
    }

    return (
        <div className="max-w-sm mx-auto mt-16 p-8 bg-gray-50 rounded-xl shadow-md font-sans">
            <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
                🔐 تسجيل الدخول
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block mb-1 text-gray-700">👤 اسم المستخدم:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="مثلاً arch"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-gray-700">🔑 كلمة المرور:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg"
                >
                    🚪 تسجيل الدخول
                </button>
            </form>

            {message && (
                <p className="mt-4 text-center text-red-600 font-bold">{message}</p>
            )}
        </div>
    );
}
