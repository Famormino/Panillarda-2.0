import React, { JSX } from "react";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

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
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    const baseStyles = `
        text-4xl font-semibold tracking-tight 
        text-transparent bg-clip-text bg-gradient-to-r 
        from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400
        cursor-pointer transition-transform duration-300 ease-in-out 
        hover:scale-105 hover:rotate-[-0.5deg]
        relative inline-block
        after:content-[''] after:absolute after:left-0 
        after:bottom-[-12px] after:w-full after:h-1 
        after:bg-indigo-500 dark:after:bg-indigo-400 
        after:transform after:scale-x-0 hover:after:scale-x-100 
        after:origin-left after:transition-transform after:duration-500
    `;

    return (
        <div className="flex items-center justify-between mb-12">
            <Component
                className={`${baseStyles} ${className} text-center mx-auto`}
            >
                {text}
            </Component>
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="ml-4 p-2 rounded-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                title="Cambiar modo"
            >
                {darkMode ? (
                    <Sun size={24} className="text-yellow-400" />
                ) : (
                    <Moon size={24} className="text-gray-800" />
                )}
            </button>
        </div>
    );
};

export default Title;
