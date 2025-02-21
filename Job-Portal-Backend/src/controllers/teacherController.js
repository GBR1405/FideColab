import { poolPromise } from "../config/db.js";  // Importamos el poolPromise
import ExcelJS from "exceljs";  // Librería para manejar archivos Excel
import CsvReader from "csv-reader";  // Librería para manejar archivos CSV
import Stream from "stream";  // Para leer archivos en memoria

// Agregar un nuevo profesor desde un archivo o manualmente
export const agregarProfesor = async (req, res) => {
  const archivo = req.file;  // Archivo enviado en la petición
  const profesor = req.body;  

  try {
    // Si no hay archivo, se agrega el profesor manualmente
    if (!archivo || archivo.length === 0) {
      if (!profesor.nombre || !profesor.correo || !profesor.cursoId) {
        return res.status(400).json({ message: "Faltan campos obligatorios." });
      }

      await poolPromise.request()
        .input('nombre', profesor.nombre)
        .input('correo', profesor.correo)
        .input('cursoId', profesor.cursoId)
        .query(`
          INSERT INTO Profesor_TB (Nombre, Correo, CursoId)
          VALUES (@nombre, @correo, @cursoId)
        `);

      return res.status(201).json({ message: "Profesor agregado exitosamente." });
    }

    // Si hay archivo, se procesa el contenido
    let profesores = [];

    if (archivo.mimetype === "text/csv") {
      // Cargar desde CSV
      const stream = new Stream.Readable();
      stream.push(archivo.buffer);
      stream.push(null);

      const reader = new CsvReader(stream, { headers: true, delimiter: "," });

      for await (const row of reader) {
        profesores.push({
          nombre: row.nombre,
          correo: row.correo,
          cursoId: row.cursoId
        });
      }
    } else if (archivo.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      // Cargar desde Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(archivo.buffer);
      const worksheet = workbook.getWorksheet(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          profesores.push({
            nombre: row.getCell(1).text,
            correo: row.getCell(2).text,
            cursoId: row.getCell(3).text
          });
        }
      });
    }

    // Insertar profesores desde el archivo en la base de datos
    for (const prof of profesores) {
      await poolPromise.request()
        .input('nombre', prof.nombre)
        .input('correo', prof.correo)
        .input('cursoId', prof.cursoId)
        .query(`
          INSERT INTO Profesor_TB (Nombre, Correo, CursoId)
          VALUES (@nombre, @correo, @cursoId)
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
  const { profesorId, grupoId } = req.body;

  try {
    // Verificar si el grupo ya tiene un profesor asignado
    const grupoExistente = await poolPromise.request()
      .input('grupoId', grupoId)
      .query(`
        SELECT * FROM GrupoVinculado
        WHERE GrupoId = @grupoId AND EsGuia = 1
      `);

    if (grupoExistente.recordset.length > 0) {
      return res.status(400).json({ message: "Este grupo ya tiene un profesor asignado." });
    }

    // Asignar el profesor al grupo
    await poolPromise.request()
      .input('profesorId', profesorId)
      .input('grupoId', grupoId)
      .query(`
        INSERT INTO GrupoVinculado (ProfesorId, GrupoId, EsGuia)
        VALUES (@profesorId, @grupoId, 1)
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
        SELECT gc.GrupoId, gc.NombreGrupo
        FROM GrupoCurso gc
        LEFT JOIN GrupoVinculado gv ON gc.GrupoId = gv.GrupoId AND gv.EsGuia = 1
        WHERE gv.GrupoId IS NULL
      `);

    if (gruposSinProfesor.recordset.length === 0) {
      return res.status(404).json({ message: "No hay grupos sin profesor asignado." });
    }

    return res.status(200).json(gruposSinProfesor.recordset);
  } catch (error) {
    console.error("Error al obtener los grupos sin profesor:", error);
    return res.status(500).json({ message: "Hubo un error al obtener los grupos. Inténtalo nuevamente." });
  }
};

// Obtener lista de profesores
export const obtenerProfesores = async (req, res) => {
  try {
    const profesores = await poolPromise.request()
      .query("SELECT ProfesorId, Nombre, Correo FROM Profesor_TB");

    return res.status(200).json(profesores.recordset);
  } catch (error) {
    console.error("Error al obtener los profesores:", error);
    return res.status(500).json({ message: "Hubo un error al obtener los profesores." });
  }
};

// Obtener lista de cursos
export const obtenerCursos = async (req, res) => {
  try {
    const cursos = await poolPromise.request()
      .query("SELECT CursoId, NombreCurso FROM Curso_TB");

    return res.status(200).json(cursos.recordset);
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    return res.status(500).json({ message: "Hubo un error al obtener los cursos." });
  }
};
