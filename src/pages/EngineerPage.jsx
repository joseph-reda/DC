import React, { useState, useEffect } from "react";
import RequestForm from "../components/RequestForm";
import { saveRequest } from "../firebaseService";
import { useNavigate } from "react-router-dom";

const API = "https://nehrugamal09.pythonanywhere.com";

export default function EngineerPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [nextIR, setNextIR] = useState("");
    const [locations, setLocations] = useState([]);
    const [typesMap, setTypesMap] = useState({});
    const [generalDescriptions, setGeneralDescriptions] = useState([]);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem("user") || "null");
        if (!u) {
            navigate("/login", { replace: true });
            return;
        }
        setUser(u);

        // load projects
        (async () => {
            try {
                const res = await fetch(`${API}/projects`);
                const json = await res.json();
                setProjects(Object.keys(json.projects || {}));
            } catch (err) {
                console.error(err);
            }
        })();

        // load general descriptions for this user's department
        (async () => {
            try {
                const dept = encodeURIComponent(u.department);
                const res = await fetch(`${API}/general-descriptions?department=${dept}`);
                const json = await res.json();
                setGeneralDescriptions(json.descriptions || []);
            } catch (err) {
                console.error(err);
            }
        })();

    }, [navigate]);

    useEffect(() => {
        if (!selectedProject) {
            setNextIR("");
            setLocations([]);
            setTypesMap({});
            return;
        }
        (async () => {
            try {
                const [irRes, locRes] = await Promise.all([
                    fetch(`${API}/get-next-ir?project=${selectedProject}`),
                    fetch(`${API}/location-rules?project=${selectedProject}`)
                ]);
                if (irRes.ok) {
                    const irJson = await irRes.json();
                    const padded = String(irJson.nextIR).padStart(3, "0");
                    setNextIR(`BADYA-CON-${selectedProject}-IR-ARCH-${padded}`);
                } else {
                    setNextIR(`BADYA-CON-${selectedProject}-IR-ARCH-001`);
                }
                if (locRes.ok) {
                    const locJson = await locRes.json();
                    setLocations(locJson.locations || []);
                    setTypesMap(locJson.types || {});
                } else {
                    setLocations([]);
                    setTypesMap({});
                }
            } catch (err) {
                console.error(err);
                setLocations([]);
                setTypesMap({});
            }
        })();
    }, [selectedProject]);

    async function handleSave(formData) {
        try {
            if (!selectedProject) return alert("⚠️ Please select a project");

            const today = new Date().toISOString().split("T")[0];

            const finalData = {
                ...formData,
                irNo: nextIR,
                project: selectedProject,
                department: user.department,
                receivedDate: formData.receivedDate || today,
                desc: formData.finalDescription || formData.desc || "No Description",
            };

            await saveRequest(finalData);

            const lastNum = parseInt(nextIR.match(/\d+$/)[0]);

            await fetch(`${API}/save-last-ir`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project: selectedProject,
                    lastIR: lastNum
                })
            });

            alert(`✔ Saved with IR: ${nextIR}`);
        } catch (err) {
            console.error(err);
            alert("❌ Failed to save request.");
        }
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50 py-12 px-4 font-sans">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">Engineer – Submit Inspection Request</h2>

            <div className="bg-white w-full max-w-2xl rounded-xl shadow-md p-6">
                <div className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700">Select Project:</label>
                    <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">-- Select Project --</option>
                        {projects.map((proj) => <option key={proj} value={proj}>{proj}</option>)}
                    </select>
                </div>

                <RequestForm onSaved={handleSave} fixedIR={nextIR} hiddenIR={true} locations={locations} typesMap={typesMap} generalDescriptions={generalDescriptions} />
            </div>
        </div>
    );
}
