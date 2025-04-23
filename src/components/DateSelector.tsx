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

export type Feriado = {
    name: string;
    date: string;
    localName: string;
};

const getFeriados = async (
    year: number,
    countryCode: string = "AR"
): Promise<Feriado[]> => {
    try {
        const response = await fetch(
            `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
        );
        if (!response.ok) {
            throw new Error("Error al obtener feriados");
        }
        const feriados = await response.json();
        return feriados.map((feriado: Feriado) => ({
            date: feriado.date,
            name: feriado.localName,
        }));
    } catch (error) {
        console.log(error);
        return [];
    }
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

            // Si no está seleccionado uno de ellos, se filtran.
            // Si está incluido incluir fines de semana o feriados, se aceptan.
            if (!includeWeekends && isWeekendDay) return false;
            if (!includeFeriados && isFeriado) return false;

            // Pasa el filtro
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

        // Combinar datos existentes con los nuevos
        const combined = [...attendanceData, ...newData];

        // Filtrar registros duplicados basados en fecha, hora y clase
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
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast(
                <div className="flex items-center gap-3 text-sm">
                    <img
                        src="/proceda.jpg"
                        alt="Deleted"
                        className="w-20 h-20 object-cover rounded-full"
                    />
                    <span>
                        Registros copiados, <strong>proceda!</strong>
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
        <div className="flex flex-col items-center p-4 sm:p-6 bg-white shadow-lg rounded-xl max-w-7xl mx-auto border border-gray-300">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Selecciona un rango de fechas
            </h2>

            <div className="flex flex-wrap gap-8 justify-center w-full mb-6">
                <div className="flex flex-col w-full items-center sm:w-auto">
                    <label className="text-m  font-semibold text-gray-700 mb-1">
                        Fecha de Inicio
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm cursor-pointer"
                    />
                </div>
                <div className="flex flex-col w-full sm:w-auto items-center">
                    <label className="text-m font-semibold text-gray-700 mb-1">
                        Fecha de Fin
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-center mb-4">
                <label
                    htmlFor="excludeWeekends"
                    className="flex items-center gap-2 text-gray-700 font-medium"
                >
                    <input
                        id="excludeWeekends"
                        type="checkbox"
                        checked={includeWeekends}
                        onChange={() => setExcludeWeekends(!includeWeekends)}
                        className="cursor-pointer"
                    />
                    <span className="bg-gray-400 from-stone-900 px-2 py-0.5 rounded cursor-pointer">
                        Incluir Sábados y Domingos
                    </span>
                </label>
                <label
                    htmlFor="excludeFeriados"
                    className="flex items-center gap-2 text-gray-700 font-medium"
                >
                    <input
                        id="excludeFeriados"
                        type="checkbox"
                        checked={includeFeriados}
                        onChange={() => setExcludeFeriados(!includeFeriados)}
                        className="cursor-pointer"
                    />
                    <span className="bg-red-200 px-2 py-0.5 rounded cursor-pointer">
                        Incluir Feriados
                    </span>
                </label>
            </div>

            {startDate && endDate && (
                <>
                    <p className="text-gray-700 font-medium mt-2 p-2 bg-gray-100 rounded-lg shadow-inner text-center">
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
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow transition hover:bg-blue-700 focus:outline-none"
                    >
                        Generar Planilla
                    </button>
                </>
            )}

            <div className="w-full overflow-x-auto mt-4">
                <AttendanceTable
                    key={tableKey}
                    attendanceData={attendanceData}
                    setAttendanceData={setAttendanceData}
                    feriados={feriados}
                />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4 justify-center w-full">
                <button
                    onClick={handleAddEntrada}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg shadow transition hover:bg-teal-600 focus:outline-none"
                    title="Agregar Registro de Entrada"
                >
                    <PlusCircle size={20} /> Agregar Entrada
                </button>
                <button
                    onClick={handleAddSalida}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow transition hover:bg-indigo-600 focus:outline-none"
                    title="Agregar Registro de Salida"
                >
                    <PlusCircle size={20} /> Agregar Salida
                </button>
                {attendanceData.length > 0 && (
                    <button
                        onClick={handleReiniciar}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg shadow transition hover:bg-gray-600 focus:outline-none"
                        title="Reiniciar Planilla"
                    >
                        <RotateCcw size={20} /> Reiniciar
                    </button>
                )}
                {attendanceData.length > 0 && (
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-12 py-2 bg-green-500 text-white rounded-lg shadow transition hover:bg-green-600 focus:outline-none"
                        title="Copiar registros al portapapeles"
                    >
                        <Clipboard size={28} /> Copiar registros al Portapapeles
                    </button>
                )}
            </div>
        </div>
    );
};
export default DateSelector;
