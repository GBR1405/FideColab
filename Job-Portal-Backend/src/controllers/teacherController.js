import { poolPromise } from "../config/db.js";
import ExcelJS from "exceljs";
import CsvReader from "csv-reader";
import Stream from "stream";
import crypto from "crypto"; // Para generar contraseñas aleatorias
import nodemailer from "nodemailer"; // Para enviar correos

// Función para generar una contraseña aleatoria
const generarContrasena = () => {
  return crypto.randomBytes(6).toString("hex"); // Genera una contraseña de 12 caracteres
};

// Función para enviar correo con la contraseña
const enviarCorreo = async (correo, contrasena) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tu_correo@gmail.com", // Configurar con credenciales reales
      pass: "tu_contraseña"
    }
  });

  const mailOptions = {
    from: "tu_correo@gmail.com",
    to: correo,
    subject: "Credenciales de acceso",
    text: `Hola, se ha creado tu cuenta. Tu contraseña es: ${contrasena}`
  };

  await transporter.sendMail(mailOptions);
};

// Función para validar si el profesor ya existe
const obtenerProfesorPorCorreo = async (correo) => {
  const resultado = await poolPromise.request()
    .input("correo", correo)
    .query(`SELECT ProfesorId FROM Profesor_TB WHERE Correo = @correo`);
  
  return resultado.recordset.length > 0 ? resultado.recordset[0].ProfesorId : null;
};

// Agregar un nuevo profesor (manual o desde archivo)
export const agregarProfesor = async (req, res) => {
  const archivo = req.file;
  const profesor = req.body;

  try {
    if (!archivo) {
      // Validación de datos
      if (!profesor.nombre || !profesor.apellido1 || !profesor.apellido2 || !profesor.genero || !profesor.correo) {
        return res.status(400).json({ message: "Faltan campos obligatorios." });
      }

      // Verificar si el profesor ya existe
      let profesorId = await obtenerProfesorPorCorreo(profesor.correo);
      
      if (!profesorId) {
        // Generar contraseña y registrar nuevo profesor
        const contrasena = generarContrasena();
        
        const resultado = await poolPromise.request()
          .input("nombre", profesor.nombre)
          .input("apellido1", profesor.apellido1)
          .input("apellido2", profesor.apellido2)
          .input("genero", profesor.genero)
          .input("correo", profesor.correo)
          .input("contrasena", contrasena)
          .query(`
            INSERT INTO Profesor_TB (Nombre, Apellido1, Apellido2, Genero, Correo, Contrasena)
            OUTPUT INSERTED.ProfesorId
            VALUES (@nombre, @apellido1, @apellido2, @genero, @correo, @contrasena)
          `);
        
        profesorId = resultado.recordset[0].ProfesorId;
        await enviarCorreo(profesor.correo, contrasena);
      }

      return res.status(201).json({ message: "Profesor agregado o asociado exitosamente.", profesorId });
    }

    // Si hay archivo, procesarlo
    let profesores = [];

    if (archivo.mimetype === "text/csv") {
      const stream = new Stream.Readable();
      stream.push(archivo.buffer);
      stream.push(null);
      const reader = new CsvReader(stream, { headers: true, delimiter: "," });

      for await (const row of reader) {
        profesores.push(row);
      }
    } else if (archivo.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(archivo.buffer);
      const worksheet = workbook.getWorksheet(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          profesores.push({
            nombre: row.getCell(1).text,
            apellido1: row.getCell(2).text,
            apellido2: row.getCell(3).text,
            genero: row.getCell(4).text,
            correo: row.getCell(5).text
          });
        }
      });
    } else {
      return res.status(400).json({ message: "Formato de archivo no soportado." });
    }

    // Insertar profesores evitando duplicados
    for (const prof of profesores) {
      if (!prof.nombre || !prof.apellido1 || !prof.apellido2 || !prof.genero || !prof.correo) {
        continue;
      }

      let profesorId = await obtenerProfesorPorCorreo(prof.correo);

      if (!profesorId) {
        const contrasena = generarContrasena();

        const resultado = await poolPromise.request()
          .input("nombre", prof.nombre)
          .input("apellido1", prof.apellido1)
          .input("apellido2", prof.apellido2)
          .input("genero", prof.genero)
          .input("correo", prof.correo)
          .input("contrasena", contrasena)
          .query(`
            INSERT INTO Profesor_TB (Nombre, Apellido1, Apellido2, Genero, Correo, Contrasena)
            OUTPUT INSERTED.ProfesorId
            VALUES (@nombre, @apellido1, @apellido2, @genero, @correo, @contrasena)
          `);

        profesorId = resultado.recordset[0].ProfesorId;
        await enviarCorreo(prof.correo, contrasena);
      }
    }

    return res.status(200).json({ message: "Profesores agregados exitosamente." });
  } catch (error) {
    console.error("Error al agregar profesor:", error);
    return res.status(500).json({ message: "Hubo un error al agregar el profesor. Inténtalo nuevamente." });
  }
};

// Editar un profesor
export const editarProfesor = async (req, res) => {
  const { correo } = req.params;
  const { nombre, apellido1, apellido2, genero } = req.body;

  try {
    // Verificar si el profesor existe
    const profesorId = await obtenerProfesorPorCorreo(correo);
    if (!profesorId) {
      return res.status(404).json({ message: "Profesor no encontrado." });
    }

    // Actualizar los datos del profesor
    await poolPromise.request()
      .input("nombre", nombre)
      .input("apellido1", apellido1)
      .input("apellido2", apellido2)
      .input("genero", genero)
      .input("correo", correo)
      .query(`
        UPDATE Profesor_TB 
        SET Nombre = @nombre, Apellido1 = @apellido1, Apellido2 = @apellido2, Genero = @genero
        WHERE Correo = @correo
      `);

    return res.status(200).json({ message: "Profesor editado exitosamente." });
  } catch (error) {
    console.error("Error al editar profesor:", error);
    return res.status(500).json({ message: "Hubo un error al editar el profesor." });
  }
};

// Eliminar un profesor
export const eliminarProfesor = async (req, res) => {
  const { correo } = req.params;

  try {
    // Verificar si el profesor existe
    const profesorId = await obtenerProfesorPorCorreo(correo);
    if (!profesorId) {
      return res.status(404).json({ message: "Profesor no encontrado." });
    }

    // Eliminar profesor de la base de datos
    await poolPromise.request()
      .input("correo", correo)
      .query(`DELETE FROM Profesor_TB WHERE Correo = @correo`);

    return res.status(200).json({ message: "Profesor eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar profesor:", error);
    return res.status(500).json({ message: "Hubo un error al eliminar el profesor." });
  }
};

// Deshabilitar un profesor
export const deshabilitarProfesor = async (req, res) => {
  const { correo } = req.params;

  try {
    // Verificar si el profesor existe
    const profesorId = await obtenerProfesorPorCorreo(correo);
    if (!profesorId) {
      return res.status(404).json({ message: "Profesor no encontrado." });
    }

    // Marcar al profesor como inactivo
    await poolPromise.request()
      .input("correo", correo)
      .query(`
        UPDATE Profesor_TB 
        SET Activo = 0  -- 0 para inactivo
        WHERE Correo = @correo
      `);

    return res.status(200).json({ message: "Profesor deshabilitado exitosamente." });
  } catch (error) {
    console.error("Error al deshabilitar profesor:", error);
    return res.status(500).json({ message: "Hubo un error al deshabilitar el profesor." });
  }
};
