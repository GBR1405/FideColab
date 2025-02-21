import { sql, poolPromise } from "../config/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fetch from "node-fetch";
import multer from "multer";

// Obtener juegos disponibles
export const getTipoJuegos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Tipo_Juego_TB");
    res.json({ success: true, juegos: result.recordset });
  } catch (error) {
    console.error("Error al obtener juegos:", error);
    res.status(500).json({ success: false, error: "Error al obtener juegos" });
  }
};

// Obtener temas activos de un juego
export const getTemasPorJuego = async (req, res) => {
  try {
    const { juegoId } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("JuegoID", sql.Int, juegoId)
      .query("SELECT * FROM Tema_Juego_TB WHERE Tipo_Juego_ID_FK = @JuegoID AND Estado = 1");

    res.json({ success: true, temas: result.recordset });
  } catch (error) {
    console.error("Error al obtener temas:", error);
    res.status(500).json({ success: false, error: "Error al obtener temas" });
  }
};

export const getTemasPorJuegoTotal = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`
        SELECT tjt.Tema_Juego_ID_PK, tjt.Tipo_Juego_ID_FK, tj.Juego AS Tipo_Juego, tjt.Contenido, tjt.Estado
        FROM Tema_Juego_TB tjt
        JOIN Tipo_Juego_TB tj ON tjt.Tipo_Juego_ID_FK = tj.Tipo_Juego_ID_PK
      `);  
    res.json({ success: true, temas: result.recordset });
  } catch (error) {
    console.error("Error al obtener temas:", error);
    res.status(500).json({ success: false, error: "Error al obtener temas" });
  }
};




// Guardar configuración de personalización
export const guardarPersonalizacion = async (req, res) => {
    try {
        // Desestructurar los datos recibidos del frontend
        const { juegos, titulo, usuarioId } = req.body; // No necesitamos personalizacionId aquí

        if (!usuarioId) {
            return res.status(400).json({ success: false, error: "ID de usuario no proporcionado" });
        }

        if (!juegos || juegos.length === 0) {
            return res.status(400).json({ success: false, error: "No hay juegos seleccionados" });
        }

        const pool = await poolPromise;

        // Crear la nueva personalización
        const resultPersonalizacion = await pool
            .request()
            .input("Nombre", sql.NVarChar, titulo)
            .input("UsuarioID", sql.Int, usuarioId)
            .query(
                "INSERT INTO Personalizacion_TB (Nombre_Personalizacion, Usuario_ID_FK) OUTPUT INSERTED.Personalizacion_ID_PK VALUES (@Nombre, @UsuarioID)"
            );

        const personalizacionId = resultPersonalizacion.recordset[0].Personalizacion_ID_PK;

        // Insertar la configuración de juegos
        for (const juego of juegos) {
            console.log("Juego a insertar:", juego);

            await pool
                .request()
                .input("JuegoID", sql.Int, juego.Tipo_Juego_ID_PK)
                .input("PersonalizacionID", sql.Int, personalizacionId)
                .input("Dificultad", sql.Int, juego.dificultad)
                .input("Orden", sql.Int, juego.orden)
                .input("TemaID", sql.Int, juego.tema)
                .query(
                    "INSERT INTO ConfiguracionJuego_TB (Tipo_Juego_ID_FK, Personalizacion_ID_PK, Dificultad, Orden, Tema_Juego_ID_FK) VALUES (@JuegoID, @PersonalizacionID, @Dificultad, @Orden, @TemaID)"
                );
        }

        res.json({ success: true, message: "Configuración guardada con éxito" });
    } catch (error) {
        console.error("Error al guardar personalización:", error);
        res.status(500).json({ success: false, error: "Error al guardar configuración" });
    }
};

export const editarPersonalizacion = async (req, res) => {
    try {
        // Desestructurar los datos recibidos del frontend
        const { juegos, personalizacionId, titulo, usuarioId } = req.body;

        // Verificar los datos recibidos
        console.log("Datos recibidos en el backend:", req.body);

        if (!usuarioId) {
            return res.status(400).json({ success: false, error: "ID de usuario no proporcionado" });
        }

        if (!personalizacionId) {
            return res.status(400).json({ success: false, error: "ID de personalización no proporcionado" });
        }

        if (!juegos || juegos.length === 0) {
            return res.status(400).json({ success: false, error: "No hay juegos seleccionados" });
        }

        const pool = await poolPromise;

        // Actualizar el nombre de la personalización si se pasa un título
        await pool
            .request()
            .input("PersonalizacionID", sql.Int, personalizacionId)
            .input("Titulo", sql.NVarChar, titulo)
            .query("UPDATE Personalizacion_TB SET Nombre_Personalizacion = @Titulo WHERE Personalizacion_ID_PK = @PersonalizacionID");

        // Eliminar los juegos anteriores para esta personalización (si es necesario)
        await pool
            .request()
            .input("PersonalizacionID", sql.Int, personalizacionId)
            .query("DELETE FROM ConfiguracionJuego_TB WHERE Personalizacion_ID_PK = @PersonalizacionID");

        // Insertar los nuevos juegos
        for (const juego of juegos) {
            console.log("Juego a insertar:", juego);

            await pool
                .request()
                .input("JuegoID", sql.Int, juego.Tipo_Juego_ID_PK)
                .input("PersonalizacionID", sql.Int, personalizacionId)
                .input("Dificultad", sql.Int, juego.dificultad)
                .input("Orden", sql.Int, juego.orden)
                .input("TemaID", sql.Int, juego.tema)
                .query(
                    "INSERT INTO ConfiguracionJuego_TB (Tipo_Juego_ID_FK, Personalizacion_ID_PK, Dificultad, Orden, Tema_Juego_ID_FK) VALUES (@JuegoID, @PersonalizacionID, @Dificultad, @Orden, @TemaID)"
                );
        }

        res.json({ success: true, message: "Configuración editada con éxito" });
    } catch (error) {
        console.error("Error al editar personalización:", error);
        res.status(500).json({ success: false, error: "Error al editar configuración" });
    }
};



// Obtener configuración guardada por usuario
export const getConfiguracionPersonalizada = async (req, res) => {
  try {
    const token = req.cookies.IFUser_Info;
    if (!token) return res.status(401).json({ success: false, error: "Usuario no autenticado" });

    const decoded = jwt.verify(token, "tu_secreto_jwt");
    const usuarioId = decoded.id;

    const pool = await poolPromise;

    // Obtener la personalización más reciente del usuario
    const result = await pool
      .request()
      .input("UsuarioID", sql.Int, usuarioId)
      .query(
        `SELECT p.Personalizacion_ID_PK, p.Nombre_Personalizacion, c.Tipo_Juego_ID_FK, t.Juego, 
          c.Dificultad, c.Orden, c.Tema_Juego_ID_FK, tm.Contenido AS Tema
          FROM Personalizacion_TB p
          JOIN ConfiguracionJuego_TB c ON p.Personalizacion_ID_PK = c.Personalizacion_ID_PK
          JOIN Tipo_Juego_TB t ON c.Tipo_Juego_ID_FK = t.Tipo_Juego_ID_PK
          JOIN Tema_Juego_TB tm ON c.Tema_Juego_ID_FK = tm.Tema_Juego_ID_PK
          WHERE p.Usuario_ID_FK = @UsuarioID
          ORDER BY p.Personalizacion_ID_PK DESC, c.Orden ASC`
      );

    if (result.recordset.length === 0) {
      return res.json({ success: false, error: "No hay configuraciones guardadas" });
    }

    const personalizacion = {
      id: result.recordset[0].Personalizacion_ID_PK,
      nombre: result.recordset[0].Nombre_Personalizacion,
      juegos: result.recordset.map((row) => ({
        Tipo_Juego_ID_PK: row.Tipo_Juego_ID_FK,
        Juego: row.Juego,
        Dificultad: row.Dificultad,
        Orden: row.Orden,
        Tema_Juego_ID_FK: row.Tema_Juego_ID_FK,
        Tema: row.Tema,
      })),
    };

    res.json({ success: true, personalizacion });
  } catch (error) {
    console.error("Error al obtener configuración personalizada:", error);
    res.status(500).json({ success: false, error: "Error al obtener configuración" });
  }
};

// Controlador para guardar tema de juego
export const saveTemaJuego = async (req, res) => {
  console.log("Cuerpo de la solicitud recibido:", req.body);

  try {
    const { tipoJuegoID, contenido } = req.body;

    if (!tipoJuegoID || !contenido) {
      return res.status(400).json({ success: false, error: "Tipo de juego y contenido son requeridos" });
    }

    var pool = await poolPromise;
    var sqlQuery = `
      INSERT INTO Tema_Juego_TB (Tipo_Juego_ID_FK, Contenido, Estado)
      VALUES (@tipoJuegoID, @contenido, @estado)
    `;

    await pool
      .request()
      .input("tipoJuegoID", sql.Int, tipoJuegoID)
      .input("contenido", sql.NVarChar, contenido) // Guarda la URL de la imagen o el texto
      .input("estado", sql.Bit, 1) // Estado activo
      .query(sqlQuery);

    res.json({ success: true, message: "Tema guardado correctamente" });
  } catch (error) {
    console.error("Error al guardar tema:", error);
    res.status(500).json({ success: false, error: "Error al guardar tema" });
  }
};
