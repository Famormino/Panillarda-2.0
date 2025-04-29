import React, { useEffect, useState } from "react";
import {
    format,
    eachDayOfInterval,
    parseISO,
    isWeekend,
    startOfToday,
    isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import AttendanceTable from "./AttendanceTable";
import { PlusCircle, RotateCcw, Clipboard } from "lucide-react";
import toast from "react-hot-toast";
import { getFeriados } from "./helpers/getFeriados";
import { getInvalidErrors } from "./helpers/getInvalidData";

export type Feriado = {
    name: string;
    date: string;
    localName: string;
};

export type AttendanceRecord = {
    fecha: string;
    hora: string;
    clase: string;
    descripcion: string;
    tp: string;
};

const DateSelector: React.FC = () => {
    const [startDate, setStartDate] = useState(() =>
        format(startOfToday(), "yyyy-MM-dd")
    );
    const [endDate, setEndDate] = useState("");
    const [includeWeekends, setExcludeWeekends] = useState(false);
    const [includeFeriados, setExcludeFeriados] = useState(false);
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(
        []
    );
    const [feriados, setFeriados] = useState<Feriado[]>([]);
    const [tableKey, setTableKey] = useState(0);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        getFeriados(currentYear, "AR").then((data) => setFeriados(data));
    }, []);
    useEffect(() => {
        fetch(
            "https://script.google.com/macros/s/AKfycbxq_iRiqJOxSII-U07D7ib9KUtsksvOtsRPylxqgW3Nig3N5ITSBH8FzdpIwi1QxZbT/exec"
        )
            .then((res) => res.json())
            .then((data: Feriado[]) => {
                const normalizados = data.map((f) => ({
                    ...f,
                    date: new Date(f.date).toISOString().split("T")[0], //
                }));

                setFeriados((prev) => {
                    const combinados = [...prev, ...normalizados];

                    // Evitamos duplicados por fecha
                    const unicos = combinados.filter(
                        (feriado, index, self) =>
                            index ===
                            self.findIndex((f) => f.date === feriado.date)
                    );

                    return unicos;
                });
            })
            .catch((err) =>
                console.error("Error al cargar feriados personalizados:", err)
            );
    }, []);

    console.log(feriados);

    const generateAttendance = () => {
        if (!startDate || !endDate) return;

        const dateRange = eachDayOfInterval({
            start: parseISO(startDate),
            end: parseISO(endDate),
        }).filter((date) => {
            const isWeekendDay = isWeekend(date);
            const isFeriado = feriados.some((feriado) =>
                isSameDay(date, parseISO(feriado.date))
            );

            if (!includeWeekends && isWeekendDay) return false;
            if (!includeFeriados && isFeriado) return false;

            return true;
        });

        const newData = dateRange.flatMap((date) => [
            {
                fecha: format(date, "dd/MM/yyyy", { locale: es }),
                hora: "07:00",
                clase: "P10",
                descripcion: "",
                tp: "+",
            },
            {
                fecha: format(date, "dd/MM/yyyy", { locale: es }),
                hora: "14:00",
                clase: "P20",
                descripcion: "",
                tp: "+",
            },
        ]);

        const combined = [...attendanceData, ...newData];

        const uniqueData = combined.filter(
            (record, index, self) =>
                index ===
                self.findIndex(
                    (r) =>
                        r.fecha === record.fecha &&
                        r.hora === record.hora &&
                        r.clase === record.clase
                )
        );

        setAttendanceData(uniqueData);
    };

    const handleAddEntrada = () => {
        const newRecord: AttendanceRecord = {
            fecha: "",
            hora: "07:00",
            clase: "P10",
            descripcion: "",
            tp: "+",
        };
        setAttendanceData([...attendanceData, newRecord]);
    };

    const handleAddSalida = () => {
        const newRecord: AttendanceRecord = {
            fecha: "",
            hora: "14:00",
            clase: "P20",
            descripcion: "",
            tp: "+",
        };
        setAttendanceData([...attendanceData, newRecord]);
    };

    const handleReiniciar = () => {
        setStartDate("");
        setEndDate("");
        setAttendanceData([]);
        setTableKey((prev) => prev + 1);
        setStartDate(format(startOfToday(), "yyyy-MM-dd"));
    };

    const copyToClipboard = () => {
        if (attendanceData.length === 0) return;

        const rows = attendanceData.map(
            ({ fecha, hora, clase, descripcion, tp }) =>
                [fecha, hora, clase, descripcion, tp].join("\t")
        );
        const textToCopy = rows.join("\n");
        const errors = getInvalidErrors(attendanceData);

        navigator.clipboard.writeText(textToCopy).then(() => {
            toast(
                <div className="flex items-center gap-3 text-sm">
                    <img
                        src={
                            Object.keys(errors).length === 0
                                ? "/proceda.jpg"
                                : "/barrani.jpg"
                        }
                        alt={
                            Object.keys(errors).length === 0
                                ? "Proceda"
                                : "Barrani"
                        }
                        className="w-20 h-20 object-cover rounded-full"
                    />
                    <span>
                        {Object.keys(errors).length === 0 ? (
                            <>
                                Registros copiados, <strong>proceda!</strong>
                            </>
                        ) : (
                            <>
                                <strong> ¡Hay registros con errores!</strong>
                            </>
                        )}
                    </span>
                </div>,
                {
                    duration: 2000,
                    position: "top-right",
                }
            );
        });
    };

    const fetchFeriadosPersonalizados = async () => {
        try {
            const response = await fetch(
                "https://script.google.com/macros/s/AKfycbxq_iRiqJOxSII-U07D7ib9KUtsksvOtsRPylxqgW3Nig3N5ITSBH8FzdpIwi1QxZbT/exec"
            );
            const data: Feriado[] = await response.json();

            const normalizados = data.map((f) => ({
                ...f,
                date: new Date(f.date).toISOString().split("T")[0],
            }));

            setFeriados((prev) => {
                const combinados = [...prev, ...normalizados];

                const unicos = combinados.filter(
                    (feriado, index, self) =>
                        index === self.findIndex((f) => f.date === feriado.date)
                );

                return unicos;
            });
        } catch (err) {
            console.error("Error al recargar feriados personalizados:", err);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        fetchFeriadosPersonalizados(); // Actualiza los feriados al cerrar
        toast.success("Feriado agregado correctamente", {
            duration: 3000,
            position: "top-right",
            style: {
                background: "#4ade80",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "14px",
            },
            iconTheme: {
                primary: "#ffffff",
                secondary: "#16a34a",
            },
        });
    };
    const baseBtnStyle =
        "flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white shadow-md transition-transform transform hover:scale-105 font-medium";

    return (
        <div className="flex flex-col items-center p-6 sm:p-10 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl max-w-6xl mx-auto border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Selecciona un rango de fechas
            </h2>

            <div className="flex flex-wrap gap-10 justify-center w-full mb-8">
                <div className="flex flex-col w-full items-center sm:w-auto">
                    <label className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Fecha de Inicio
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg text-gray-800 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-md cursor-pointer"
                    />
                </div>
                <div className="flex flex-col w-full sm:w-auto items-center">
                    <label className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Fecha de Fin
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg text-gray-800 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-md cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-center mb-4">
                <label className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer">
                    <input
                        type="checkbox"
                        checked={includeWeekends}
                        onChange={() => {
                            setExcludeWeekends(!includeWeekends);
                            toast(
                                <div className="flex items-center text-sm  dark:bg-slate-900">
                                    <span></span>
                                    <img
                                        src="/jg.jpg"
                                        alt="Deleted"
                                        className="w-22 h-20 object-cover "
                                    />
                                </div>,
                                { duration: 2000, position: "top-right" }
                            );
                        }}
                        className="cursor-pointer"
                    />
                    <span className="bg-gray-300 px-3 py-1 rounded shadow-sm ">
                        Incluir Sábados y Domingos
                    </span>
                </label>
                <label className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer">
                    <input
                        type="checkbox"
                        checked={includeFeriados}
                        onChange={() => {
                            setExcludeFeriados(!includeFeriados);
                            toast(
                                <div className="flex items-center text-sm dark:bg-slate-900">
                                    <span></span>
                                    <img
                                        src="/jg.jpg"
                                        alt="Deleted"
                                        className="w-22 h-20 object-cover"
                                    />
                                </div>,
                                { duration: 2000, position: "top-right" }
                            );
                        }}
                        className="cursor-pointer"
                    />
                    <span className="bg-red-200 px-3 py-1 rounded shadow-sm">
                        Incluir Feriados
                    </span>
                </label>
            </div>

            {startDate && endDate && (
                <>
                    <p className="text-gray-800 font-medium mt-2 p-2 bg-gray-100 rounded-lg shadow text-center">
                        Rango seleccionado:{" "}
                        {format(parseISO(startDate), "dd/MM/yyyy", {
                            locale: es,
                        })}{" "}
                        -{" "}
                        {format(parseISO(endDate), "dd/MM/yyyy", {
                            locale: es,
                        })}
                    </p>
                    <button
                        onClick={generateAttendance}
                        className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-transform transform hover:scale-105"
                    >
                        Generar Planilla
                    </button>
                </>
            )}

            <div className="w-full overflow-x-auto mt-6">
                <AttendanceTable
                    key={tableKey}
                    attendanceData={attendanceData}
                    setAttendanceData={setAttendanceData}
                    feriados={feriados}
                />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-4 justify-center w-full">
                <button
                    onClick={handleAddEntrada}
                    className={`${baseBtnStyle} bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700`}
                >
                    <PlusCircle size={20} /> Agregar Entrada
                </button>
                <button
                    onClick={handleAddSalida}
                    className={`${baseBtnStyle} bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700`}
                >
                    <PlusCircle size={20} /> Agregar Salida
                </button>
                {attendanceData.length > 0 && (
                    <button
                        onClick={handleReiniciar}
                        className={`${baseBtnStyle} bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700`}
                    >
                        <RotateCcw size={20} /> Reiniciar
                    </button>
                )}
                <button
                    onClick={() => setShowModal(true)}
                    className={`${baseBtnStyle} bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700`}
                >
                    <PlusCircle size={20} /> Agregar Feriado Manualmente
                </button>
                {/* Botón destacado abajo con mismo estilo */}
                {attendanceData.length > 0 && (
                    <div className="w-full flex justify-center mt-4">
                        <button
                            onClick={copyToClipboard}
                            className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 ${baseBtnStyle} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700`}
                        >
                            <Clipboard size={24} /> Copiar registros al
                            Portapapeles
                        </button>
                    </div>
                )}
                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-xl max-w-2xl w-full relative shadow-2xl transform transition-transform scale-100 animate-fade-in-down">
                            <button
                                onClick={closeModal}
                                className="absolute top-3 right-4 text-3xl text-gray-600 hover:text-red-500 transition transform hover:scale-125"
                            >
                                &times;
                            </button>
                            <h2 className="text-2xl font-semibold mb-4 text-center">
                                Cargar Feriado Personalizado
                            </h2>
                            <iframe
                                src="https://docs.google.com/forms/d/e/1FAIpQLSfc10_zo3iy6txpByMvYTFWkfbsDFXKbdMU6cMnIYX9HCIrdw/viewform?fbzx=-7451940107771135871"
                                width="100%"
                                height="500"
                                frameBorder="0"
                                marginHeight={0}
                                marginWidth={0}
                                title="Formulario de Feriados"
                            >
                                Cargando…
                            </iframe>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateSelector;
