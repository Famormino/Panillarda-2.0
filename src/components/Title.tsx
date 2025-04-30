import React, { JSX, useEffect, useState } from "react";
import { Sheet, X, ZapOff } from "lucide-react";

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
    const [darkMode, setDarkMode] = useState(() => {
        const stored = localStorage.getItem("darkMode");
        return stored === "true";
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

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

            {/* Título con onClick que abre modal */}
            <Component
                className={`${baseStyles} ${className} flex justify-center`}
                onClick={() => setIsModalOpen(true)}
            >
                {text}
            </Component>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Información sobre Planillarda
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <X size={26} />
                            </button>
                        </div>
                        <ul className="text-gray-700 dark:text-gray-200 space-y-2">
                            <li>
                                📅 API utilizada para feriados:{" "}
                                <a
                                    href="https://date.nager.at"
                                    target="_blank"
                                    className="text-blue-600 dark:text-blue-400 underline"
                                >
                                    nager.date
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Sheet className="w-5 h-5 text-blue-600 dark:text-green-400" />
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                                    <span>Google Sheet de feriados: </span>
                                    <a
                                        href="https://docs.google.com/spreadsheets/d/17tkM_yPB7fCx348X7rCbJ3oVpSW8naP3WV5AWoLzkPc/edit?gid=1053415939#gid=1053415939"
                                        target="_blank"
                                        className="text-blue-600 dark:text-blue-400 underline"
                                    >
                                        Feriados Personalizados
                                    </a>
                                </div>
                            </li>
                            <li>✅ Funcionalidades de la web:</li>
                            <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                                <li>
                                    Permite seleccionar un{" "}
                                    <strong>rango de fechas</strong> desde un
                                    calendario visual.
                                </li>
                                <li>
                                    Posibilidad de{" "}
                                    <strong>
                                        incluir o excluir sábados, domingos y
                                        feriados
                                    </strong>{" "}
                                    nacionales en la selección.
                                </li>
                                <li>
                                    Carga personalizada de{" "}
                                    <strong>
                                        tareas, eventos, entradas o salidas
                                    </strong>{" "}
                                    por día a través de botones específicos.
                                </li>
                                <li>
                                    Función para{" "}
                                    <strong>
                                        copiar los registros al portapapeles
                                    </strong>{" "}
                                    en un formato compatible con la transacción
                                    de SAP.
                                </li>
                                <li>
                                    Sistema de validación de datos: muestra{" "}
                                    <strong>
                                        errores si algún registro es inválido
                                    </strong>{" "}
                                    (por ejemplo, falta de datos obligatorios o
                                    conflictos).
                                </li>
                                <li>
                                    Aun si hay errores, se permite copiar los
                                    datos, pero se informa con un{" "}
                                    <strong>
                                        toast especial de advertencia
                                    </strong>{" "}
                                    que notifica la existencia de
                                    inconsistencias.
                                </li>
                                <li>
                                    Modo oscuro automático con posibilidad de
                                    cambiarlo manualmente desde el encabezado.
                                </li>
                                <li>
                                    Posibilidad de{" "}
                                    <strong>
                                        agregar feriados personalizados
                                    </strong>{" "}
                                    que no estén contemplados a nivel nacional
                                    (por ejemplo, feriados locales o
                                    institucionales).
                                </li>
                            </ul>
                            <li>
                                📦 Interfaz moderna, responsiva y fácil de usar
                                desde distintos dispositivos.
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Title;
