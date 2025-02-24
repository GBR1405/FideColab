import { poolPromise } from "../config/db.js";
import ExcelJS from "exceljs";
import CsvReader from "csv-reader";
import Stream from "stream";
import crypto from "crypto"; // Para generar contraseñas aleatorias
import nodemailer from "nodemailer"; // Para enviar correos
import bcrypt from 'bcrypt';


// Clave para encriptar y desencriptar contraseñas (guardarla de forma segura)
const llaveEncriptacion = "mi_clave_secreta"; // Reemplazar con una clave segura

// Función para generar una contraseña aleatoria
const generarContrasena = () => {
  return crypto.randomBytes(12).toString("hex"); // Genera una contraseña de 24 caracteres
};

 // Encriptar la contraseña
 const encriptarContrasena = async (contrasena) => {
  return await bcrypt.hash(contrasena, 10);
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
    text: "Hola, se ha creado tu cuenta. Tu contraseña es: ${contrasena}"
  };

  await transporter.sendMail(mailOptions);
};

 // Verificar si el usuario existe
    const userCheck = await pool.request()
      .input("usuarioId", sql.Int, usuarioId)
      .query("SELECT * FROM Usuario_TB WHERE Usuario_ID_PK = @usuarioId");

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

// Agregar un nuevo usuario (manual o desde archivo)
export const agregarUsuario = async (req, res) => {
  const archivo = req.file;
  const usuario = req.body;

  try {
    if (!archivo) {
      // Validación de datos
      if (!usuario.nombre || !usuario.apellido1 || !usuario.apellido2 || !usuario.genero || !usuario.correo) {
        return res.status(400).json({ message: "Faltan campos obligatorios." });
      }

      // Verificar si el usuario ya existe
      let usuarioId = await obtenerUsuarioPorCorreo(usuario.correo);
      
      if (!usuarioId) {
        // Generar contraseña y registrar nuevo usuario
        const contrasena = generarContrasena();
        const contrasenaEncriptada = encriptarContrasena(contrasena);

        const resultado = await poolPromise.request()
          .input("nombre", usuario.nombre)
          .input("apellido1", usuario.apellido1)
          .input("apellido2", usuario.apellido2)
          .input("genero", usuario.genero)
          .input("correo", usuario.correo)
          .input("contrasena", contrasenaEncriptada)
          .query(`
INSERT INTO Usuario_TB (Nombre, Apellido1, Apellido2, Genero, Correo, Contrasena)
            OUTPUT INSERTED.UsuarioId
            VALUES (@nombre, @apellido1, @apellido2, @genero, @correo, @contrasena)
          `);
        
        usuarioId = resultado.recordset[0].UsuarioId;
        await enviarCorreo(usuario.correo, contrasena);
      }

      return res.status(201).json({ message: "Usuario agregado o asociado exitosamente.", usuarioId });
    }

    // Si hay archivo, procesarlo
    let usuarios = [];

    if (archivo.mimetype === "text/csv") {
      const stream = new Stream.Readable();
      stream.push(archivo.buffer);
      stream.push(null);
      const reader = new CsvReader(stream, { headers: true, delimiter: "," });

      for await (const row of reader) {
        usuarios.push(row);
      }
    } else if (archivo.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(archivo.buffer);
      const worksheet = workbook.getWorksheet(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          usuarios.push({
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

    // Insertar usuarios evitando duplicados
    for (const usr of usuarios) {
      if (!usr.nombre || !usr.apellido1 || !usr.apellido2 || !usr.genero || !usr.correo) {
        continue;
      }

      let usuarioId = await obtenerUsuarioPorCorreo(usr.correo);

      if (!usuarioId) {
        const contrasena = generarContrasena();
        const contrasenaEncriptada = encriptarContrasena(contrasena);

        const resultado = await poolPromise.request()
          .input("nombre", usr.nombre)
          .input("apellido1", usr.apellido1)
          .input("apellido2", usr.apellido2)
          .input("genero", usr.genero)
          .input("correo", usr.correo)
          .input("contrasena", contrasenaEncriptada)
          .query(`
            INSERT INTO Usuario_TB (Nombre, Apellido1, Apellido2, Genero, Correo, Contrasena)
            OUTPUT INSERTED.UsuarioId
            VALUES (@nombre, @apellido1, @apellido2, @genero, @correo, @contrasena)
          `);

        usuarioId = resultado.recordset[0].UsuarioId;
        await enviarCorreo(usr.correo, contrasena);
      }
    }

    return res.status(200).json({ message: "Usuarios agregados exitosamente." });
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    return res.status(500).json({ message: "Hubo un error al agregar el usuario. Inténtalo nuevamente." });
  }
};

// Editar un usuario
export const editarUsuario = async (req, res) => {
  const { correo } = req.params;
  const { nombre, apellido1, apellido2, genero } = req.body;

  try {
    // Verificar si el usuario existe
    const usuarioId = await obtenerUsuarioPorCorreo(correo);
    if (!usuarioId) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Actualizar los datos del usuario
    await poolPromise.request()
      .input("nombre", nombre)
      .input("apellido1", apellido1)
      .input("apellido2", apellido2)
      .input("genero", genero)
      .input("correo", correo)
      .query(`
        UPDATE Usuario_TB 
        SET Nombre = @nombre, Apellido1 = @apellido1, Apellido2 = @apellido2, Genero = @genero
        WHERE Correo = @correo
      `);

    return res.status(200).json({ message: "Usuario editado exitosamente." });
  } catch (error) {
    console.error("Error al editar usuario:", error);
    return res.status(500).json({ message: "Hubo un error al editar el usuario." });
  }
};

// Eliminar un usuario
export const eliminarUsuario = async (req, res) => {
  const { correo } = req.params;

  try {
    // Verificar si el usuario existe
    const usuarioId = await obtenerUsuarioPorCorreo(correo);
    if (!usuarioId) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Eliminar usuario de la base de datos
    await poolPromise.request()
      .input("correo", correo)
      .query(`DELETE FROM Usuario_TB WHERE Correo = @correo`);

    return res.status(200).json({ message: "Usuario eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ message: "Hubo un error al eliminar el usuario." });
  }
};

// Deshabilitar un usuario
export const deshabilitarUsuario = async (req, res) => {
  const { correo } = req.params;

  try {
    // Verificar si el usuario existe
    const usuarioId = await obtenerUsuarioPorCorreo(correo);
    if (!usuarioId) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Marcar al usuario como inactivo
    await poolPromise.request()
      .input("correo", correo)
      .query(`
        UPDATE Usuario_TB 
        SET Activo = 0  -- 0 para inactivo
        WHERE Correo = @correo
      `);

    return res.status(200).json({ message: "Usuario deshabilitado exitosamente." });
  } catch (error) {
    console.error("Error al deshabilitar usuario:", error);
    return res.status(500).json({ message: "Hubo un error al deshabilitar el usuario." });
  }
};
