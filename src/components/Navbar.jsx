import { Link, useLocation } from "react-router-dom";
export default function Navbar() {
    const loc = useLocation();

    return (
        <nav
            className="navbar"
            style={{
                background: "#1e293b",
                color: "#fff",
                padding: "0.75rem 1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
        >
            <span
                className="nav-logo"
                style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    letterSpacing: "0.5px",
                }}
            >
                🏗️ Inspection System
            </span>

            <div className="nav-links" style={{ display: "flex", gap: "1rem" }}>
                <Link
                    to="/"
                    className={loc.pathname === "/" ? "active" : ""}
                    style={{
                        color: loc.pathname === "/" ? "#38bdf8" : "#fff",
                        textDecoration: "none",
                        fontWeight: loc.pathname === "/" ? "bold" : "normal",
                        borderBottom:
                            loc.pathname === "/" ? "2px solid #38bdf8" : "2px solid transparent",
                        paddingBottom: "2px",
                        transition: "0.3s",
                    }}
                >
                    Engineer
                </Link>

                <Link
                    to="/dc"
                    className={loc.pathname === "/dc" ? "active" : ""}
                    style={{
                        color: loc.pathname === "/dc" ? "#38bdf8" : "#fff",
                        textDecoration: "none",
                        fontWeight: loc.pathname === "/dc" ? "bold" : "normal",
                        borderBottom:
                            loc.pathname === "/dc" ? "2px solid #38bdf8" : "2px solid transparent",
                        paddingBottom: "2px",
                        transition: "0.3s",
                    }}
                >
                    Document Controller
                </Link>
            </div>
        </nav>
    );
}
