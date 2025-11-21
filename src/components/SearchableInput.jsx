import { useState, useEffect, useRef } from "react";

export default function SearchableInput({ label, value, onChange, options }) {
    const [query, setQuery] = useState(value || "");
    const [showList, setShowList] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef(null);

    // فلترة النتائج
    const filtered = options.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
    );

    // عند اختيار عنصر
    function handleSelect(item) {
        setQuery(item);
        onChange(item);
        setShowList(false);
        setHighlightedIndex(-1);
    }

    // إغلاق القائمة عند الضغط خارجها
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowList(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // تحديث قيمة الإدخال من الخارج
    useEffect(() => {
        setQuery(value || "");
    }, [value]);

    // **التحكم بالكيبورد**
    function handleKeyDown(e) {
        if (!showList) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev < filtered.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
                handleSelect(filtered[highlightedIndex]);
            }
        }
    }

    return (
        <div ref={wrapperRef} className="relative w-full mb-4">
            {label && (
                <label className="block mb-1 font-medium text-gray-700">
                    {label}
                </label>
            )}

            <input
                type="text"
                value={query}
                onFocus={() => setShowList(true)}
                onChange={(e) => {
                    setQuery(e.target.value);
                    onChange(e.target.value);
                    setShowList(true);
                    setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Search or choose..."
            />

            {/* قائمة الخيارات */}
            {showList && (
                <ul className="absolute z-20 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto">
                    {filtered.length > 0 ? (
                        filtered.map((item, i) => (
                            <li
                                key={i}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setHighlightedIndex(i)}
                                className={`p-2 cursor-pointer ${
                                    highlightedIndex === i
                                        ? "bg-blue-100"
                                        : "hover:bg-gray-200"
                                }`}
                            >
                                {item}
                            </li>
                        ))
                    ) : (
                        <li
                            onClick={() => handleSelect(query)}
                            className="p-2 cursor-pointer bg-green-100 text-green-700"
                        >
                            ➕ Add "{query}"
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
