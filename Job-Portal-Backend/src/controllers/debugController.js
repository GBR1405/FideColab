import { poolPromise } from "../config/db.js";
import sql from "mssql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { GenerarBitacora } from "../controllers/generalController.js";

dotenv.config();

// Configuración del transporter para correos (similar a authController)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Función para generar contraseña aleatoria
function generateRandomPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Agregar un nuevo usuario
export const agregarUsuario = async (req, res) => {
  const { nombre, apellido1, apellido2, correo, rol, genero } = req.body;

  if (!nombre || !apellido1 || !apellido2 || !correo || !rol || !genero) {
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
  }

  try {
    const pool = await poolPromise;

    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const rolResult = await pool.request()
      .input("rol", sql.NVarChar, rol)
      .query("SELECT Rol_ID_PK FROM Rol_TB WHERE Rol = @rol");

    if (rolResult.recordset.length === 0) {
      return res.status(400).json({ success: false, message: "Rol no válido" });
    }
    const rolId = rolResult.recordset[0].Rol_ID_PK;

    const result = await pool.request()
      .input("nombre", sql.NVarChar, nombre)
      .input("apellido1", sql.NVarChar, apellido1)
      .input("apellido2", sql.NVarChar, apellido2)
      .input("correo", sql.NVarChar, correo)
      .input("contraseña", sql.NVarChar, hashedPassword)
      .input("rolId", sql.Int, rolId)
      .input("generoId", sql.Int, genero)
      .input("estado", sql.Bit, 1)
      .query(`
        INSERT INTO Usuario_TB (Nombre, Apellido1, Apellido2, Correo, Contraseña, Rol_ID_FK, Genero_ID_FK, Estado)
        OUTPUT INSERTED.Usuario_ID_PK
        VALUES (@nombre, @apellido1, @apellido2, @correo, @contraseña, @rolId, @generoId, @estado)
      `);

    const userId = result.recordset[0].Usuario_ID_PK;

    await transporter.sendMail({
      from: `"Bienvenida a FideColab" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: "Bienvenido a FideColab",
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
              .password-box {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                color: #dc3545;
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
                <h1>Bienvenido a FideColab</h1>
              </div>
              <div class="content">
                <p>Hola ${nombre},</p>
                <p>¡Bienvenido a FideColab! Se ha creado una cuenta para ti.</p>
                <p>Tus credenciales de acceso son:</p>
                <p><strong>Correo:</strong> ${correo}</p>
                <div class="password-box">
                  Contraseña: ${password}
                </div>
                <p>Te recomendamos cambiar esta contraseña después de iniciar sesión por primera vez.</p>
                <p>¡Disfruta de la plataforma!</p>
              </div>
              <div class="footer">
                <p>Si tienes problemas para acceder, por favor contacta con nuestro soporte.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    await GenerarBitacora(req.user.id, "Usuario agregado en modo debug", null);

    return res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: {
        id: userId,
        nombre,
        apellido1,
        apellido2,
        correo,
        password,
        rol,
        genero
      }
    });

  } catch (error) {
    console.error("Error al agregar usuario:", error);
    return res.status(500).json({ success: false, message: "Error al agregar usuario" });
  }
};

// Editar un usuario
export const editarUsuario = async (req, res) => {
  const { userId } = req.params;
  const { nombre, apellido1, apellido2, rol, genero, cursos } = req.body;

  if (!nombre || !apellido1 || !apellido2 || !rol || !genero) {
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
  }

  try {
    const pool = await poolPromise;

    const userCheck = await pool.request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM Usuario_TB WHERE Usuario_ID_PK = @userId");

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const rolResult = await pool.request()
      .input("rol", sql.NVarChar, rol)
      .query("SELECT Rol_ID_PK FROM Rol_TB WHERE Rol = @rol");

    if (rolResult.recordset.length === 0) {
      return res.status(400).json({ success: false, message: "Rol no válido" });
    }
    const rolId = rolResult.recordset[0].Rol_ID_PK;

    await pool.request()
      .input("userId", sql.Int, userId)
      .input("nombre", sql.NVarChar, nombre)
      .input("apellido1", sql.NVarChar, apellido1)
      .input("apellido2", sql.NVarChar, apellido2)
      .input("rolId", sql.Int, rolId)
      .input("generoId", sql.Int, genero)
      .query(`
        UPDATE Usuario_TB 
        SET Nombre = @nombre, 
            Apellido1 = @apellido1, 
            Apellido2 = @apellido2, 
            Rol_ID_FK = @rolId, 
            Genero_ID_FK = @generoId
        WHERE Usuario_ID_PK = @userId
      `);

    if (cursos && Array.isArray(cursos)) {
      await pool.request()
        .input("userId", sql.Int, userId)
        .query("DELETE FROM GrupoVinculado_TB WHERE Usuario_ID_FK = @userId");

      for (const cursoId of cursos) {
        await pool.request()
          .input("userId", sql.Int, userId)
          .input("cursoId", sql.Int, cursoId)
          .query(`
            INSERT INTO GrupoVinculado_TB (Usuario_ID_FK, GrupoCurso_ID_FK)
            VALUES (@userId, @cursoId)
          `);
      }
    }

    await GenerarBitacora(req.user.id, "Usuario editado en modo debug", null);

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente"
    });

  } catch (error) {
    console.error("Error al editar usuario:", error);
    return res.status(500).json({ success: false, message: "Error al editar usuario" });
  }
};

// Restaurar contraseña de un usuario
const passwordResetEmailTemplate = (userEmail, newPassword) => {
  return `
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
          .password-box {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: #dc3545;
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
            <h1>Contraseña restablecida - FideColab</h1>
          </div>
          <div class="content">
            <p>Hemos recibido una solicitud para restablecer tu contraseña en FideColab.</p>
            <div class="password-box">
              Nueva contraseña: ${newPassword}
            </div>
            <p>Por seguridad, te recomendamos cambiar esta contraseña después de iniciar sesión.</p>
            <p>Si no solicitaste este cambio, por favor contacta al administrador del sistema.</p>
          </div>
          <div class="footer">
            <p>Gracias por ser parte de nuestra comunidad.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const restaurarContrasena = async (req, res) => {
  const { userId } = req.params;

  try {
    const pool = await poolPromise;

    const userResult = await pool.request()
      .input("userId", sql.Int, userId)
      .query("SELECT Correo FROM Usuario_TB WHERE Usuario_ID_PK = @userId");

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const userEmail = userResult.recordset[0].Correo;
    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input("userId", sql.Int, userId)
      .input("newPassword", sql.NVarChar, hashedPassword)
      .query("UPDATE Usuario_TB SET Contraseña = @newPassword WHERE Usuario_ID_PK = @userId");

    await transporter.sendMail({
      from: `"Soporte FideColab" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Contraseña restablecida",
      html: passwordResetEmailTemplate(userEmail, newPassword)
    });

    await GenerarBitacora(req.user.id, "Contraseña restaurada en modo debug", null);

    return res.status(200).json({
      success: true,
      message: "Contraseña restablecida y correo enviado al usuario"
    });

  } catch (error) {
    console.error("Error al restaurar contraseña:", error);
    return res.status(500).json({ success: false, message: "Error al restaurar contraseña" });
  }
};

// Eliminar un usuario y todas sus dependencias
export const eliminarUsuario = async (req, res) => {
  const { userId } = req.params;
  console.log("Eliminando usuario con ID:", userId);

  if (isNaN(userId)) {
    return res.status(400).json({
      success: false,
      message: "ID de usuario debe ser un número válido"
    });
  }

  try {
    const pool = await poolPromise;

    const userResult = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT u.Usuario_ID_PK, r.Rol 
        FROM Usuario_TB u
        JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
        WHERE u.Usuario_ID_PK = @userId
      `);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const user = userResult.recordset[0];
    const rol = user.Rol;

    const transaction = new sql.Transaction(await pool.connect());
    await transaction.begin();

    try {
      if (rol === "Estudiante") {
        await transaction.request()
          .input("userId", sql.Int, userId)
          .query("DELETE FROM Participantes_TB WHERE Usuario_ID_FK = @userId");

        await transaction.request()
          .input("userId", sql.Int, userId)
          .query("DELETE FROM Usuario_Logros_TB WHERE Usuario_ID_FK = @userId");

        await transaction.request()
          .input("userId", sql.Int, userId)
          .query("DELETE FROM GrupoVinculado_TB WHERE Usuario_ID_FK = @userId");

      } else if (rol === "Profesor") {
        const partidasResult = await transaction.request()
          .input("userId", sql.Int, userId)
          .query("SELECT Partida_ID_PK FROM Partida_TB WHERE Profesor_ID_FK = @userId");

        const partidasIds = partidasResult.recordset.map(p => p.Partida_ID_PK);

        if (partidasIds.length > 0) {
          await transaction.request()
            .query(`
              DELETE FROM Participantes_TB 
              WHERE Partida_ID_FK IN (${partidasIds.join(",")})
            `);

          await transaction.request()
            .query(`
              DELETE FROM Usuario_Logros_TB 
              WHERE Partida_ID_FK IN (${partidasIds.join(",")})
            `);

          await transaction.request()
            .query(`
              DELETE FROM Resultados_TB 
              WHERE Partida_ID_FK IN (${partidasIds.join(",")})
            `);
        }

        await transaction.request()
          .input("userId", sql.Int, userId)
          .query("DELETE FROM Partida_TB WHERE Profesor_ID_FK = @userId");

        await transaction.request()
          .input("userId", sql.Int, userId)
          .query(`
            DELETE FROM ConfiguracionJuego_TB 
            WHERE Personalizacion_ID_PK IN (
              SELECT Personalizacion_ID_PK 
              FROM Personalizacion_TB 
              WHERE Usuario_ID_FK = @userId
            )
          `);

        await transaction.request()
          .input("userId", sql.Int, userId)
          .query("DELETE FROM Personalizacion_TB WHERE Usuario_ID_FK = @userId");

        await transaction.request()
          .input("userId", sql.Int, userId)
          .query("DELETE FROM GrupoVinculado_TB WHERE Usuario_ID_FK = @userId");
      }

      await transaction.request()
        .input("userId", sql.Int, userId)
        .query("DELETE FROM Usuario_TB WHERE Usuario_ID_PK = @userId");

      await transaction.commit();

      await GenerarBitacora(req.user.id, `Usuario eliminado (${rol}) en modo debug`, null);

      return res.status(200).json({
        success: true,
        message: `Usuario (${rol}) eliminado exitosamente con todas sus dependencias`
      });

    } catch (error) {
      await transaction.rollback();
      console.error("Error en transacción al eliminar usuario:", error);
      throw error;
    }

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar usuario",
      error: error.message
    });
  }
};

// Obtener información detallada de un usuario
export const obtenerInformacionUsuario = async (req, res) => {
  const { userId } = req.params;

  try {
    const pool = await poolPromise;

    const userResult = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT 
          u.Usuario_ID_PK as id,
          u.Nombre,
          u.Apellido1,
          u.Apellido2,
          u.Correo,
          u.Estado,
          r.Rol,
          g.Tipo_Genero as Genero
        FROM Usuario_TB u
        JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
        JOIN Genero_TB g ON u.Genero_ID_FK = g.Genero_ID_PK
        WHERE u.Usuario_ID_PK = @userId
      `);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const userInfo = userResult.recordset[0];

    if (userInfo.Rol === "Estudiante") {
      const partidasResult = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
          SELECT COUNT(DISTINCT p.Partida_ID_PK) as totalPartidas
          FROM Participantes_TB pt
          JOIN Partida_TB p ON pt.Partida_ID_FK = p.Partida_ID_PK
          WHERE pt.Usuario_ID_FK = @userId
        `);

      userInfo.totalPartidas = partidasResult.recordset[0].totalPartidas || 0;

      const cursosResult = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
          SELECT 
            cc.Codigo_Curso,
            cc.Nombre_Curso,
            gc.Codigo_Grupo
          FROM GrupoVinculado_TB gv
          JOIN GrupoCurso_TB gc ON gv.GrupoCurso_ID_FK = gc.GrupoCurso_ID_PK
          JOIN CodigoCurso_TB cc ON gc.Curso_ID_FK = cc.CodigoCurso_ID_PK
          WHERE gv.Usuario_ID_FK = @userId
        `);

      userInfo.cursos = cursosResult.recordset.map(c => `${c.Codigo_Curso}-${c.Nombre_Curso} G${c.Codigo_Grupo}`).join(", ");

    } else if (userInfo.Rol === "Profesor") {
      const personalizacionesResult = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
          SELECT COUNT(*) as totalPersonalizaciones
          FROM Personalizacion_TB
          WHERE Usuario_ID_FK = @userId AND Estado = 1
        `);

      userInfo.totalPersonalizaciones = personalizacionesResult.recordset[0].totalPersonalizaciones || 0;

      const cursosResult = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
          SELECT DISTINCT
            cc.Codigo_Curso,
            cc.Nombre_Curso,
            gc.Codigo_Grupo
          FROM GrupoVinculado_TB gv
          JOIN GrupoCurso_TB gc ON gv.GrupoCurso_ID_FK = gc.GrupoCurso_ID_PK
          JOIN CodigoCurso_TB cc ON gc.Curso_ID_FK = cc.CodigoCurso_ID_PK
          WHERE gv.Usuario_ID_FK = @userId
        `);

      userInfo.cursos = cursosResult.recordset.map(c => `${c.Codigo_Curso}-${c.Nombre_Curso} G${c.Codigo_Grupo}`).join(", ");

      const estudiantesResult = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
          SELECT 
            u.Usuario_ID_PK as id,
            u.Nombre,
            u.Apellido1,
            u.Apellido2,
            u.Correo,
            cc.Codigo_Curso,
            cc.Nombre_Curso,
            gc.Codigo_Grupo
          FROM GrupoVinculado_TB gv_prof
          JOIN GrupoCurso_TB gc ON gv_prof.GrupoCurso_ID_FK = gc.GrupoCurso_ID_PK
          JOIN GrupoVinculado_TB gv_est ON gc.GrupoCurso_ID_PK = gv_est.GrupoCurso_ID_FK
          JOIN Usuario_TB u ON gv_est.Usuario_ID_FK = u.Usuario_ID_PK
          JOIN CodigoCurso_TB cc ON gc.Curso_ID_FK = cc.CodigoCurso_ID_PK
          JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
          WHERE gv_prof.Usuario_ID_FK = @userId
          AND r.Rol = 'Estudiante'
        `);

      userInfo.estudiantes = estudiantesResult.recordset;
    }

    const bitacoraResult = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT 
          Bitacora_ID_PK as id,
          Accion,
          Error,
          Fecha
        FROM Bitacora_TB
        WHERE Usuario_ID_FK = @userId
        ORDER BY Fecha DESC
        OFFSET 0 ROWS
        FETCH NEXT 10 ROWS ONLY
      `)

    userInfo.bitacora = bitacoraResult.recordset;

    await GenerarBitacora(req.user.id, "Información de usuario consultada en modo debug", null);

    return res.status(200).json({
      success: true,
      data: userInfo
    });

  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    return res.status(500).json({ success: false, message: "Error al obtener información del usuario" });
  }
};

// Activar/Desactivar un usuario
export const desactivarUsuario = async (req, res) => {
  const { userId } = req.params;

  if (isNaN(userId)) {
    return res.status(400).json({
      success: false,
      message: "ID de usuario debe ser un número válido"
    });
  }

  try {
    const pool = await poolPromise;

    const userCheck = await pool.request()
      .input("userId", sql.Int, userId)
      .query("SELECT Estado FROM Usuario_TB WHERE Usuario_ID_PK = @userId");

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const currentStatus = userCheck.recordset[0].Estado;
    const newStatus = currentStatus ? 0 : 1;

    await pool.request()
      .input("userId", sql.Int, userId)
      .input("newStatus", sql.Bit, newStatus)
      .query("UPDATE Usuario_TB SET Estado = @newStatus WHERE Usuario_ID_PK = @userId");

    await GenerarBitacora(req.user.id, `Usuario ${newStatus ? 'activado' : 'desactivado'} en modo debug`, null);

    return res.status(200).json({
      success: true,
      message: `Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
      newStatus
    });

  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al cambiar estado del usuario",
      error: error.message
    });
  }
};

// Eliminar un registro de historial
export const eliminarHistorial = async (req, res) => {
  const { historialId } = req.params;

  try {
    const pool = await poolPromise;

    const historialCheck = await pool.request()
      .input("historialId", sql.Int, historialId)
      .query("SELECT * FROM Resultados_TB WHERE Resultados_ID_PK = @historialId");

    if (historialCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Registro de historial no encontrado" });
    }

    await pool.request()
      .input("historialId", sql.Int, historialId)
      .query("DELETE FROM Resultados_TB WHERE Resultados_ID_PK = @historialId");

    await GenerarBitacora(req.user.id, "Historial eliminado en modo debug", null);

    return res.status(200).json({
      success: true,
      message: "Registro de historial eliminado exitosamente"
    });

  } catch (error) {
    console.error("Error al eliminar historial:", error);
    return res.status(500).json({ success: false, message: "Error al eliminar historial" });
  }
};

// Eliminar un registro de bitácora
export const eliminarLog = async (req, res) => {
  const { logId } = req.params;

  try {
    const pool = await poolPromise;

    const logCheck = await pool.request()
      .input("logId", sql.Int, logId)
      .query("SELECT * FROM Bitacora_TB WHERE Bitacora_ID_PK = @logId");

    if (logCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Registro de bitácora no encontrado" });
    }

    await pool.request()
      .input("logId", sql.Int, logId)
      .query("DELETE FROM Bitacora_TB WHERE Bitacora_ID_PK = @logId");

    await GenerarBitacora(req.user.id, "Log eliminado en modo debug", null);

    return res.status(200).json({
      success: true,
      message: "Registro de bitácora eliminado exitosamente"
    });

  } catch (error) {
    console.error("Error al eliminar log:", error);
    return res.status(500).json({ success: false, message: "Error al eliminar log" });
  }
};

// Eliminar todas las personalizaciones y sus dependencias
export const eliminarTodasPersonalizaciones = async (req, res) => {
  try {
    const pool = await poolPromise;

    const transaction = new sql.Transaction(await pool.connect());
    await transaction.begin();

    try {
      await transaction.request().query("DELETE FROM ConfiguracionJuego_TB");

      await transaction.request().query(`
        DELETE FROM Partida_TB 
        WHERE Personalizacion_ID_FK IS NOT NULL
      `);

      await transaction.request().query("DELETE FROM Personalizacion_TB");

      await transaction.commit();

      await GenerarBitacora(req.user.id, "Todas las personalizaciones eliminadas en modo debug", null);

      return res.status(200).json({
        success: true,
        message: "Todas las personalizaciones y sus dependencias eliminadas exitosamente"
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Error al eliminar personalizaciones:", error);
    return res.status(500).json({ success: false, message: "Error al eliminar personalizaciones" });
  }
};

// Eliminar toda la bitácora
export const eliminarTodaBitacora = async (req, res) => {
  try {
    const pool = await poolPromise;

    await pool.request().query("DELETE FROM Bitacora_TB");

    await GenerarBitacora(req.user.id, "Toda la bitácora eliminada en modo debug", null);

    return res.status(200).json({
      success: true,
      message: "Toda la bitácora eliminada exitosamente"
    });

  } catch (error) {
    console.error("Error al eliminar bitácora:", error);
    return res.status(500).json({ success: false, message: "Error al eliminar bitácora" });
  }
};

// Eliminar todo el historial de partidas y sus dependencias
export const eliminarTodoHistorial = async (req, res) => {
  try {
    const pool = await poolPromise;

    const transaction = new sql.Transaction(await pool.connect());
    await transaction.begin();

    try {
      await transaction.request().query("DELETE FROM Usuario_Logros_TB");

      await transaction.request().query("DELETE FROM Resultados_TB");

      await transaction.request().query("DELETE FROM Participantes_TB");

      await transaction.request().query("DELETE FROM Partida_TB");

      await transaction.commit();

      await GenerarBitacora(req.user.id, "Todo el historial eliminado en modo debug", null);

      return res.status(200).json({
        success: true,
        message: "Todo el historial de partidas eliminado exitosamente"
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Error al eliminar historial:", error);
    return res.status(500).json({ success: false, message: "Error al eliminar historial" });
  }
};

// Eliminar todos los estudiantes y sus dependencias
export const eliminarTodosEstudiantes = async (req, res) => {
  try {
    const pool = await poolPromise;

    const rolResult = await pool.request()
      .query("SELECT Rol_ID_PK FROM Rol_TB WHERE Rol = 'Estudiante'");

    if (rolResult.recordset.length === 0) {
      return res.status(400).json({ success: false, message: "Rol Estudiante no encontrado" });
    }

    const rolId = rolResult.recordset[0].Rol_ID_PK;

    const transaction = new sql.Transaction(await pool.connect());
    await transaction.begin();

    try {
      const estudiantesResult = await transaction.request()
        .input("rolId", sql.Int, rolId)
        .query("SELECT Usuario_ID_PK FROM Usuario_TB WHERE Rol_ID_FK = @rolId");

      const estudiantesIds = estudiantesResult.recordset.map(e => e.Usuario_ID_PK);

      if (estudiantesIds.length > 0) {
        await transaction.request()
          .query(`
            DELETE FROM Participantes_TB 
            WHERE Usuario_ID_FK IN (${estudiantesIds.join(",")})
          `);

        await transaction.request()
          .query(`
            DELETE FROM Usuario_Logros_TB 
            WHERE Usuario_ID_FK IN (${estudiantesIds.join(",")})
          `);

        await transaction.request()
          .query(`
            DELETE FROM GrupoVinculado_TB 
            WHERE Usuario_ID_FK IN (${estudiantesIds.join(",")})
          `);
      }

      await transaction.request()
        .input("rolId", sql.Int, rolId)
        .query("DELETE FROM Usuario_TB WHERE Rol_ID_FK = @rolId");

      await transaction.commit();

      await GenerarBitacora(req.user.id, "Todos los estudiantes eliminados en modo debug", null);

      return res.status(200).json({
        success: true,
        message: `Todos los estudiantes (${estudiantesIds.length}) eliminados exitosamente con sus dependencias`
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Error al eliminar estudiantes:", error);
    return res.status(500).json({ success: false, message: "Error al eliminar estudiantes" });
  }
};

// Eliminar todos los profesores y sus dependencias
export const eliminarTodosProfesores = async (req, res) => {
  try {
    const pool = await poolPromise;

    const rolResult = await pool.request()
      .query("SELECT Rol_ID_PK FROM Rol_TB WHERE Rol = 'Profesor'");

    if (rolResult.recordset.length === 0) {
      return res.status(400).json({ success: false, message: "Rol Profesor no encontrado" });
    }

    const rolId = rolResult.recordset[0].Rol_ID_PK;

    const transaction = new sql.Transaction(await pool.connect());
    await transaction.begin();

    try {
      const profesoresResult = await transaction.request()
        .input("rolId", sql.Int, rolId)
        .query("SELECT Usuario_ID_PK FROM Usuario_TB WHERE Rol_ID_FK = @rolId");

      const profesoresIds = profesoresResult.recordset.map(p => p.Usuario_ID_PK);

      if (profesoresIds.length > 0) {
        const partidasResult = await transaction.request()
          .query(`
            SELECT Partida_ID_PK 
            FROM Partida_TB 
            WHERE Profesor_ID_FK IN (${profesoresIds.join(",")})
          `);

        const partidasIds = partidasResult.recordset.map(p => p.Partida_ID_PK);

        if (partidasIds.length > 0) {
          await transaction.request()
            .query(`
              DELETE FROM Participantes_TB 
              WHERE Partida_ID_FK IN (${partidasIds.join(",")})
            `);

          await transaction.request()
            .query(`
              DELETE FROM Resultados_TB 
              WHERE Partida_ID_FK IN (${partidasIds.join(",")})
            `);

          await transaction.request()
            .query(`
              DELETE FROM Usuario_Logros_TB 
              WHERE Partida_ID_FK IN (${partidasIds.join(",")})
            `);
        }

        await transaction.request()
          .query(`
            DELETE FROM Partida_TB 
            WHERE Profesor_ID_FK IN (${profesoresIds.join(",")})
          `);

        await transaction.request()
          .query(`
            DELETE FROM ConfiguracionJuego_TB 
            WHERE Personalizacion_ID_PK IN (
              SELECT Personalizacion_ID_PK 
              FROM Personalizacion_TB 
              WHERE Usuario_ID_FK IN (${profesoresIds.join(",")})
            )
          `);

        await transaction.request()
          .query(`
            DELETE FROM Personalizacion_TB 
            WHERE Usuario_ID_FK IN (${profesoresIds.join(",")})
          `);

        await transaction.request()
          .query(`
            DELETE FROM GrupoVinculado_TB 
            WHERE Usuario_ID_FK IN (${profesoresIds.join(",")})
          `);
      }

      await transaction.request()
        .input("rolId", sql.Int, rolId)
        .query("DELETE FROM Usuario_TB WHERE Rol_ID_FK = @rolId");

      await transaction.commit();

      await GenerarBitacora(req.user.id, "Todos los profesores eliminados en modo debug", null);

      return res.status(200).json({
        success: true,
        message: `Todos los profesores (${profesoresIds.length}) eliminados exitosamente con sus dependencias`
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Error al eliminar profesores:", error);
    return res.status(500).json({ success: false, message: "Error al eliminar profesores" });
  }
};

// Obtener todos los usuarios con sus roles, géneros y cursos
export const getAllUsers = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        u.Usuario_ID_PK as id,
        u.Nombre,
        u.Apellido1,
        u.Apellido2,
        u.Correo,
        u.Estado,
        r.Rol,
        g.Tipo_Genero as Genero,
        STRING_AGG(cc.Nombre_Curso + ' G' + CAST(gc.Codigo_Grupo AS NVARCHAR), ', ') AS Cursos
      FROM Usuario_TB u
      JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
      JOIN Genero_TB g ON u.Genero_ID_FK = g.Genero_ID_PK
      LEFT JOIN GrupoVinculado_TB gv ON u.Usuario_ID_PK = gv.Usuario_ID_FK
      LEFT JOIN GrupoCurso_TB gc ON gv.GrupoCurso_ID_FK = gc.GrupoCurso_ID_PK
      LEFT JOIN CodigoCurso_TB cc ON gc.Curso_ID_FK = cc.CodigoCurso_ID_PK
      GROUP BY 
        u.Usuario_ID_PK, u.Nombre, u.Apellido1, u.Apellido2, 
        u.Correo, u.Estado, r.Rol, g.Tipo_Genero
      ORDER BY u.Usuario_ID_PK
    `);

    return res.status(200).json({
      success: true,
      count: result.recordset.length,
      users: result.recordset
    });

  } catch (error) {
    console.error("Error al obtener todos los usuarios:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
      error: error.message
    });
  }
};

// Obtener todos los logs de la bitácora (solo para administradores)
export const getFullBitacora = async (req, res) => {
  try {
    const { limit = 1000, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const pool = await poolPromise;

    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query(`
        SELECT 
          b.Bitacora_ID_PK as id,
          CONCAT(u.Nombre, ' ', u.Apellido1, ' ', ISNULL(u.Apellido2, '')) as usuario,
          u.Correo,
          b.Accion,
          ISNULL(b.Error, 'No aplica') as Error,
          b.Fecha,
          r.Rol
        FROM Bitacora_TB b
        JOIN Usuario_TB u ON b.Usuario_ID_FK = u.Usuario_ID_PK
        JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
        ORDER BY b.Fecha DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    const countResult = await pool.request()
      .query('SELECT COUNT(*) as total FROM Bitacora_TB');

    return res.status(200).json({
      success: true,
      total: countResult.recordset[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      logs: result.recordset.map(log => ({
        ...log,
        Fecha: new Date(log.Fecha).toISOString() 
      }))
    });

  } catch (error) {
    console.error("Error al obtener la bitácora:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la bitácora",
      error: error.message
    });
  }
};

// Obtener todos los logs de logros obtenidos por los usuarios
export const getAllAchievementLogs = async (req, res) => {
  try {
    const { limit = 1000, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const pool = await poolPromise;

    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query(`
        SELECT 
          ul.UsuarioLogro_ID_PK as id,
          CONCAT(u.Nombre, ' ', u.Apellido1, ' ', u.Apellido2) as usuario,
          u.Correo,
          l.Nombre as logro,
          l.Descripcion,
          l.Tipo,
          ul.FechaObtenido,
          p.Partida_ID_PK as partidaId,
          p.FechaInicio as partidaFecha
        FROM Usuario_Logros_TB ul
        JOIN Usuario_TB u ON ul.Usuario_ID_FK = u.Usuario_ID_PK
        JOIN Logros_TB l ON ul.Logro_ID_FK = l.Logro_ID_PK
        LEFT JOIN Partida_TB p ON ul.Partida_ID_FK = p.Partida_ID_PK
        ORDER BY ul.FechaObtenido DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    const countResult = await pool.request()
      .query('SELECT COUNT(*) as total FROM Usuario_Logros_TB');

    return res.status(200).json({
      success: true,
      total: countResult.recordset[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      achievementLogs: result.recordset
    });

  } catch (error) {
    console.error("Error al obtener los logs de logros:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los logs de logros",
      error: error.message
    });
  }
};

// Obtener los grupos vinculados a un usuario
export const obtenerGruposUsuario = async (req, res) => {
  const { userId } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT 
          gc.GrupoCurso_ID_PK as id,
          cc.Codigo_Curso as codigo,
          cc.Nombre_Curso as nombre,
          gc.Codigo_Grupo as grupo
        FROM GrupoVinculado_TB gv
        JOIN GrupoCurso_TB gc ON gv.GrupoCurso_ID_FK = gc.GrupoCurso_ID_PK
        JOIN CodigoCurso_TB cc ON gc.Curso_ID_FK = cc.CodigoCurso_ID_PK
        WHERE gv.Usuario_ID_FK = @userId
        ORDER BY cc.Nombre_Curso, gc.Codigo_Grupo
      `);

    const grupos = result.recordset.map(grupo => ({
      id: grupo.id,
      nombreCompleto: `${grupo.codigo}-${grupo.nombre} G${grupo.grupo}`,
      ...grupo
    }));

    await GenerarBitacora(req.user.id, "Grupos de usuario consultados en modo debug", null);

    return res.status(200).json({
      success: true,
      count: grupos.length,
      grupos
    });

  } catch (error) {
    console.error("Error al obtener grupos del usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener grupos del usuario",
      error: error.message
    });
  }
};

// Desvincular un grupo de un usuario
export const desvincularGrupoUsuario = async (req, res) => {
  const { userId, grupoId } = req.params;

  try {
    const pool = await poolPromise;

    const vinculacionCheck = await pool.request()
      .input("userId", sql.Int, userId)
      .input("grupoId", sql.Int, grupoId)
      .query("SELECT * FROM GrupoVinculado_TB WHERE Usuario_ID_FK = @userId AND GrupoCurso_ID_FK = @grupoId");

    if (vinculacionCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vinculación no encontrada"
      });
    }

    await pool.request()
      .input("userId", sql.Int, userId)
      .input("grupoId", sql.Int, grupoId)
      .query("DELETE FROM GrupoVinculado_TB WHERE Usuario_ID_FK = @userId AND GrupoCurso_ID_FK = @grupoId");

    await GenerarBitacora(req.user.id, "Grupo desvinculado de usuario en modo debug", null);

    return res.status(200).json({
      success: true,
      message: "Grupo desvinculado exitosamente"
    });

  } catch (error) {
    console.error("Error al desvincular grupo:", error);
    return res.status(500).json({
      success: false,
      message: "Error al desvincular grupo",
      error: error.message
    });
  }
};

// Vincular un grupo a un usuario
export const agregarGrupoUsuario = async (req, res) => {
  const { userId, grupoId } = req.params;

  try {
    const pool = await poolPromise;

    const userCheck = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT u.Usuario_ID_PK, r.Rol 
        FROM Usuario_TB u
        JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
        WHERE u.Usuario_ID_PK = @userId
      `);

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const user = userCheck.recordset[0];
    const userRole = user.Rol;

    const grupoCheck = await pool.request()
      .input("grupoId", sql.Int, grupoId)
      .query("SELECT * FROM GrupoCurso_TB WHERE GrupoCurso_ID_PK = @grupoId");

    if (grupoCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Grupo no encontrado"
      });
    }

    const vinculacionCheck = await pool.request()
      .input("userId", sql.Int, userId)
      .input("grupoId", sql.Int, grupoId)
      .query("SELECT * FROM GrupoVinculado_TB WHERE Usuario_ID_FK = @userId AND GrupoCurso_ID_FK = @grupoId");

    if (vinculacionCheck.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya está vinculado a este grupo"
      });
    }

    if (userRole === 'Profesor') {
      const profesorEnGrupoCheck = await pool.request()
        .input("grupoId", sql.Int, grupoId)
        .query(`
          SELECT u.Usuario_ID_PK 
          FROM GrupoVinculado_TB gv
          JOIN Usuario_TB u ON gv.Usuario_ID_FK = u.Usuario_ID_PK
          JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
          WHERE gv.GrupoCurso_ID_FK = @grupoId AND r.Rol = 'Profesor'
        `);

      if (profesorEnGrupoCheck.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un profesor vinculado a este grupo"
        });
      }
    }

    await pool.request()
      .input("userId", sql.Int, userId)
      .input("grupoId", sql.Int, grupoId)
      .query(`
        INSERT INTO GrupoVinculado_TB (Usuario_ID_FK, GrupoCurso_ID_FK)
        VALUES (@userId, @grupoId)
      `);

    await GenerarBitacora(req.user.id, "Grupo vinculado a usuario en modo debug", null);

    return res.status(201).json({
      success: true,
      message: "Grupo vinculado exitosamente"
    });

  } catch (error) {
    console.error("Error al vincular grupo:", error);
    return res.status(500).json({
      success: false,
      message: "Error al vincular grupo",
      error: error.message
    });
  }
};

// Desvincular todos los usuarios de un grupo
export const desvincularUsuariosGrupo = async (req, res) => {
  const { grupoId } = req.params;

  try {
    const pool = await poolPromise;

    const grupoCheck = await pool.request()
      .input("grupoId", sql.Int, grupoId)
      .query("SELECT * FROM GrupoCurso_TB WHERE GrupoCurso_ID_PK = @grupoId");

    if (grupoCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Grupo no encontrado"
      });
    }

    const countResult = await pool.request()
      .input("grupoId", sql.Int, grupoId)
      .query("SELECT COUNT(*) as total FROM GrupoVinculado_TB WHERE GrupoCurso_ID_FK = @grupoId");

    const totalVinculaciones = countResult.recordset[0].total;

    await pool.request()
      .input("grupoId", sql.Int, grupoId)
      .query("DELETE FROM GrupoVinculado_TB WHERE GrupoCurso_ID_FK = @grupoId");

    await GenerarBitacora(req.user.id, `Todos los usuarios desvinculados del grupo ${grupoId} en modo debug`, null);

    return res.status(200).json({
      success: true,
      message: `${totalVinculaciones} usuarios desvinculados del grupo exitosamente`
    });

  } catch (error) {
    console.error("Error al desvincular usuarios del grupo:", error);
    return res.status(500).json({
      success: false,
      message: "Error al desvincular usuarios del grupo",
      error: error.message
    });
  }
};

// Obtener todos los grupos con sus usuarios vinculados
export const obtenerGruposConUsuarios = async (req, res) => {
  try {
    const pool = await poolPromise;

    const gruposResult = await pool.request().query(`
      SELECT DISTINCT
        gc.GrupoCurso_ID_PK as id,
        cc.Codigo_Curso as codigo,
        cc.Nombre_Curso as nombre,
        gc.Codigo_Grupo as grupo
      FROM GrupoVinculado_TB gv
      JOIN GrupoCurso_TB gc ON gv.GrupoCurso_ID_FK = gc.GrupoCurso_ID_PK
      JOIN CodigoCurso_TB cc ON gc.Curso_ID_FK = cc.CodigoCurso_ID_PK
      ORDER BY cc.Nombre_Curso, gc.Codigo_Grupo
    `);

    const gruposConUsuarios = await Promise.all(gruposResult.recordset.map(async grupo => {
      const usuariosResult = await pool.request()
        .input("grupoId", sql.Int, grupo.id)
        .query(`
          SELECT 
            u.Usuario_ID_PK as id,
            u.Nombre,
            u.Apellido1,
            u.Apellido2,
            u.Correo,
            r.Rol
          FROM GrupoVinculado_TB gv
          JOIN Usuario_TB u ON gv.Usuario_ID_FK = u.Usuario_ID_PK
          JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
          WHERE gv.GrupoCurso_ID_FK = @grupoId
          ORDER BY u.Nombre, u.Apellido1
        `);

      return {
        ...grupo,
        nombreCompleto: `${grupo.codigo}-${grupo.nombre} G${grupo.grupo}`,
        usuarios: usuariosResult.recordset,
        totalUsuarios: usuariosResult.recordset.length
      };
    }));

    await GenerarBitacora(req.user.id, "Grupos con usuarios consultados en modo debug", null);

    return res.status(200).json({
      success: true,
      count: gruposConUsuarios.length,
      grupos: gruposConUsuarios
    });

  } catch (error) {
    console.error("Error al obtener grupos con usuarios:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener grupos con usuarios",
      error: error.message
    });
  }
};

//  Eliminar todas las personalizaciones de un profesor y sus dependencias
export const eliminarPersonalizacionesProfesor = async (req, res) => {
  const { profesorId } = req.params;

  try {
    const pool = await poolPromise;

    const profesorCheck = await pool.request()
      .input("profesorId", sql.Int, profesorId)
      .query(`
        SELECT u.Usuario_ID_PK, r.Rol 
        FROM Usuario_TB u
        JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
        WHERE u.Usuario_ID_PK = @profesorId AND r.Rol = 'Profesor'
      `);

    if (profesorCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profesor no encontrado o no es un profesor"
      });
    }

    const transaction = new sql.Transaction(await pool.connect());
    await transaction.begin();

    try {
      const personalizacionesResult = await transaction.request()
        .input("profesorId", sql.Int, profesorId)
        .query("SELECT Personalizacion_ID_PK FROM Personalizacion_TB WHERE Usuario_ID_FK = @profesorId");

      const personalizacionesIds = personalizacionesResult.recordset.map(p => p.Personalizacion_ID_PK);

      if (personalizacionesIds.length > 0) {
        const partidasResult = await transaction.request()
          .query(`
            SELECT Partida_ID_PK 
            FROM Partida_TB 
            WHERE Personalizacion_ID_FK IN (${personalizacionesIds.join(",")})
          `);

        const partidasIds = partidasResult.recordset.map(p => p.Partida_ID_PK);

        if (partidasIds.length > 0) {
          await transaction.request()
            .query(`
              DELETE FROM Participantes_TB 
              WHERE Partida_ID_FK IN (${partidasIds.join(",")})
            `);

          await transaction.request()
            .query(`
              DELETE FROM Resultados_TB 
              WHERE Partida_ID_FK IN (${partidasIds.join(",")})
            `);

          await transaction.request()
            .query(`
              DELETE FROM Usuario_Logros_TB 
              WHERE Partida_ID_FK IN (${partidasIds.join(",")})
            `);
        }

        await transaction.request()
          .query(`
            DELETE FROM Partida_TB 
            WHERE Personalizacion_ID_FK IN (${personalizacionesIds.join(",")})
          `);

        await transaction.request()
          .query(`
            DELETE FROM ConfiguracionJuego_TB 
            WHERE Personalizacion_ID_PK IN (${personalizacionesIds.join(",")})
          `);
      }

      await transaction.request()
        .input("profesorId", sql.Int, profesorId)
        .query("DELETE FROM Personalizacion_TB WHERE Usuario_ID_FK = @profesorId");

      await transaction.commit();

      await GenerarBitacora(req.user.id, `Personalizaciones del profesor ${profesorId} eliminadas en modo debug`, null);

      return res.status(200).json({
        success: true,
        message: `Todas las personalizaciones del profesor (${personalizacionesIds.length}) y sus dependencias eliminadas exitosamente`
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Error al eliminar personalizaciones del profesor:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar personalizaciones del profesor",
      error: error.message
    });
  }
};

// Eliminar todas las partidas de un profesor y sus dependencias
export const eliminarPartidasProfesor = async (req, res) => {
  const { profesorId } = req.params;

  try {
    const pool = await poolPromise;

    const profesorCheck = await pool.request()
      .input("profesorId", sql.Int, profesorId)
      .query(`
        SELECT u.Usuario_ID_PK, r.Rol 
        FROM Usuario_TB u
        JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
        WHERE u.Usuario_ID_PK = @profesorId AND r.Rol = 'Profesor'
      `);

    if (profesorCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profesor no encontrado o no es un profesor"
      });
    }

    const transaction = new sql.Transaction(await pool.connect());
    await transaction.begin();

    try {
      const partidasResult = await transaction.request()
        .input("profesorId", sql.Int, profesorId)
        .query("SELECT Partida_ID_PK FROM Partida_TB WHERE Profesor_ID_FK = @profesorId");

      const partidasIds = partidasResult.recordset.map(p => p.Partida_ID_PK);

      if (partidasIds.length > 0) {
        await transaction.request()
          .query(`
            DELETE FROM Participantes_TB 
            WHERE Partida_ID_FK IN (${partidasIds.join(",")})
          `);

        await transaction.request()
          .query(`
            DELETE FROM Resultados_TB 
            WHERE Partida_ID_FK IN (${partidasIds.join(",")})
          `);

        await transaction.request()
          .query(`
            DELETE FROM Usuario_Logros_TB 
            WHERE Partida_ID_FK IN (${partidasIds.join(",")})
          `);
      }

      await transaction.request()
        .input("profesorId", sql.Int, profesorId)
        .query("DELETE FROM Partida_TB WHERE Profesor_ID_FK = @profesorId");

      await transaction.commit();

      await GenerarBitacora(req.user.id, `Partidas del profesor ${profesorId} eliminadas en modo debug`, null);

      return res.status(200).json({
        success: true,
        message: `Todas las partidas del profesor (${partidasIds.length}) y sus dependencias eliminadas exitosamente`
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Error al eliminar partidas del profesor:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar partidas del profesor",
      error: error.message
    });
  }
};

// Reiniciar todos los logros de un estudiante
export const reiniciarLogrosEstudiante = async (req, res) => {
  const { estudianteId } = req.params;

  try {
    const pool = await poolPromise;

    const estudianteCheck = await pool.request()
      .input("estudianteId", sql.Int, estudianteId)
      .query(`
        SELECT u.Usuario_ID_PK, r.Rol 
        FROM Usuario_TB u
        JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
        WHERE u.Usuario_ID_PK = @estudianteId AND r.Rol = 'Estudiante'
      `);

    if (estudianteCheck.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Estudiante no encontrado o no es un estudiante"
      });
    }

    const result = await pool.request()
      .input("estudianteId", sql.Int, estudianteId)
      .query("DELETE FROM Usuario_Logros_TB WHERE Usuario_ID_FK = @estudianteId");

    await GenerarBitacora(req.user.id, `Logros del estudiante ${estudianteId} reiniciados en modo debug`, null);

    return res.status(200).json({
      success: true,
      message: "Todos los logros del estudiante han sido eliminados exitosamente",
      affectedRows: result.rowsAffected[0]
    });

  } catch (error) {
    console.error("Error al reiniciar logros del estudiante:", error);
    return res.status(500).json({
      success: false,
      message: "Error al reiniciar logros del estudiante",
      error: error.message
    });
  }
};

// Obtener todos los grupos disponibles en el sistema
export const obtenerTodosGrupos = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        gc.GrupoCurso_ID_PK as id,
        cc.Codigo_Curso as codigo,
        cc.Nombre_Curso as nombre,
        gc.Codigo_Grupo as grupo,
        COUNT(gv.Usuario_ID_FK) as total_usuarios
      FROM GrupoCurso_TB gc
      JOIN CodigoCurso_TB cc ON gc.Curso_ID_FK = cc.CodigoCurso_ID_PK
      LEFT JOIN GrupoVinculado_TB gv ON gc.GrupoCurso_ID_PK = gv.GrupoCurso_ID_FK
      GROUP BY 
        gc.GrupoCurso_ID_PK, 
        cc.Codigo_Curso, 
        cc.Nombre_Curso, 
        gc.Codigo_Grupo
      ORDER BY cc.Nombre_Curso, gc.Codigo_Grupo
    `);

    const grupos = result.recordset.map(grupo => ({
      ...grupo,
      nombreCompleto: `${grupo.codigo}-${grupo.nombre} G${grupo.grupo}`
    }));

    await GenerarBitacora(req.user.id, "Todos los grupos consultados en modo debug", null);

    return res.status(200).json({
      success: true,
      count: grupos.length,
      grupos
    });

  } catch (error) {
    console.error("Error al obtener todos los grupos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener todos los grupos",
      error: error.message
    });
  }
};

// Obtener el historial de partidas jugadas
export const obtenerHistorialPartidas = async (req, res) => {
  try {
    const pool = await poolPromise;

    const partidasResult = await pool.request().query(`
      SELECT
        p.Partida_ID_PK as id_partida,
        CONVERT(varchar, p.FechaInicio, 120) as fecha,  
        CONCAT(u.Nombre, ' ', u.Apellido1) as profesor,
        cc.Codigo_Curso + '-' + cc.Nombre_Curso + ' G' + CAST(gc.Codigo_Grupo AS NVARCHAR) as curso_grupo,
        (SELECT COUNT(*) FROM Participantes_TB WHERE Partida_ID_FK = p.Partida_ID_PK) as total_estudiantes
      FROM Partida_TB p
      JOIN Usuario_TB u ON p.Profesor_ID_FK = u.Usuario_ID_PK
      JOIN GrupoCurso_TB gc ON p.Grupo_ID_FK = gc.GrupoCurso_ID_PK
      JOIN CodigoCurso_TB cc ON gc.Curso_ID_FK = cc.CodigoCurso_ID_PK
      ORDER BY p.FechaInicio DESC
    `);

    const historial = partidasResult.recordset.map(partida => ({
      id: partida.id_partida,
      fecha: partida.fecha, 
      profesor: partida.profesor,
      curso: partida.curso_grupo,
      total_estudiantes: partida.total_estudiantes
    }));

    await GenerarBitacora(req.user.id, "Historial de partidas consultado en modo debug", null);

    return res.status(200).json(historial);
  } catch (error) {
    console.error("Error al obtener historial de partidas:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener historial de partidas",
      error: error.message
    });
  }
};

// Obtener resultados detallados de una partida (solo para administradores)
export const getResultsAdmin = async (req, res) => {
  const { partidaId } = req.params;

  console.log("🔐 Acceso de administrador:");
  console.log("- Partida solicitada:", partidaId);

  try {
    const pool = await poolPromise;

    const partidaQuery = await pool.request()
      .input('partidaId', sql.Int, partidaId)
      .query('SELECT * FROM Partida_TB WHERE Partida_ID_PK = @partidaId');

    if (partidaQuery.recordset.length === 0) {
      console.log(" Partida no encontrada:", partidaId);
      return res.status(404).json({ message: 'Partida no encontrada' });
    }

    const partida = partidaQuery.recordset[0];
    console.log(" Partida encontrada:", partida.Partida_ID_PK);

    const equiposQuery = await pool.request()
      .input('partidaId', sql.Int, partidaId)
      .query(`
        SELECT DISTINCT Equipo 
        FROM Resultados_TB
        WHERE Partida_ID_FK = @partidaId
        ORDER BY Equipo
      `);

    const equipos = equiposQuery.recordset.map(e => e.Equipo);

    const miembrosPorEquipo = await Promise.all(equipos.map(async equipo => {
      const miembrosQuery = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .input('equipo', sql.Int, equipo)
        .query(`
          SELECT u.Usuario_ID_PK, u.Nombre, u.Apellido1, u.Apellido2
          FROM Participantes_TB p
          JOIN Usuario_TB u ON p.Usuario_ID_FK = u.Usuario_ID_PK
          WHERE p.Partida_ID_FK = @partidaId AND p.Equipo_Numero = @equipo
        `);
      return { equipo, miembros: miembrosQuery.recordset };
    }));

    const resultadosPorEquipo = await Promise.all(equipos.map(async equipo => {
      const resultadosQuery = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .input('equipo', sql.Int, equipo)
        .query(`
          SELECT *
          FROM Resultados_TB
          WHERE Partida_ID_FK = @partidaId AND Equipo = @equipo
        `);
      return { equipo, resultados: resultadosQuery.recordset };
    }));

    const logrosPorEquipo = {};
    for (const equipo of equipos) {
      const userQuery = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .input('equipo', sql.Int, equipo)
        .query(`
          SELECT TOP 1 Usuario_ID_FK
          FROM Participantes_TB
          WHERE Partida_ID_FK = @partidaId AND Equipo_Numero = @equipo
        `);

      const usuarioEjemplo = userQuery.recordset[0]?.Usuario_ID_FK;

      if (usuarioEjemplo) {
        const logrosQuery = await pool.request()
          .input('userId', sql.Int, usuarioEjemplo)
          .input('partidaId', sql.Int, partidaId)
          .query(`
            SELECT l.*
            FROM Usuario_Logros_TB ul
            JOIN Logros_TB l ON ul.Logro_ID_FK = l.Logro_ID_PK
            WHERE ul.Usuario_ID_FK = @userId
              AND ul.Partida_ID_FK = @partidaId
              AND l.Tipo = 'grupo'
          `);
        logrosPorEquipo[equipo] = logrosQuery.recordset;
      } else {
        logrosPorEquipo[equipo] = [];
      }
    }

    console.log(" Resultados para administrador obtenidos correctamente");
    return res.status(200).json({
      partida,
      equipos: miembrosPorEquipo,
      resultados: resultadosPorEquipo,
      logros: logrosPorEquipo
    });

  } catch (error) {
    console.error(' Error al obtener resultados (admin):', error);
    return res.status(500).json({ message: 'Error al obtener resultados' });
  }
};

