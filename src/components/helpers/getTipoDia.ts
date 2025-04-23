import { format, isWeekend, parse } from "date-fns";
import { AttendanceRecord, Feriado } from "../DateSelector";

export const getTipoDia = (
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
    if (isWeekend(dateObj)) return "Fin de Semana";
    return "Normal";
};
