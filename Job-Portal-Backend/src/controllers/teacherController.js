import { poolPromise } from "../config/db.js";  // Importamos el poolPromise
import Profesor from "../models/profesorModel.js";  // Asegúrate de que la ruta sea correcta para tu modelo

// Agregar un nuevo profesor desde un archivo o manualmente
export const agregarProfesor = async (req, res) => {
  const archivo = req.file;  // Suponiendo que estás usando un middleware para manejar el archivo
  const profesor = req.body;  // El profesor que se va a agregar manualmente

  try {
    if (!archivo || archivo.length === 0) {
      // Si no hay archivo, se agrega el profesor manualmente
      await poolPromise.request()
        .input('nombre', profesor.nombre)
        .input('correo', profesor.correo)
        .input('curso', profesor.curso)
        .query(`
          INSERT INTO Profesor_TB (Nombre, Correo, Curso)
          VALUES (@nombre, @correo, @curso)
        `);

      return res.status(201).json({ message: "Profesor agregado exitosamente." });
    }

    // Si hay archivo, se carga desde el archivo (CSV o Excel)
    let profesores = [];

    if (archivo.mimetype === "text/csv") {
      // Cargar desde CSV
      const reader = new StreamReader(archivo.buffer);
      const csv = new CsvReader(reader, { header: true });
      profesores = await csv.fromFile();

    } else if (archivo.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      // Cargar desde Excel
      const excelFile = new ExcelJS.Workbook();
      await excelFile.xlsx.load(archivo.buffer);
      const worksheet = excelFile.getWorksheet(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          profesores.push({
            nombre: row.getCell(1).text,
            correo: row.getCell(2).text,
            curso: row.getCell(3).text
          });
        }
      });
    }

    // Insertar profesores desde el archivo en la base de datos
    for (const profesor of profesores) {
      await poolPromise.request()
        .input('nombre', profesor.nombre)
        .input('correo', profesor.correo)
        .input('curso', profesor.curso)
        .query(`
          INSERT INTO Profesor_TB (Nombre, Correo, Curso)
          VALUES (@nombre, @correo, @curso)
        `);
    }

    return res.status(200).json({ message: "Profesores agregados exitosamente." });
  } catch (error) {
    console.error("Error al agregar profesor:", error);
    return res.status(500).json({ message: "Hubo un error al agregar el profesor. Inténtalo nuevamente." });
  }
};

// Asignar un profesor a un grupo
export const asignarProfesorAGrupo = async (req, res) => {
  const { profesorId, grupoCursoId } = req.body;

  try {
    // Verificar si el grupo ya tiene un profesor asignado
    const grupoExistente = await poolPromise.request()
      .input('grupoCursoId', grupoCursoId)
      .query(`
        SELECT * FROM GrupoVinculado
        WHERE GrupoCursoId = @grupoCursoId AND EsGuia = 1
      `);

    if (grupoExistente.recordset.length > 0) {
      return res.status(400).json({ message: "Este grupo ya tiene un profesor asignado." });
    }

    // Asignar el profesor al grupo
    await poolPromise.request()
      .input('profesorId', profesorId)
      .input('grupoCursoId', grupoCursoId)
      .query(`
        INSERT INTO GrupoVinculado (ProfesorId, GrupoCursoId, EsGuia)
        VALUES (@profesorId, @grupoCursoId, 1)
      `);

    return res.status(200).json({ message: "Profesor asignado al grupo exitosamente." });
  } catch (error) {
    console.error("Error al asignar profesor:", error);
    return res.status(500).json({ message: "Hubo un error al asignar el profesor. Inténtalo nuevamente." });
  }
};

// Ver grupos sin profesor asignado
export const verGruposSinProfesor = async (req, res) => {
  try {
    const gruposSinProfesor = await poolPromise.request()
      .query(`
        SELECT * FROM GrupoCurso gc
        WHERE NOT EXISTS (
          SELECT 1 FROM GrupoVinculado gv
          WHERE gv.GrupoCursoId = gc.GrupoCursoId AND gv.EsGuia = 1
        )
      `);

    return res.status(200).json(gruposSinProfesor.recordset);
  } catch (error) {
    console.error("Error al obtener los grupos sin profesor:", error);
    return res.status(500).json({ message: "Hubo un error al obtener los grupos. Inténtalo nuevamente." });
  }
};
