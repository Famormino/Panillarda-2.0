import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react"; // o cualquier ícono que uses

const DarkModeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        }
    }, []);

    const toggleDarkMode = () => {
        const newTheme = isDark ? "light" : "dark";
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark");
        setIsDark(!isDark);
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition bg-gray-200 hover:bg-gray-300 dark:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? "Modo Claro" : "Modo Oscuro"}</span>
        </button>
    );
};

export default DarkModeToggle;
