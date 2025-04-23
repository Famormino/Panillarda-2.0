import { AttendanceRecord } from "../DateSelector";

export const getInvalidErrors = (
    records: AttendanceRecord[]
): { [index: number]: string } => {
    const errors: { [index: number]: string } = {};

    // Error si la fecha está vacía
    records.forEach((record, index) => {
        if (!record.fecha.trim()) {
            errors[index] = "Fecha Vacía";
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
                ? errors[index] + " / Registro Duplicado"
                : "Registro Duplicado";
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
                    ? errors[i] + " / Par Entrada-Salida Incompleto"
                    : "Par Entrada-Salida Incompleto";
            });
        }
    });

    return errors;
};
