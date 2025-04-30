import React, { JSX, useEffect, useState } from "react";
import { ZapOff } from "lucide-react";

type TitleProps = {
    text: string;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
};

const Title: React.FC<TitleProps> = ({
    text,
    className = "",
    as: Component = "h1",
}) => {
    // Leer valor inicial de localStorage
    const [darkMode, setDarkMode] = useState(() => {
        const stored = localStorage.getItem("darkMode");
        return stored === "true"; // transforma string a boolean
    });

    // Aplicar la clase y guardar en localStorage cuando cambia
    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
        localStorage.setItem("darkMode", darkMode.toString());
    }, [darkMode]);

    const baseStyles = `
        text-4xl font-semibold tracking-tight 
        text-transparent bg-clip-text bg-gradient-to-r 
        from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400
        cursor-pointer transition-transform duration-300 ease-in-out 
        hover:scale-105 hover:rotate-[-0.5deg]
    `;

    return (
        <div className="mb-12">
            {/* Toggle en la parte superior derecha */}
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-3 gap-2 flex items-center rounded-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                        title="Cambiar modo"
                    >
                        {darkMode ? (
                            <img
                                src="luzYfuerza.webp"
                                className="w-6 rounded-full"
                            />
                        ) : (
                            <ZapOff size={16} className="text-gray-800" />
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {darkMode
                                ? "Luz y Fuerza"
                                : "Oscuridad y Debilidad"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Título centrado */}
            <Component
                className={`${baseStyles} ${className} flex justify-center`}
            >
                {text}
            </Component>
        </div>
    );
};

export default Title;
