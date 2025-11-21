import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://nehrugamal09.pythonanywhere.com";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const json = await res.json();

        if (!res.ok) {
            alert(json.error || "Login failed");
            return;
        }

        localStorage.setItem("user", JSON.stringify(json));

        if (json.role === "admin") {
            navigate("/admin");
        } else if (json.role === "dc") {
            navigate("/dc");
        } else {
            navigate("/engineer");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded shadow-md w-96"
            >
                <h2 className="text-2xl font-bold mb-6">Login</h2>

                <input
                    className="border p-2 w-full mb-4 rounded"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    className="border p-2 w-full mb-6 rounded"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="w-full bg-blue-600 text-white p-2 rounded">
                    Login
                </button>
            </form>
        </div>
    );
}
