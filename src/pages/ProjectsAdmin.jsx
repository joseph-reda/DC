import React, { useEffect, useState } from "react";

const API = "https://nehrugamal09.pythonanywhere.com";

export default function ProjectsAdmin() {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState("");

    const [selectedProject, setSelectedProject] = useState("");
    const [rules, setRules] = useState([]);
    const [pattern, setPattern] = useState("");
    const [type, setType] = useState("");

    const [generalDescriptions, setGeneralDescriptions] = useState([]);
    const [newDescription, setNewDescription] = useState("");

    // ---------------- LOAD PROJECTS + GENERAL DESCRIPTIONS ----------------
    useEffect(() => {
        loadProjects();
        loadDescriptions();
    }, []);

    async function loadProjects() {
        try {
            const res = await fetch(`${API}/projects`);
            const json = await res.json();
            setProjects(Object.keys(json.projects || {}));
        } catch (err) {
            console.error(err);
        }
    }

    async function loadDescriptions() {
        try {
            const res = await fetch(`${API}/general-descriptions`);
            const json = await res.json();
            setGeneralDescriptions(json.descriptions || []);
        } catch (err) {
            console.error(err);
        }
    }

    // ---------------- ADD PROJECT ----------------
    async function addProject() {
        if (!newProject.trim()) return alert("Enter project name");
        try {
            const res = await fetch(`${API}/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ project: newProject.trim() })
            });

            const json = await res.json();
            if (!res.ok) return alert(json.error || "Failed");

            setNewProject("");
            loadProjects();
            alert("Project Added!");
        } catch (err) {
            alert("Failed to add project");
        }
    }

    // ---------------- DELETE PROJECT ----------------
    async function deleteProject(project) {
        if (!window.confirm(`Delete project ${project}?`)) return;

        try {
            const res = await fetch(`${API}/projects/${project}`, {
                method: "DELETE"
            });
            const json = await res.json();
            if (!res.ok) return alert(json.error || "Failed");

            if (selectedProject === project) {
                setSelectedProject("");
                setRules([]);
            }
            loadProjects();
        } catch (err) {
            alert("Failed to delete");
        }
    }

    // ---------------- LOAD RULES WHEN PROJECT SELECTED ----------------
    useEffect(() => {
        if (!selectedProject) {
            setRules([]);
            return;
        }
        loadRules();
    }, [selectedProject]);

    async function loadRules() {
        try {
            const res = await fetch(`${API}/location-rules?project=${selectedProject}`);
            const json = await res.json();
            setRules(json.rules || []);
        } catch (err) {
            console.error(err);
        }
    }

    // ---------------- ADD LOCATION RULE ----------------
    async function addRule() {
        if (!pattern.trim()) return alert("Enter pattern");

        try {
            const res = await fetch(`${API}/location-rules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project: selectedProject,
                    pattern: pattern.trim(),
                    type: type.trim()
                })
            });

            const json = await res.json();
            if (!res.ok) return alert(json.error || "Failed");

            setPattern("");
            setType("");
            loadRules();
        } catch (err) {
            alert("Failed to add rule");
        }
    }

    // ---------------- DELETE LOCATION RULE ----------------
    async function deleteRule(pattern) {
        if (!window.confirm(`Delete rule: ${pattern}?`)) return;

        try {
            const url = new URL(`${API}/location-rules`);
            url.searchParams.append("project", selectedProject);
            url.searchParams.append("pattern", pattern);

            const res = await fetch(url.toString(), { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) return alert(json.error || "Failed");

            loadRules();
        } catch (err) {
            alert("Failed to delete rule");
        }
    }

    // ---------------- ADD GENERAL DESCRIPTION ----------------
    async function addDescription() {
        if (!newDescription.trim()) return alert("Enter description");

        try {
            const res = await fetch(`${API}/general-descriptions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: newDescription.trim() })
            });

            const json = await res.json();
            if (!res.ok) return alert(json.error || "Failed");

            setNewDescription("");
            loadDescriptions();
        } catch (err) {
            alert("Failed");
        }
    }

    // ---------------- DELETE GENERAL DESCRIPTION ----------------
    async function deleteDescription(desc) {
        if (!window.confirm(`Delete "${desc}"?`)) return;

        try {
            const url = new URL(`${API}/general-descriptions`);
            url.searchParams.append("description", desc);

            const res = await fetch(url.toString(), { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) return alert(json.error || "Failed");

            loadDescriptions();
        } catch (err) {
            alert("Failed");
        }
    }

    // -------------------------------------------------------------------
    // ------------------------------ UI ---------------------------------
    // -------------------------------------------------------------------

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h2 className="text-3xl font-bold text-blue-700 mb-6">
                Admin Panel – Projects / Locations / Descriptions
            </h2>

            {/* ---------------------- PROJECTS SECTION ---------------------- */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4">Projects</h3>

                <div className="flex gap-3 mb-4">
                    <input
                        className="border p-2 rounded w-64"
                        placeholder="A6 / A7 / A1 ..."
                        value={newProject}
                        onChange={(e) => setNewProject(e.target.value)}
                    />
                    <button
                        onClick={addProject}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Add
                    </button>
                </div>

                <ul className="space-y-2">
                    {projects.map((p) => (
                        <li
                            key={p}
                            className="flex justify-between items-center bg-gray-50 p-2 rounded"
                        >
                            <span
                                className={`cursor-pointer ${selectedProject === p ? "text-blue-600 font-semibold" : ""
                                    }`}
                                onClick={() => setSelectedProject(p)}
                            >
                                {p}
                            </span>

                            <button
                                onClick={() => deleteProject(p)}
                                className="bg-red-600 text-white px-3 py-1 rounded"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ---------------------- LOCATION RULES SECTION ---------------------- */}
            {selectedProject && (
                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <h3 className="text-xl font-semibold mb-4">
                        Location Rules for {selectedProject}
                    </h3>

                    <div className="flex gap-3 mb-4">
                        <input
                            className="border p-2 rounded w-72"
                            placeholder="A6.02.(1/2/3)"
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                        />
                        <input
                            className="border p-2 rounded w-48"
                            placeholder="Park-D / Trio-D / Cor-C"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        />
                        <button
                            onClick={addRule}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Add Rule
                        </button>
                    </div>

                    <ul className="space-y-2">
                        {rules.map((r, i) => (
                            <li
                                key={i}
                                className="flex justify-between items-center bg-gray-50 p-2 rounded"
                            >
                                <span>
                                    <b>Pattern:</b> {r.pattern}
                                    <span className="ml-4"><b>Type:</b> {r.type || "—"}</span>
                                </span>

                                <button
                                    onClick={() => deleteRule(r.pattern)}
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ---------------------- GENERAL DESCRIPTIONS SECTION ---------------------- */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4">General Descriptions</h3>

                <div className="flex gap-3 mb-4">
                    <input
                        className="border p-2 rounded w-96"
                        placeholder="Installation of Stair Marble"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                    <button
                        onClick={addDescription}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Add
                    </button>
                </div>

                <ul className="space-y-2">
                    {generalDescriptions.map((d, i) => (
                        <li
                            key={i}
                            className="flex justify-between items-center bg-gray-50 p-2 rounded"
                        >
                            <span>{d}</span>
                            <button
                                onClick={() => deleteDescription(d)}
                                className="bg-red-600 text-white px-3 py-1 rounded"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
