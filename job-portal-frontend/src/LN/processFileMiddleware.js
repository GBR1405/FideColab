import * as XLSX from 'xlsx';

// Middleware para procesar el archivo XLSX y extraer los datos relevantes
export const processFileMiddleware = async (file) => {
  try {
    // Leer el archivo XLSX
    const fileBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    
    // Extraer la primera hoja del archivo
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Aquí puedes hacer la transformación necesaria para los datos
    const profesores = data.map((prof) => ({
      name: prof.Nombre,
      lastName1: prof.Apellido1,
      lastName2: prof.Apellido2,
      email: prof.Correo,
      gender: prof.Genero_ID_FK, // Asegúrate de que esto sea correcto según tu archivo
    }));

    // Retornar los datos procesados
    return profesores;
  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    throw new Error('Error al procesar el archivo');
  }
};
