import React, { useEffect, useState } from "react";

const API = "https://nehrugamal09.pythonanywhere.com";

export default function UsersAdminPage() {
    const [users, setUsers] = useState([]);
    const [editUser, setEditUser] = useState(null);

    const [newUser, setNewUser] = useState({
        username: "",
        password: "",
        role: "engineer",
        department: "",
    });

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const res = await fetch(`${API}/users`);
            const json = await res.json();
            setUsers(json.users || []);
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteUser(username) {
        if (!window.confirm("Delete this user?")) return;

        try {
            const res = await fetch(`${API}/users/${username}`, {
                method: "DELETE",
            });
            loadUsers();
        } catch (err) {
            alert("Error deleting user");
        }
    }

    async function updateUser() {
        try {
            const res = await fetch(`${API}/users/${editUser.username}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editUser),
            });

            setEditUser(null);
            loadUsers();
        } catch (err) {
            alert("Error updating user");
        }
    }

    async function addUser() {
        try {
            const res = await fetch(`${API}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });

            setNewUser({
                username: "",
                password: "",
                role: "engineer",
                department: "",
            });
            loadUsers();
        } catch {
            alert("Error adding user");
        }
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-blue-700 mb-6">Users Manager</h2>

            {/* Add user */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h3 className="text-xl mb-4 font-semibold">Add New User</h3>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        className="border p-2 rounded"
                        placeholder="Username"
                        value={newUser.username}
                        onChange={(e) =>
                            setNewUser({ ...newUser, username: e.target.value })
                        }
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                        }
                    />

                    <select
                        className="border p-2 rounded"
                        value={newUser.role}
                        onChange={(e) =>
                            setNewUser({ ...newUser, role: e.target.value })
                        }
                    >
                        <option value="engineer">Engineer</option>
                        <option value="dc">DC</option>
                        <option value="admin">Admin</option>
                    </select>

                    <input
                        className="border p-2 rounded"
                        placeholder="Department"
                        value={newUser.department}
                        onChange={(e) =>
                            setNewUser({ ...newUser, department: e.target.value })
                        }
                    />
                </div>

                <button
                    onClick={addUser}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                    Add User
                </button>
            </div>

            {/* Users table */}
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-xl mb-4 font-semibold">All Users</h3>

                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="p-2">Username</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Department</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((u) => (
                            <tr key={u.username} className="border-b">
                                <td className="p-2">{u.username}</td>
                                <td className="p-2">{u.role}</td>
                                <td className="p-2">{u.department}</td>
                                <td className="p-2 space-x-2">
                                    <button
                                        className="bg-blue-600 text-white px-3 py-1 rounded"
                                        onClick={() => setEditUser({ ...u })}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="bg-red-600 text-white px-3 py-1 rounded"
                                        onClick={() => deleteUser(u.username)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {editUser && (
                    <div className="mt-6 p-4 bg-gray-100 rounded">
                        <h3 className="font-bold mb-4">Edit User</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                className="border p-2 rounded"
                                value={editUser.password}
                                onChange={(e) =>
                                    setEditUser({ ...editUser, password: e.target.value })
                                }
                            />
                            <select
                                className="border p-2 rounded"
                                value={editUser.role}
                                onChange={(e) =>
                                    setEditUser({ ...editUser, role: e.target.value })
                                }
                            >
                                <option value="engineer">Engineer</option>
                                <option value="dc">DC</option>
                                <option value="admin">Admin</option>
                            </select>
                            <input
                                className="border p-2 rounded"
                                value={editUser.department}
                                onChange={(e) =>
                                    setEditUser({ ...editUser, department: e.target.value })
                                }
                            />
                        </div>

                        <button
                            onClick={updateUser}
                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
