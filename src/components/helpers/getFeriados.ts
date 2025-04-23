import { Feriado } from "../DateSelector";

export const getFeriados = async (
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
