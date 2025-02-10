import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { poolPromise } from "../config/db.js"; 
import UserModel from "../models/userModel.js";
import authService from '../services/authService.js'; 
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import sql from "mssql";


// Función para registrar un nuevo usuario
export const register = async (req, res) => {
  const { nombre, correo, contraseña, rolId, generoId} = req.body;

  if (!nombre || !correo || !contraseña || !rolId || !generoId) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const pool = await poolPromise; 
    const result = await pool.request()
      .input("correo", correo)
      .query("SELECT * FROM Usuario_TB WHERE Correo = @correo");

    if (result.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar el nuevo usuario en la base de datos
    await pool.request()
      .input("nombre", nombre)
      .input("correo", correo)
      .input("contraseña", hashedPassword)
      .input("rolId", rolId)
      .input("generoId", generoId)
      .query(`
        INSERT INTO Usuario_TB (Nombre, Correo, Contraseña, Rol_ID_FK, Genero_ID_FK)
        VALUES (@nombre, @correo, @contraseña, @rolId, @generoId)
      `);

    const newUser = new UserModel({
      nombre,
      correo,
      contraseña: hashedPassword,
      rolId,
      generoId,
    });

    return res.status(201).json({ success: true, message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ success: false, message: "Registration failed. Please try again later." });
  }
};

// Función para iniciar sesión (login) de un usuario
export const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  // Validar los campos requeridos
  if (!correo || !contraseña) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const pool = await poolPromise; // Esperar la conexión a la base de datos

    // Buscar al usuario en la base de datos
    const result = await pool.request()
      .input("correo", correo)
      .query("SELECT * FROM Usuario_TB WHERE Correo = @correo");

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result.recordset[0];

    // Comparar las contraseñas
    const isMatch = await bcrypt.compare(contraseña, user.Contraseña);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Crear el token JWT 
    const token = jwt.sign({ usuarioId: user.Usuario_ID_PK }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: `Bearer ${token}`,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ success: false, message: "Login failed. Please try again later." });
  }
};

// Función para obtener detalles del usuario desde el token
export const getUserDetails = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[2]; // Extraer el token de la cabecera Authorization

  if (!token) {
    return res.status(401).json({ success: false, message: "Token not provided :(" });
  }

  console.log("Este es el token:", token);

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.usuarioId) {
      return res.status(401).json({ success: false, message: "Invalid token, usuarioId not found" });
    }

    const pool = await poolPromise; // Esperar la conexión a la base de datos

    // Obtener el usuario por el ID del token
    const result = await pool.request()
    .input("usuarioId", decoded.usuarioId)
    .query(`
      SELECT 
        u.Usuario_ID_PK, 
        u.Nombre, 
        u.Correo, 
        r.Rol AS Rol
      FROM 
        Usuario_TB u
      JOIN 
        Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
      WHERE 
        u.Usuario_ID_PK = @usuarioId
    `);

  if (result.recordset.length === 0) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const user = result.recordset[0];

  // Mapear los datos del usuario
  const userDetails = {
    id: user.Usuario_ID_PK,
    name: user.Nombre,
    email: user.Correo,
    rol: user.Rol // Aquí tenemos el nombre del rol
  };

    return res.status(200).json({ success: true, user: userDetails });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve user details" });
  }
};





dotenv.config(); // Cargar las variables de entorno desde el archivo .env

// Crear el transporter para nodemailer con la configuración de Gmail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.gmail.com
  port: 587, // 587
  secure: false,  // Usar TLS
  auth: {
    user: process.env.EMAIL_USER,  // Tu dirección de correo de Gmail
    pass: process.env.EMAIL_PASS,  // La contraseña de la cuenta de correo (App password si tienes 2FA)
  },
  tls: {
    rejectUnauthorized: false,  // Permite conexiones TLS aunque el certificado no sea verificado
  },
});

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const pool = await poolPromise; // Esperar la conexión a la base de datos

    // Buscar al usuario en la base de datos usando SQL
    const result = await pool.request()
      .input("correo", email)
      .query("SELECT * FROM Usuario_TB WHERE Correo = @correo");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.recordset[0]; // Obtener el primer usuario encontrado

    // Generar un token con expiración de 15 minutos
    const token = jwt.sign({ id: user.Usuario_ID_PK }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Construir el enlace de recuperación
    const resetLink = `http://localhost:3001/reset-password?token=${token}`;

    // Enviar el correo
    await transporter.sendMail({
      from: `"Soporte" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperación de Contraseña",
      html: `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f6f9;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px;
            background-color: rgb(19, 30, 173);
            border-radius: 8px 8px 0 0;
            color: #ffffff;
          }
          .header img {
            width: 100px;
            margin-bottom: 10px;
          }
          .content {
            padding: 20px;
            font-size: 16px;
          }
          .button {
            display: block;
            width: 80%;
            padding: 12px 24px;
            background-color: rgb(214, 214, 214);
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            margin-top: 20px;
            text-align: center;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #888;
          }
          .footer p {
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://cdn.ufidelitas.ac.cr/wp-content/uploads/2023/11/17075151/FideLogo-04.png" alt="Logo" />
            <h1>Recuperación de Contraseña - FideColab</h1>
          </div>
          <div class="content">
            <p>Hola ${user.Nombre},</p>
            <p>Hemos recibido una solicitud para restablecer tu contraseña en la plataforma de FideColab. Haz clic en el siguiente botón para restablecerla:</p>
            <a href="${resetLink}" class="button" target="_blank">Restablecer Contraseña</a>
            <p>Este enlace es válido por 15 minutos. Si no solicitaste el restablecimiento de contraseña, por favor ignora este correo.</p>
          </div>
          <div class="footer">
            <p>Si tienes problemas, por favor contacta con nuestro soporte.</p>
            <p>Gracias por ser parte de nuestra comunidad.</p>
          </div>
        </div>
      </body>
    </html>
  `,
});
    

    res.json({ message: "Correo enviado. Revisa tu bandeja de entrada." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar el correo" });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Realizar la consulta SQL para obtener el usuario
    const pool = await poolPromise; // Esperar la conexión al pool de la base de datos
    const result = await pool.request()
      .input('id', sql.Int, decoded.id)  // Asignar el id del token al parámetro
      .query('SELECT * FROM Usuario_TB WHERE Usuario_ID_PK = @id');

    const user = result.recordset[0]; // Obtener el primer usuario encontrado

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    await pool.request()
      .input('id', sql.Int, user.Usuario_ID_PK) // ID del usuario
      .input('newPassword', sql.NVarChar, hashedPassword) // Contraseña hasheada
      .query('UPDATE Usuario_TB SET Contraseña = @newPassword WHERE Usuario_ID_PK = @id');

    res.json({ message: "Contraseña actualizada con éxito" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Token inválido o expirado" });
  }
};

// Función para actualizar los datos del usuario
export const updateUser = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[2];
  console.log('Escucho borroso');

  if (!token) {
    return res.status(401).json({ success: false, message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuarioId = decoded.usuarioId;

    if (!usuarioId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const { nombre, generoId } = req.body;
    const pool = await poolPromise;

    // Verificar si el usuario existe
    const userCheck = await pool.request()
      .input("usuarioId", sql.Int, usuarioId)
      .query("SELECT * FROM Usuario_TB WHERE Usuario_ID_PK = @usuarioId");

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Construir la consulta de actualización solo con los campos permitidos
    let updateFields = [];
    if (nombre) updateFields.push("Nombre = @nombre");
    if (generoId) updateFields.push("Genero_ID_FK = @generoId");

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    const updateQuery = `
      UPDATE Usuario_TB
      SET ${updateFields.join(", ")}
      WHERE Usuario_ID_PK = @usuarioId
    `;

    await pool.request()
      .input("usuarioId", sql.Int, usuarioId)
      .input("nombre", sql.NVarChar, nombre || userCheck.recordset[0].Nombre)
      .input("generoId", sql.Int, generoId || userCheck.recordset[0].Genero_ID_FK)
      .query(updateQuery);

    return res.status(200).json({ success: true, message: "User updated successfully" });

  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

 
// Función para obtener detalles completos del usuario
export const getFullUserDetails = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[2];
 
  if (!token) {
    return res.status(401).json({ success: false, message: "Token not provided" });
  }
 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuarioId = decoded.usuarioId;
 
    if (!usuarioId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
 
    const pool = await poolPromise;
 
    // Obtener todos los detalles del usuario, incluyendo género, rol y grupo
    const result = await pool.request()
      .input("usuarioId", sql.Int, usuarioId)
      .query(`
        SELECT 
    u.Usuario_ID_PK AS id,
    u.Nombre AS name,
    u.Correo AS email,
    g.Tipo_Genero AS gender,
    r.Rol AS role,
    gc.Codigo_Grupo AS groupName
FROM Usuario_TB u
JOIN Genero_TB g ON u.Genero_ID_FK = g.Genero_ID_PK
JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
LEFT JOIN GrupoVinculado_TB gv ON u.Usuario_ID_PK = gv.Usuario_ID_FK
LEFT JOIN GrupoCurso_TB gc ON gv.GrupoCurso_ID_FK = gc.GrupoCurso_ID_PK
WHERE u.Usuario_ID_PK = @usuarioId;

      `);

      console.log(result);
 
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
 
    return res.status(200).json({ success: true, user: result.recordset[0] });
 
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve user details" });
  }
};
