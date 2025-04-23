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

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        getFeriados(currentYear, "AR").then((data) => setFeriados(data));
    }, []);

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

    return (
        <div className="flex flex-col items-center p-6 sm:p-10 bg-white shadow-2xl rounded-2xl max-w-7xl mx-auto border border-gray-200">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Selecciona un rango de fechas
            </h2>

            <div className="flex flex-wrap gap-10 justify-center w-full mb-8">
                <div className="flex flex-col w-full items-center sm:w-auto">
                    <label className="text-md font-semibold text-gray-700 mb-2">
                        Fecha de Inicio
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-md cursor-pointer"
                    />
                </div>
                <div className="flex flex-col w-full sm:w-auto items-center">
                    <label className="text-md font-semibold text-gray-700 mb-2">
                        Fecha de Fin
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-md cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-center mb-4">
                <label className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer">
                    <input
                        type="checkbox"
                        checked={includeWeekends}
                        onChange={() => setExcludeWeekends(!includeWeekends)}
                        className="cursor-pointer"
                    />
                    <span className="bg-gray-300 px-3 py-1 rounded shadow-sm">
                        Incluir Sábados y Domingos
                    </span>
                </label>
                <label className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer">
                    <input
                        type="checkbox"
                        checked={includeFeriados}
                        onChange={() => setExcludeFeriados(!includeFeriados)}
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
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-transform transform hover:scale-105"
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

            <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4 justify-center w-full">
                <button
                    onClick={handleAddEntrada}
                    className="flex items-center gap-2 px-5 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition"
                >
                    <PlusCircle size={20} /> Agregar Entrada
                </button>
                <button
                    onClick={handleAddSalida}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition"
                >
                    <PlusCircle size={20} /> Agregar Salida
                </button>
                {attendanceData.length > 0 && (
                    <button
                        onClick={handleReiniciar}
                        className="flex items-center gap-2 px-5 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition"
                    >
                        <RotateCcw size={20} /> Reiniciar
                    </button>
                )}
                {attendanceData.length > 0 && (
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-8 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
                    >
                        <Clipboard size={24} /> Copiar registros al Portapapeles
                    </button>
                )}
            </div>
        </div>
    );
};

export default DateSelector;
