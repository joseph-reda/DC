import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const ADMIN = { username: "admin", password: "1234" };

    function handleLogin(e) {
        e.preventDefault();
        if (username === ADMIN.username && password === ADMIN.password) {
            localStorage.setItem("user", username);
            navigate("/dc");
        } else {
            setMessage("❌ اسم المستخدم أو كلمة المرور غير صحيحة");
        }
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
                        placeholder="مثلاً admin"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-gray-700">🔑 كلمة المرور:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="مثلاً 1234"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
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
