import * as XLSX from "xlsx";

export const processFileMiddleware = async (file) => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(fileBuffer, { type: "array" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Matriz de arrays

    // Buscar la fila donde están los encabezados reales
    const headerIndex = rows.findIndex(row =>
      row[0] === "Nombre" &&
      row[1] === "Apellido1" &&
      row[2] === "Apellido2" &&
      row[3] === "Correo"
    );

    if (headerIndex === -1) {
      throw new Error("No se encontró encabezado válido en la plantilla.");
    }

    // Obtener datos debajo de la fila de encabezado
    const profesores = rows
      .slice(headerIndex + 1)
      .filter(row => row.length >= 4 && row[0]) // evitar vacíos
      .map(row => ({
        name: row[0].trim(),
        lastName1: row[1].trim(),
        lastName2: row[2].trim(),
        email: row[3].trim(),
        gender: "3" // Fijado como pediste
      }));

    return profesores;
  } catch (error) {
    console.error("Error al procesar el archivo:", error);
    throw new Error("Error al procesar el archivo");
  }
};
