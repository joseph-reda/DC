import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // 🔑 بيانات الدخول (يمكنك تعديلها لاحقًا)
    const ADMIN = {
        username: "admin",
        password: "1234",
    };

    // 🟢 تسجيل الدخول
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
        <div
            style={{
                maxWidth: "400px",
                margin: "3rem auto",
                padding: "2rem",
                border: "1px solid #ccc",
                borderRadius: "12px",
                background: "#f9fafb",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                fontFamily: "system-ui, sans-serif",
            }}
        >
            <h2
                style={{
                    textAlign: "center",
                    color: "#2563eb",
                    marginBottom: "1rem",
                }}
            >
                🔐 تسجيل الدخول
            </h2>

            <form onSubmit={handleLogin}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    👤 اسم المستخدم:
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثلاً admin"
                    required
                    style={{
                        width: "100%",
                        padding: "0.5rem",
                        marginBottom: "1rem",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                    }}
                />

                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    🔑 كلمة المرور:
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="مثلاً 1234"
                    required
                    style={{
                        width: "100%",
                        padding: "0.5rem",
                        marginBottom: "1rem",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                    }}
                />

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "0.6rem",
                        background: "#2563eb",
                        color: "#fff",
                        fontWeight: "bold",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                >
                    🚪 تسجيل الدخول
                </button>
            </form>

            {message && (
                <p
                    style={{
                        marginTop: "1rem",
                        color: "red",
                        textAlign: "center",
                        fontWeight: "bold",
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
