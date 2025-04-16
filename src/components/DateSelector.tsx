import React, { useEffect, useState } from "react";
import {
    format,
    eachDayOfInterval,
    parseISO,
    isWeekend,
    startOfToday,
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
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(
        []
    );
    const [feriados, setFeriados] = useState<Feriado[]>([]);

    const [tableKey, setTableKey] = useState(0);
    console.log(attendanceData);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        getFeriados(currentYear, "AR").then((data) => setFeriados(data));
    }, []);

    const generateAttendance = () => {
        if (!startDate || !endDate) return;

        const dateRange = eachDayOfInterval({
            start: parseISO(startDate),
            end: parseISO(endDate),
        }).filter((date) => includeWeekends || !isWeekend(date));

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
        <div className="flex flex-col max-w-5xl items-center p-6 bg-white shadow-lg rounded-xl w-full  mx-auto border border-gray-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Selecciona un rango de fechas
            </h2>
            <div className="flex items-center space-x-6 w-full justify-center">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                        Fecha de inicio
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm cursor-pointer"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                        Fecha de fin
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm cursor-pointer"
                    />
                </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
                <label
                    htmlFor="excludeWeekends"
                    className="cursor-pointer text-m text-gray-600 flex items-center gap-2 font-bold"
                >
                    <input
                        id="excludeWeekends"
                        type="checkbox"
                        checked={includeWeekends}
                        onChange={() => setExcludeWeekends(!includeWeekends)}
                        className="cursor-pointer"
                    />
                    Incluir sábados y domingos
                </label>
            </div>
            {startDate && endDate && (
                <>
                    <p className="text-gray-700 font-medium mt-4 p-2 bg-gray-100 rounded-lg shadow-inner">
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
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow transition hover:bg-blue-700 focus:outline-none"
                    >
                        Generar Planilla
                    </button>
                </>
            )}
            {/* Se encapsula la tabla para controlar el desborde */}
            <div className="w-full overflow-x-auto">
                <AttendanceTable
                    key={tableKey}
                    attendanceData={attendanceData}
                    setAttendanceData={setAttendanceData}
                    feriados={feriados}
                />
            </div>
            <div className="mt-6 flex flex-wrap gap-4 justify-center w-full">
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
