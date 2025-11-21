import { useEffect, useState } from "react";
import SearchableInput from "../components/SearchableInput";

export default function EngineerPage() {
    const API = "https://nehrugamal09.pythonanywhere.com";

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const department = user?.department;

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");

    const [locations, setLocations] = useState([]);
    const [typesMap, setTypesMap] = useState({});
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedType, setSelectedType] = useState("");

    const [generalDescriptions, setGeneralDescriptions] = useState([]);
    const [generalDesc, setGeneralDesc] = useState("");

    const [finalDescription, setFinalDescription] = useState("");
    const [saving, setSaving] = useState(false);

    // Fetch projects
    useEffect(() => {
        fetch(`${API}/projects`)
            .then(res => res.json())
            .then(data => setProjects(Object.keys(data.projects || {})))
            .catch(() => setProjects([]));
    }, []);

    // Fetch general descriptions
    useEffect(() => {
        if (!department) return;
        fetch(`${API}/general-descriptions?department=${department}`)
            .then(res => res.json())
            .then(data => setGeneralDescriptions(data.descriptions || []))
            .catch(() => setGeneralDescriptions([]));
    }, [department]);

    // Fetch location rules
    useEffect(() => {
        if (!selectedProject) {
            setLocations([]);
            setTypesMap({});
            return;
        }

        fetch(`${API}/location-rules?project=${selectedProject}`)
            .then(res => res.json())
            .then(data => {
                setLocations(data.locations || []);
                setTypesMap(data.types || {});
            })
            .catch(() => {
                setLocations([]);
                setTypesMap({});
            });
    }, [selectedProject]);

    // Auto-fill type
    useEffect(() => {
        if (selectedLocation && typesMap[selectedLocation]) {
            setSelectedType(typesMap[selectedLocation]);
        } else {
            setSelectedType("");
        }
    }, [selectedLocation, typesMap]);

    // Final description build
    useEffect(() => {
        let desc = "";
        if (generalDesc) desc += generalDesc;
        if (selectedLocation) desc += ` at ${selectedLocation}`;
        if (selectedType) desc += ` (${selectedType})`;
        setFinalDescription(desc.trim());
    }, [generalDesc, selectedLocation, selectedType]);

    async function handleSave() {
        if (!selectedProject) return alert("Select project");
        if (!selectedLocation) return alert("Select location");
        if (!finalDescription) return alert("Description required");

        setSaving(true);

        try {
            const res = await fetch(`${API}/irs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project: selectedProject,
                    department: department,
                    location: selectedLocation,
                    type: selectedType,
                    desc: finalDescription,
                    user: user?.username || ""
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");

            alert(`Saved: ${data.ir.irNo}`);

            setSelectedLocation("");
            setSelectedType("");
            setGeneralDesc("");
            setFinalDescription("");

        } catch (err) {
            console.error(err);
            alert("Save failed: " + err.message);
        }

        setSaving(false);
    }

    function logout() {
        localStorage.removeItem("user");
        window.location.href = "/login";
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Engineer Page — {department}</h1>
                <button onClick={logout} className="px-3 py-1 bg-red-600 text-white rounded">
                    Logout
                </button>
            </div>

            <label className="block mb-1 font-medium">Select Project</label>
            <select
                value={selectedProject}
                onChange={(e) => {
                    setSelectedProject(e.target.value);
                    setSelectedLocation("");
                    setSelectedType("");
                    setGeneralDesc("");
                    setFinalDescription("");
                }}
                className="w-full p-2 border rounded mb-4"
            >
                <option value="">-- Select Project --</option>
                {projects.map(p => (
                    <option key={p} value={p}>{p}</option>
                ))}
            </select>

            <SearchableInput
                label="Location"
                value={selectedLocation}
                onChange={setSelectedLocation}
                options={locations}
            />

            <SearchableInput
                label="General Description"
                value={generalDesc}
                onChange={setGeneralDesc}
                options={generalDescriptions}
            />

            <label className="block mb-1">Final Description</label>
            <textarea
                className="w-full p-3 border rounded mb-4 h-28"
                value={finalDescription}
                onChange={e => setFinalDescription(e.target.value)}
            />

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-2 rounded text-lg"
            >
                {saving ? "Saving..." : "Save IR"}
            </button>
        </div>
    );
}
