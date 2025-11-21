import { useState } from "react";
import EngineerPage from "./EngineerPage";
import DcPage from "./DcPage";
import ProjectsAdmin from "./ProjectsAdmin";
import UsersAdminPage from "./UsersAdminPage";

export default function AdminDashboard() {
    const [page, setPage] = useState("engineer");
    function handleLogout() {
        localStorage.removeItem("user");
        window.location.href = "/login";
    }

    return (
        <div className="flex h-screen">
            <div className="w-56 bg-gray-900 text-white p-4 space-y-4">

                <button className="w-full text-left" onClick={() => setPage("engineer")}>
                    Engineer Page
                </button>

                <button className="w-full text-left" onClick={() => setPage("dc")}>
                    DC Page
                </button>

                <button className="w-full text-left" onClick={() => setPage("projects")}>
                    Projects Admin
                </button>

                <button className="w-full text-left" onClick={() => setPage("users")}>
                    Users Admin
                </button>

                {/* LOGOUT BUTTON */}
                <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-400 font-bold mt-8"
                >
                    Logout
                </button>
            </div>


            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
                {page === "engineer" && <EngineerPage />}
                {page === "dc" && <DcPage />}
                {page === "projects" && <ProjectsAdmin />}
                {page === "users" && <UsersAdminPage />}
            </div>

        </div>
    );
}
