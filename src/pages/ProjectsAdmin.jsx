import { useEffect, useState } from "react";

const API = "https://nehrugamal09.pythonanywhere.com";

export default function ProjectsAdmin() {
    const [projects, setProjects] = useState({});
    const [newProject, setNewProject] = useState("");

    const [locationRules, setLocationRules] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");

    const [pattern, setPattern] = useState("");
    const [ruleType, setRuleType] = useState("");

    const [generalDescriptions, setGeneralDescriptions] = useState([]);
    const [newDescription, setNewDescription] = useState("");

    // department selector
    const [selectedDept, setSelectedDept] = useState("Architectural");

    const DEPARTMENTS = [
        "Architectural",
        "Civil-Structure",
        "Survey",
        "Mechanics",
        "Electricity",
        "DC",
    ];

    /** ---------------- LOAD PROJECTS ---------------- */
    const loadProjects = async () => {
        try {
            const res = await fetch(`${API}/projects`);
            const json = await res.json();
            setProjects(json.projects || {});
        } catch (err) {
            console.error("Failed to load projects", err);
        }
    };

    /** ---------------- LOAD LOCATION RULES ---------------- */
    const loadLocationRules = async () => {
        if (!selectedProject) return;
        try {
            const res = await fetch(`${API}/location-rules?project=${selectedProject}`);
            const json = await res.json();
            setLocationRules(json.rules || []);
        } catch (err) {
            console.error("Failed loading rules", err);
        }
    };

    /** ---------------- LOAD GENERAL DESCRIPTIONS PER-DEPT ---------------- */
    const loadGeneralDescriptions = async () => {
        if (!selectedDept) return;
        try {
            const res = await fetch(
                `${API}/general-descriptions?department=${selectedDept}`
            );
            const json = await res.json();
            setGeneralDescriptions(json.descriptions || []);
        } catch (err) {
            console.error("Failed to load general descriptions", err);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        loadLocationRules();
    }, [selectedProject]);

    useEffect(() => {
        loadGeneralDescriptions();
    }, [selectedDept]);

    /** ---------------- ADD PROJECT ---------------- */
    const addProject = async () => {
        if (!newProject.trim()) return;
        try {
            await fetch(`${API}/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ project: newProject.trim() }),
            });
            setNewProject("");
            loadProjects();
        } catch (err) {
            console.error("Failed to add project", err);
        }
    };

    /** ---------------- DELETE PROJECT ---------------- */
    const deleteProject = async (proj) => {
        if (!window.confirm("Delete this project?")) return;
        try {
            await fetch(`${API}/projects/${proj}`, { method: "DELETE" });
            if (proj === selectedProject) {
                setSelectedProject("");
                setLocationRules([]);
            }
            loadProjects();
        } catch (err) {
            console.error("Failed to delete project", err);
        }
    };

    /** ---------------- ADD LOCATION RULE ---------------- */
    const addRule = async () => {
        if (!pattern.trim() || !selectedProject) return;
        try {
            await fetch(`${API}/location-rules`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project: selectedProject,
                    pattern: pattern.trim(),
                    type: ruleType.trim(),
                }),
            });
            setPattern("");
            setRuleType("");
            loadLocationRules();
        } catch (err) {
            console.error("Failed to add rule", err);
        }
    };

    /** ---------------- DELETE RULE ---------------- */
    const deleteRule = async (pattern) => {
        if (!window.confirm("Delete this location rule?")) return;
        try {
            await fetch(
                `${API}/location-rules?project=${selectedProject}&pattern=${pattern}`,
                { method: "DELETE" }
            );
            loadLocationRules();
        } catch (err) {
            console.error("Failed to delete rule", err);
        }
    };

    /** ---------------- ADD GENERAL DESCRIPTION ---------------- */
    const addDescription = async () => {
        if (!newDescription.trim()) return;

        try {
            await fetch(`${API}/general-descriptions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    department: selectedDept,
                    description: newDescription.trim(),
                }),
            });

            setNewDescription("");
            loadGeneralDescriptions();
        } catch (err) {
            console.error("Failed to add description", err);
        }
    };

    /** ---------------- DELETE GENERAL DESCRIPTION ---------------- */
    const deleteDescription = async (desc) => {
        if (!window.confirm("Delete this description?")) return;

        try {
            await fetch(
                `${API}/general-descriptions?department=${selectedDept}&description=${encodeURIComponent(
                    desc
                )}`,
                { method: "DELETE" }
            );
            loadGeneralDescriptions();
        } catch (err) {
            console.error("Failed to delete description", err);
        }
    };

    return (
        <div className="p-6 space-y-8">

            {/* ---------------- PROJECT MANAGEMENT ---------------- */}
            <div className="border p-4 rounded">
                <h2 className="text-xl font-bold mb-2">Projects Management</h2>

                <div className="flex gap-2 mb-4">
                    <input
                        value={newProject}
                        onChange={(e) => setNewProject(e.target.value)}
                        className="border p-2 flex-1 rounded"
                        placeholder="New Project (example: A6)"
                    />
                    <button onClick={addProject} className="bg-blue-600 text-white px-4 rounded">
                        Add
                    </button>
                </div>

                <ul className="space-y-2">
                    {Object.keys(projects).map((proj) => (
                        <li key={proj} className="flex justify-between border p-2 rounded">
                            <span>{proj}</span>
                            <button
                                onClick={() => deleteProject(proj)}
                                className="bg-red-600 text-white px-3 rounded"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ---------------- LOCATION RULES ---------------- */}
            <div className="border p-4 rounded">
                <h2 className="text-xl font-bold mb-3">Location Rules</h2>

                <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="border p-2 mb-4 rounded w-full"
                >
                    <option value="">-- Select Project --</option>
                    {Object.keys(projects).map((p) => (
                        <option key={p}>{p}</option>
                    ))}
                </select>

                {selectedProject && (
                    <>
                        <div className="flex gap-2 mb-4">
                            <input
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                className="border p-2 flex-1 rounded"
                                placeholder="Pattern (example: 02.(1/2/3))"
                            />
                            <input
                                value={ruleType}
                                onChange={(e) => setRuleType(e.target.value)}
                                className="border p-2 flex-1 rounded"
                                placeholder="Type (optional)"
                            />
                            <button onClick={addRule} className="bg-green-600 text-white px-4 rounded">
                                Add
                            </button>
                        </div>

                        <ul className="space-y-2">
                            {locationRules.map((r, i) => (
                                <li key={i} className="flex justify-between border p-2 rounded">
                                    <span>
                                        {r.pattern} — <b>{r.type}</b>
                                    </span>
                                    <button
                                        onClick={() => deleteRule(r.pattern)}
                                        className="bg-red-600 text-white px-3 rounded"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            {/* ---------------- GENERAL DESCRIPTIONS ---------------- */}
            <div className="border p-4 rounded">
                <h2 className="text-xl font-bold mb-3">General Descriptions</h2>

                {/* Select department */}
                <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="border p-2 mb-4 rounded w-full"
                >
                    {DEPARTMENTS.map((d) => (
                        <option key={d}>{d}</option>
                    ))}
                </select>

                {/* Add new description */}
                <div className="flex gap-2 mb-4">
                    <input
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="border p-2 flex-1 rounded"
                        placeholder="New Description"
                    />
                    <button onClick={addDescription} className="bg-blue-600 text-white px-4 rounded">
                        Add
                    </button>
                </div>

                {/* List descriptions */}
                <ul className="space-y-2">
                    {generalDescriptions.map((desc, i) => (
                        <li key={i} className="flex justify-between border p-2 rounded">
                            <span>{desc}</span>
                            <button
                                onClick={() => deleteDescription(desc)}
                                className="bg-red-600 text-white px-3 rounded"
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
