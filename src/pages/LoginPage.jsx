import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://nehrugamal09.pythonanywhere.com";

export default function LoginPage({ setUser }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const json = await res.json();

            if (!res.ok) {
                alert(json.error || "Invalid username or password");
                setLoading(false);
                return;
            }

            // Save the user (without password)
            localStorage.setItem("user", JSON.stringify(json.user));
            setUser(json.user);

            // Redirect by role
            if (json.user.role === "admin") {
                navigate("/admin");
            } else if (json.user.role === "dc") {
                navigate("/dc");
            } else {
                navigate("/engineer");
            }

        } catch (err) {
            alert("Network error, please try again.");
            console.error(err);
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Login
                </h2>

                <div className="mb-4">
                    <label className="block mb-1 text-gray-600">Username</label>
                    <input
                        type="text"
                        className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="off"
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-1 text-gray-600">Password</label>
                    <input
                        type="password"
                        className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="off"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
