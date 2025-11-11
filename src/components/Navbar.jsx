import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "../main.css"

export default function Navbar() {
    const loc = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const links = [
        { name: "Engineer", path: "/" },
        { name: "DC", path: "/dc" },
    ];

    return (
        <nav className="bg-gray-800 text-white sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 text-xl font-bold tracking-wide">
                        🏗️ DC System
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex space-x-6">
                        {links.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative py-2 px-1 transition-colors duration-300 ${loc.pathname === link.path
                                        ? "text-sky-400 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-sky-400"
                                        : "text-white hover:text-sky-400"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="focus:outline-none p-2 rounded-md hover:bg-gray-700 transition"
                        >
                            {menuOpen ? (
                                <span className="text-2xl">&#x2715;</span> // ✖
                            ) : (
                                <span className="text-2xl">&#9776;</span> // ☰
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-gray-800 border-t border-gray-700">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMenuOpen(false)}
                            className={`block px-4 py-3 transition-colors duration-300 ${loc.pathname === link.path
                                    ? "text-sky-400 font-semibold"
                                    : "text-white hover:text-sky-400"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
