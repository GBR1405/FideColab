import { poolPromise } from "../config/db.js";  // Conexión a la base de datos
import ExcelJS from "exceljs";  // Para manejar archivos Excel
import csvParser from "csv-parser";  // Para manejar archivos CSV
import multer from "multer";  // Para la subida de archivos
import fs from "fs";  // Para manejar archivos en el servidor
import { promisify } from "util";  // Para convertir funciones a promesas
import bcrypt from "bcryptjs";  // Para cifrar contraseñas

const unlinkAsync = promisify(fs.unlink);

// Configurar Multer para manejar la subida de archivos
const upload = multer({ dest: "uploads/" });

// Función para validar formato de correo
const validarCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

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
        if (validarCorreo(row.Correo) && row.Nombre && row.Contrasena && row.Rol) {
          usuarios.push({
            nombre: row.Nombre.trim(),
            correo: row.Correo.trim(),
            contrasena: row.Contrasena.trim(),
            rol: row.Rol.trim(),
            curso: row.Curso ? row.Curso.trim() : null
          });
        }
      }
    } else if (fileExtension === "xlsx") {
      // Leer Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.worksheets[0];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const nombre = row.getCell(1).text.trim();
          const correo = row.getCell(2).text.trim();
          const contrasena = row.getCell(3).text.trim();
          const rol = row.getCell(4).text.trim();
          const curso = row.getCell(5).text.trim();

          if (validarCorreo(correo) && nombre && contrasena && rol) {
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

      const valores = await Promise.all(usuarios.map(async (u) => {
        const contrasenaCifrada = await bcrypt.hash(u.contrasena, 10);  // Cifrar contraseña

        // Verificar si el correo ya existe en la base de datos
        const existeUsuario = await pool.request()
          .input("correo", u.correo)
          .query("SELECT 1 FROM Usuario_TB WHERE Correo = @correo");

        if (existeUsuario.recordset.length > 0) {
          return null;  // Si ya existe, no insertamos
        }

        return {
          nombre: u.nombre,
          correo: u.correo,
          contrasenaCifrada,
          rol: u.rol,
          curso: u.curso || null
        };
      }));

      // Filtrar valores no nulos (si ya existían registros con ese correo)
      const usuariosFinales = valores.filter((v) => v !== null);

      if (usuariosFinales.length > 0) {
        const query = `
          INSERT INTO Usuario_TB (Nombre, Correo, Contrasena, Rol, Curso)
          VALUES @usuarios
        `;

        // Usar parámetros en la consulta para evitar inyecciones SQL
        const request = pool.request();
        usuariosFinales.forEach((usuario, index) => {
          request.input(`nombre${index}`, usuario.nombre);
          request.input(`correo${index}`, usuario.correo);
          request.input(`contrasena${index}`, usuario.contrasenaCifrada);
          request.input(`rol${index}`, usuario.rol);
          request.input(`curso${index}`, usuario.curso);
        });

        await request.query(query);
        
        return res.status(201).json({ message: "Datos cargados exitosamente." });
      } else {
        return res.status(400).json({ message: "Algunos usuarios ya existen." });
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
      unlinkAsync(req.file.path).catch((err) => console.error("Error al eliminar archivo:", err));
    }
  }
};
