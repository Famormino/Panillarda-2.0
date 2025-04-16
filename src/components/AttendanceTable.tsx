import React from "react";
import { isWeekend, parse, format } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, Trash, Check, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { AttendanceRecord, Feriado } from "./DateSelector";

const getInvalidErrors = (
    records: AttendanceRecord[]
): { [index: number]: string } => {
    const errors: { [index: number]: string } = {};

    // Error si la fecha está vacía
    records.forEach((record, index) => {
        if (!record.fecha.trim()) {
            errors[index] = "Fecha vacía";
        }
    });

    // Error en registros duplicados (todos los campos iguales)
    records.forEach((record, index, array) => {
        const duplicateFound = array.some(
            (r, i) =>
                i !== index &&
                r.fecha === record.fecha &&
                r.hora === record.hora &&
                r.clase === record.clase &&
                r.descripcion === record.descripcion &&
                r.tp === record.tp
        );
        if (duplicateFound) {
            errors[index] = errors[index]
                ? errors[index] + " / Registro duplicado"
                : "Registro duplicado";
        }
    });

    // Validar pares: para cada fecha, el número de "P10" debe ser igual al de "P20"
    const groups: { [fecha: string]: { p10: number[]; p20: number[] } } = {};
    records.forEach((record, index) => {
        if (record.fecha.trim()) {
            if (!groups[record.fecha])
                groups[record.fecha] = { p10: [], p20: [] };
            if (record.clase.toUpperCase() === "P10")
                groups[record.fecha].p10.push(index);
            else if (record.clase.toUpperCase() === "P20")
                groups[record.fecha].p20.push(index);
        }
    });
    Object.values(groups).forEach((group) => {
        if (group.p10.length !== group.p20.length) {
            group.p10.concat(group.p20).forEach((i) => {
                errors[i] = errors[i]
                    ? errors[i] + " / Par incompleto"
                    : "Par incompleto";
            });
        }
    });

    return errors;
};

type AttendanceTableProps = {
    attendanceData: AttendanceRecord[];
    setAttendanceData: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
    feriados: Feriado[];
};

const AttendanceTable: React.FC<AttendanceTableProps> = ({
    attendanceData,
    setAttendanceData,
    feriados,
}) => {
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
    const [editedRecord, setEditedRecord] =
        React.useState<AttendanceRecord | null>(null);

    if (attendanceData.length === 0) return null;

    const invalidErrors = getInvalidErrors(attendanceData);
    // Determina el "Tipo día" según feriado, fin de semana o normal.
    const getTipoDia = (
        record: AttendanceRecord,
        feriados: Feriado[]
    ): string => {
        if (!record.fecha.trim()) return "";
        const dateObj = parse(record.fecha, "dd/MM/yyyy", new Date());
        // Convertir la fecha del registro a formato "yyyy-MM-dd"
        const recordISO = format(dateObj, "yyyy-MM-dd");
        // Si la API retorna la fecha ya en ese formato, se puede comparar directamente
        const holiday = feriados.find((f) => f.date === recordISO);
        if (holiday) return holiday.name; // Retorna el nombre del feriado
        if (isWeekend(dateObj)) return "Fin de semana";
        return "Normal";
    };

    const handleDelete = (index: number) => {
        const record = attendanceData[index];
        setAttendanceData(attendanceData.filter((_, i) => i !== index));
        toast(
            <div className="flex items-center gap-3 text-sm">
                <span>
                    <strong>
                        {record.fecha
                            ? `Día: ${record.fecha} - ${record.clase}`
                            : "Registro sin fecha"}
                    </strong>
                </span>
                <img
                    src="/afuera.jpg"
                    alt="Deleted"
                    className="w-20 h-20 object-cover rounded-full"
                />
            </div>,
            { duration: 2000, position: "top-right" }
        );
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditedRecord(attendanceData[index]);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        field: keyof AttendanceRecord
    ) => {
        if (editedRecord) {
            let newValue = e.target.value;
            if (field === "fecha") {
                newValue = format(
                    parse(newValue, "yyyy-MM-dd", new Date()),
                    "dd/MM/yyyy"
                );
            }
            setEditedRecord({ ...editedRecord, [field]: newValue });
        }
    };

    const handleSave = () => {
        if (editedRecord !== null && editingIndex !== null) {
            toast(
                <div className="flex items-center gap-3 text-sm">
                    <img
                        src="/modificado.jpg"
                        alt="Modificado"
                        className="w-20 h-20 object-cover"
                    />
                    <span>
                        <strong>Registro modificado!</strong>
                    </span>
                </div>,
                { duration: 2000, position: "top-right" }
            );
            const updatedData = [...attendanceData];
            updatedData[editingIndex] = editedRecord;
            setAttendanceData(updatedData);
            setEditingIndex(null);
            setEditedRecord(null);
        }
    };

    return (
        <div className="w-full overflow-x-auto mt-6 relative">
            {/* Overlay global para bloquear interacciones cuando se edita */}
            {editingIndex !== null && (
                <div className="fixed inset-0 bg-black/60 z-10"></div>
            )}
            <table className="min-w-full border-collapse shadow-md mt-6 w-full max-w-6xl mx-auto relative z-20 overflow-hidden">
                <thead>
                    <tr className="bg-gray-200 text-gray-700">
                        <th className="border border-gray-300 px-6 py-3">
                            Fecha
                        </th>
                        <th className="border border-gray-300 px-6 py-3">
                            Hora
                        </th>
                        <th className="border border-gray-300 px-6 py-3">
                            Clase
                        </th>
                        <th className="border border-gray-300 px-6 py-3">
                            Descripción
                        </th>
                        <th className="border border-gray-300 px-6 py-3">TP</th>
                        <th className="border border-gray-300 px-6 py-3">
                            Tipo día
                        </th>
                        <th className="border border-gray-300 px-6 py-3">
                            Error
                        </th>
                        <th className="border border-gray-300 px-6 py-3">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceData.map((record, index) => {
                        const dateObj = record.fecha
                            ? parse(record.fecha, "dd/MM/yyyy", new Date())
                            : null;
                        const dayLabel = dateObj
                            ? format(dateObj, "EEEE", { locale: es })
                            : "";
                        const rowBg =
                            dateObj && isWeekend(dateObj)
                                ? "bg-gray-200"
                                : "bg-white";
                        const isEditing = editingIndex === index;
                        const errorMsg = invalidErrors[index] || "";
                        const tipoDia = record.fecha
                            ? getTipoDia(record, feriados)
                            : "";

                        return (
                            <tr
                                key={index}
                                className={`text-center cursor-pointer relative transition-all duration-300 ease-in-out ${rowBg} ${
                                    isEditing
                                        ? "z-30 bg-white scale-[1.01] shadow-lg shadow-black/20 ring-2 ring-blue-500"
                                        : "hover:bg-gray-200"
                                } ${errorMsg ? "border-2 border-red-400" : ""}`}
                                title={dateObj ? `Día: ${dayLabel}` : ""}
                            >
                                {isEditing ? (
                                    <>
                                        <td className="border border-gray-300 px-6 py-3">
                                            <input
                                                type="date"
                                                value={
                                                    editedRecord?.fecha
                                                        ? format(
                                                              parse(
                                                                  editedRecord.fecha,
                                                                  "dd/MM/yyyy",
                                                                  new Date()
                                                              ),
                                                              "yyyy-MM-dd"
                                                          )
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    handleChange(e, "fecha")
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    handleSave()
                                                }
                                                className="w-full border px-2 py-1 text-center"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            <input
                                                type="time"
                                                value={editedRecord?.hora || ""}
                                                onChange={(e) =>
                                                    handleChange(e, "hora")
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    handleSave()
                                                }
                                                className="w-full border px-2 py-1 text-center"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            <select
                                                value={
                                                    editedRecord?.clase || ""
                                                }
                                                onChange={(e) =>
                                                    handleChange(e, "clase")
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    handleSave()
                                                }
                                                className="w-full border px-2 py-1 text-center"
                                            >
                                                <option value="P10">P10</option>
                                                <option value="P20">P20</option>
                                            </select>
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            <input
                                                type="text"
                                                value={
                                                    editedRecord?.descripcion ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        e,
                                                        "descripcion"
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    handleSave()
                                                }
                                                className="w-full border px-2 py-1 text-center"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            <input
                                                type="text"
                                                maxLength={1}
                                                value={editedRecord?.tp || ""}
                                                onChange={(e) =>
                                                    handleChange(e, "tp")
                                                }
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" &&
                                                    handleSave()
                                                }
                                                className="w-full border px-2 py-1 text-center"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            {getTipoDia(
                                                editedRecord!,
                                                feriados
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            {errorMsg && (
                                                <span className="flex items-center justify-center gap-1 text-red-600 text-sm">
                                                    <AlertTriangle size={18} />{" "}
                                                    {errorMsg}
                                                </span>
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            <button
                                                onClick={handleSave}
                                                className="text-green-600 hover:text-green-800 animate-pulse"
                                                title="Guardar cambios"
                                            >
                                                <Check size={30} />
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="border border-gray-300 px-6 py-3">
                                            {record.fecha}
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            {record.hora}
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            {record.clase}
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            {record.descripcion}
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            {record.tp}
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            {tipoDia}
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3">
                                            {errorMsg ? (
                                                <span className="flex items-center justify-center gap-1 text-red-600 text-sm">
                                                    <AlertTriangle size={18} />{" "}
                                                    {errorMsg}
                                                </span>
                                            ) : (
                                                ""
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-6 py-3 flex gap-2 justify-center">
                                            <button
                                                onClick={() =>
                                                    handleEdit(index)
                                                }
                                                className="text-blue-600 hover:text-blue-800 mx-1"
                                                title="Editar registro"
                                            >
                                                <Pencil size={22} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(index)
                                                }
                                                className="text-red-600 hover:text-red-800 mx-1"
                                                title="Eliminar registro"
                                            >
                                                <Trash size={22} />
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceTable;
