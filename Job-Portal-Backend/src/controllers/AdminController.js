import { poolPromise } from "../config/db.js";  // Conexión a la base de datos
import exceljs from "exceljs";  // Para manejar archivos Excel
import csvParser from "csv-parser";  // Para manejar archivos CSV
import multer from "multer";  // Para la subida de archivos
import fs from "fs";  // Para manejar archivos en el servidor

// Configurar Multer para manejar la subida de archivos
const upload = multer({ dest: "uploads/" });

// Función para cargar datos desde un archivo
export const cargarDatos = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Debe subir un archivo válido." });
    }

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();
    let usuarios = [];

    if (fileExtension === "csv") {
      // Leer CSV
      const stream = fs.createReadStream(filePath).pipe(csvParser());
      for await (const row of stream) {
        usuarios.push({
          nombre: row.Nombre,
          correo: row.Correo,
          contrasena: row.Contrasena,
          rol: row.Rol,
          curso: row.Curso,
        });
      }
    } else if (fileExtension === "xlsx") {
      // Leer Excel
      const workbook = new exceljs.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.worksheets[0];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const nombre = row.getCell(1).text.trim();
          const correo = row.getCell(2).text.trim();
          const contrasena = row.getCell(3).text.trim();
          const rol = row.getCell(4).text.trim();
          const curso = row.getCell(5).text.trim();

          if (nombre && correo) {
            usuarios.push({ nombre, correo, contrasena, rol, curso });
          }
        }
      });
    } else {
      return res.status(400).json({ message: "Formato de archivo no soportado. Use CSV o Excel." });
    }

    // Insertar en la base de datos si hay usuarios válidos
    if (usuarios.length > 0) {
      const pool = await poolPromise;
      const transaction = pool.transaction();

      try {
        await transaction.begin();

        for (const usuario of usuarios) {
          await transaction.request()
            .input("nombre", usuario.nombre)
            .input("correo", usuario.correo)
            .input("contrasena", usuario.contrasena)
            .input("rol", usuario.rol)
            .input("curso", usuario.curso)
            .query(`
              INSERT INTO Usuario_TB (Nombre, Correo, Contrasena, Rol, Curso)
              VALUES (@nombre, @correo, @contrasena, @rol, @curso)
            `);
        }

        await transaction.commit();
        return res.status(201).json({ message: "Datos cargados exitosamente." });
      } catch (error) {
        await transaction.rollback();
        console.error("Error al insertar usuarios:", error);
        return res.status(500).json({ message: "Error al insertar datos en la base de datos." });
      }
    } else {
      return res.status(400).json({ message: "No se encontraron usuarios válidos en el archivo." });
    }
  } catch (error) {
    console.error("Error al procesar el archivo:", error);
    return res.status(500).json({ message: "Error al procesar el archivo." });
  } finally {
    // Eliminar el archivo después de procesarlo
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};
