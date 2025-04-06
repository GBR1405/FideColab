import axios from 'axios';
import PDFDocument from "pdfkit";
import { poolPromise } from "../config/db.js";
import fs from "fs";
import path from "path";
import multer from "multer";
import xlsx from "xlsx";
import pdfkit from "pdfkit";
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import { GenerarBitacora } from "../controllers/generalController.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });


export const generateStudentsReport = async (req, res) => {
  try {
    const pool = await poolPromise;

    // Obtener el ID del rol "Estudiante"
    const roleQuery = await pool.request()
      .input("rol", "Estudiante")
      .query("SELECT Rol_ID_PK FROM Rol_TB WHERE Rol = @rol");

    if (roleQuery.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Rol 'Estudiante' no encontrado" });
    }

    const studentRoleId = roleQuery.recordset[0].Rol_ID_PK;

    // Obtener los estudiantes
    const result = await pool.request()
      .input("rolId", studentRoleId)
      .query(`
        SELECT Nombre, Apellido1, Apellido2, Correo, Estado 
        FROM Usuario_TB 
        WHERE Rol_ID_FK = @rolId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "No hay estudiantes registrados" });
    }

    // Crear la carpeta "reports" si no existe
    const reportsDir = path.join(process.cwd(), "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Descargar la imagen de la universidad
    const imageUrl = "https://www.coopeande1.com/sites/default/files/styles/420_width_retina/public/2021-01/u_fidelitas.png?itok=DC77XGsA";
    const imagePath = path.join(reportsDir, "u_fidelitas.png");
    const writer = fs.createWriteStream(imagePath);

    const imageResponse = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });

    imageResponse.data.pipe(writer);

    writer.on('finish', async () => {
      // Crear el PDF
      const filename = `Estudiantes_${Date.now()}.pdf`;
      const filePath = path.join(reportsDir, filename);
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Agregar "Universidad Fidelitas" a la izquierda y la imagen a la derecha
      doc.fontSize(20).text("Universidad Fidelitas", { width: 400, align: "left" });
      doc.image(imagePath, 450, 20, { width: 100 });  // Imagen a la derecha
      doc.moveDown(2);

      // Agregar cantidad de estudiantes y fecha de descarga
      doc.fontSize(14).text(`Cantidad de Estudiantes: ${result.recordset.length}`, { align: "center" });
      doc.moveDown(1);
      doc.text(`Fecha de descarga: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown(2);

      // Agregar título "Reporte de Estudiantes"
      doc.fontSize(16).text("Reporte de Estudiantes", { align: "center" });
      doc.moveDown(2);

      // Dibujar la tabla
      const startX = 50; // Margen izquierdo
      let startY = doc.y; // Posición inicial debajo del título
      const columnWidths = [40, 100, 100, 180, 80]; // Ancho de cada columna

      // Encabezados de la tabla
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("N°", startX, startY, { width: columnWidths[0], align: "center" });
      doc.text("Nombre", startX + columnWidths[0], startY, { width: columnWidths[1], align: "center" });
      doc.text("Apellido 1", startX + columnWidths[0] + columnWidths[1], startY, { width: columnWidths[2], align: "center" });
      doc.text("Correo", startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY, { width: columnWidths[3], align: "center" });
      doc.text("Estado", startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY, { width: columnWidths[4], align: "center" });

      // Línea separadora
      startY += 20;
      doc.moveTo(startX, startY).lineTo(startX + columnWidths.reduce((a, b) => a + b), startY).stroke();
      startY += 5;

      // Agregar los estudiantes
      doc.font("Helvetica");
      result.recordset.forEach((student, index) => {
        doc.text(`${index + 1}`, startX, startY, { width: columnWidths[0], align: "center" });
        doc.text(student.Nombre, startX + columnWidths[0], startY, { width: columnWidths[1], align: "center" });
        doc.text(student.Apellido1, startX + columnWidths[0] + columnWidths[1], startY, { width: columnWidths[2], align: "center" });
        doc.text(student.Correo, startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY, { width: columnWidths[3], align: "center" });
        doc.text(student.Estado ? "Activo" : "Inactivo", startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY, { width: columnWidths[4], align: "center" });

        startY += 20;
        // Dibujar línea entre filas
        doc.moveTo(startX, startY).lineTo(startX + columnWidths.reduce((a, b) => a + b), startY).stroke();
        startY += 5;
      });

      doc.end();

      await GenerarBitacora(req.user.id, "Descarga de reporte de estudiantes", null);

      // Esperar a que el PDF se haya escrito antes de enviarlo
      stream.on("finish", () => {
        res.download(filePath, filename, (err) => {
          if (err) {
            console.error("Error al enviar el PDF:", err);
            return res.status(500).json({ success: false, message: "Error al descargar PDF" });
          }

          // Eliminar el archivo después de enviarlo
          fs.unlink(imagePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error al eliminar la imagen:", unlinkErr);
          });

          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error al eliminar el archivo PDF:", unlinkErr);
          });
        });
      });
    });

  } catch (error) {
    console.error("Error generando el informe:", error);
    res.status(500).json({ success: false, message: "Error generando PDF" });
  }
};

export const generateProfesorReport = async (req, res) => {
  try {
    const pool = await poolPromise;

    // Obtener el ID del rol "Profesor"
    const roleQuery = await pool.request()
      .input("rol", "Profesor")
      .query("SELECT Rol_ID_PK FROM Rol_TB WHERE Rol = @rol");

    if (roleQuery.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Rol 'Profesor' no encontrado" });
    }

    const ProfesorRoleId = roleQuery.recordset[0].Rol_ID_PK;

    // Obtener los estudiantes
    const result = await pool.request()
      .input("rolId", ProfesorRoleId)
      .query(`
        SELECT Nombre, Apellido1, Apellido2, Correo, Estado 
        FROM Usuario_TB 
        WHERE Rol_ID_FK = @rolId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "No hay profesores registrados" });
    }

    // Crear la carpeta "reports" si no existe
    const reportsDir = path.join(process.cwd(), "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Descargar la imagen de la universidad
    const imageUrl = "https://www.coopeande1.com/sites/default/files/styles/420_width_retina/public/2021-01/u_fidelitas.png?itok=DC77XGsA";
    const imagePath = path.join(reportsDir, "u_fidelitas.png");
    
    const { data } = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(imagePath, Buffer.from(data));

    // Crear el PDF
    const filename = `Profesores_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, filename);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Agregar "Universidad Fidelitas" a la izquierda y la imagen a la derecha
    doc.fontSize(20).text("Universidad Fidélitas", { width: 400, align: "left" });
    doc.image(imagePath, 450, 20, { width: 100 }); // Imagen a la derecha
    doc.moveDown(2);

    // Agregar cantidad de profesores y fecha de descarga
    doc.fontSize(14).text(`Cantidad de Profesores: ${result.recordset.length}`, { align: "center" });
    doc.moveDown(1);
    doc.text(`Fecha de descarga: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(2);

    // Agregar título "Reporte de Profesores"
    doc.fontSize(16).text("Reporte de Profesores", { align: "center" });
    doc.moveDown(2);

    // Dibujar la tabla
    const startX = 50;
    let startY = doc.y;
    const columnWidths = [40, 100, 100, 180, 80];

    // Encabezados de la tabla
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("N°", startX, startY, { width: columnWidths[0], align: "center" });
    doc.text("Nombre", startX + columnWidths[0], startY, { width: columnWidths[1], align: "center" });
    doc.text("Apellido 1", startX + columnWidths[0] + columnWidths[1], startY, { width: columnWidths[2], align: "center" });
    doc.text("Correo", startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY, { width: columnWidths[3], align: "center" });
    doc.text("Estado", startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY, { width: columnWidths[4], align: "center" });

    startY += 20;
    doc.moveTo(startX, startY).lineTo(startX + columnWidths.reduce((a, b) => a + b), startY).stroke();
    startY += 5;

    // Agregar los profesores 
    doc.font("Helvetica");
    result.recordset.forEach((profesor, index) => {
      doc.text(`${index + 1}`, startX, startY, { width: columnWidths[0], align: "center" });
      doc.text(profesor.Nombre, startX + columnWidths[0], startY, { width: columnWidths[1], align: "center" });
      doc.text(profesor.Apellido1, startX + columnWidths[0] + columnWidths[1], startY, { width: columnWidths[2], align: "center" });
      doc.text(profesor.Correo, startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY, { width: columnWidths[3], align: "center" });
      doc.text(profesor.Estado ? "Activo" : "Inactivo", startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY, { width: columnWidths[4], align: "center" });

      startY += 20;
      doc.moveTo(startX, startY).lineTo(startX + columnWidths.reduce((a, b) => a + b), startY).stroke();
      startY += 5;
    });

    await GenerarBitacora(req.user.id, "Descarga de reporte de Profesores", null);

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error("Error al enviar el PDF:", err);
          return res.status(500).json({ success: false, message: "Error al descargar PDF" });
        }

        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error al eliminar el archivo PDF:", unlinkErr);
        });

        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error al eliminar la imagen:", unlinkErr);
        });
      });
    });

  } catch (error) {
    console.error("Error generando el informe:", error);
    res.status(500).json({ success: false, message: "Error generando PDF" });
  }
};

export const generatePartidaReport = async (req, res) => {
  try {
    const pool = await poolPromise;

    // Obtener todos los registros de la tabla Partida_TB
    const result = await pool.request().query(`
      SELECT Partida_ID_PK, FechaInicio, FechaFin, Profesor_ID_FK, EstadoPartida
      FROM Partida_TB
    `);

    // Crear la carpeta "reports" si no existe
    const reportsDir = path.join(process.cwd(), "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Descargar la imagen de la universidad
    const imageUrl = "https://www.coopeande1.com/sites/default/files/styles/420_width_retina/public/2021-01/u_fidelitas.png?itok=DC77XGsA";
    const imagePath = path.join(reportsDir, "u_fidelitas.png");

    const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imagePath, Buffer.from(data));

    // Crear el PDF
    const filename = `Partidas_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, filename);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Agregar "Universidad Fidelitas" a la izquierda y la imagen a la derecha
    doc.fontSize(20).text("Universidad Fidélitas", { width: 400, align: "left" });
    doc.image(imagePath, 450, 20, { width: 100 }); // Imagen a la derecha
    doc.moveDown(2);

    // Agregar cantidad de partidas y fecha de descarga
    doc.fontSize(14).text(`Cantidad de Partidas: ${result.recordset.length}`, { align: "center" });
    doc.moveDown(1);
    doc.text(`Fecha de descarga: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(2);

    // Agregar título "Reporte de Partidas"
    doc.fontSize(16).text("Reporte de Partidas", { align: "center" });
    doc.moveDown(2);

    // Dibujar la tabla
    const startX = 50;
    let startY = doc.y;
    const columnWidths = [40, 100, 100, 180, 80];
    const rowHeight = 60; // Establecer la altura de cada fila (más ancha)

    // Encabezados de la tabla
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("N°", startX, startY, { width: columnWidths[0], align: "center" });
    doc.text("Fecha Inicio", startX + columnWidths[0], startY, { width: columnWidths[1], align: "center" });
    doc.text("Fecha Fin", startX + columnWidths[0] + columnWidths[1], startY, { width: columnWidths[2], align: "center" });
    doc.text("Profesor ID", startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY, { width: columnWidths[3], align: "center" });
    doc.text("Estado", startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY, { width: columnWidths[4], align: "center" });

    startY += 30; // Aumentamos la altura de la fila para los encabezados
    doc.moveTo(startX, startY).lineTo(startX + columnWidths.reduce((a, b) => a + b), startY).stroke();
    startY += 5;

    if (result.recordset.length > 0) {
      // Agregar las partidas si hay registros
      doc.font("Helvetica");
      result.recordset.forEach((partida, index) => {
        // Modificar la posición Y para cada fila
        doc.text(`${index + 1}`, startX, startY, { width: columnWidths[0], align: "center" });
        doc.text(partida.FechaInicio, startX + columnWidths[0], startY, { width: columnWidths[1], align: "center" });
        doc.text(partida.FechaFin || "N/A", startX + columnWidths[0] + columnWidths[1], startY, { width: columnWidths[2], align: "center" });
        doc.text(partida.Profesor_ID_FK, startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY, { width: columnWidths[3], align: "center" });
        doc.text(partida.EstadoPartida, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY, { width: columnWidths[4], align: "center" });

        startY += rowHeight; // Aumentamos la altura de cada fila
        doc.moveTo(startX, startY).lineTo(startX + columnWidths.reduce((a, b) => a + b), startY).stroke();
        startY += 5;
      });
    } else {
      // Si no hay registros, mostrar mensaje en la tabla
      startY += 10;
      doc.fontSize(14).text("No hay partidas registradas.", startX, startY, { align: "center" });
    }

    await GenerarBitacora(req.user.id, "Descarga de reporte de Partidas", null);
    doc.end();

    stream.on("finish", () => {
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error("Error al enviar el PDF:", err);
          return res.status(500).json({ success: false, message: "Error al descargar PDF" });
        }

        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error al eliminar el archivo PDF:", unlinkErr);
        });

        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error al eliminar la imagen:", unlinkErr);
        });
      });
    });

  } catch (error) {
    console.error("Error generando el informe:", error);
    res.status(500).json({ success: false, message: "Error generando PDF" });
  }
};


export const generateBitacoraReport = async (req, res) => {
  try {
    console.log("Generando reporte de bitácora...");

    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT B.Bitacora_ID_PK, 
             U.Nombre + ' ' + U.Apellido1 + ' ' + U.Apellido2 AS UsuarioNombre,
             B.Accion, 
             B.Error, 
             B.Fecha 
      FROM Bitacora_TB B
      INNER JOIN Usuario_TB U ON B.Usuario_ID_FK = U.Usuario_ID_PK
      ORDER BY B.Fecha DESC
    `);

    console.log("Registros encontrados:", result.recordset.length);

    // Crear directorio si no existe
    const reportsDir = path.join(process.cwd(), "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
      console.log("Carpeta 'reports' creada.");
    }

    const filename = `Bitacora_${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, filename);

    // Crear PDF
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Título
    doc.fontSize(18).text("Bitácora de Movimientos y Errores", { align: "center" });
    doc.moveDown(2);

    // Configuración de la tabla
    const startX = 50;
    let startY = doc.y;
    const columnWidths = [40, 200, 150, 250, 100]; // Ampliamos la columna de "Acción"
    const rowPadding = 10; // Espaciado interno de cada celda

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("ID", startX, startY, { width: columnWidths[0], align: "center" });
    doc.text("Usuario", startX + columnWidths[0], startY, { width: columnWidths[1], align: "center" });
    doc.text("Acción", startX + columnWidths[0] + columnWidths[1], startY, { width: columnWidths[2], align: "center" });
    doc.text("Error", startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY, { width: columnWidths[3], align: "center" });
    doc.text("Fecha", startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY, { width: columnWidths[4], align: "center" });

    // Línea bajo el encabezado
    startY += 20;
    doc.moveTo(startX, startY).lineTo(startX + columnWidths.reduce((a, b) => a + b), startY).stroke();
    startY += 5;

    // Si hay registros, los agregamos
    if (result.recordset.length > 0) {
      doc.font("Helvetica");
      result.recordset.forEach((entry) => {
        // Determinar la altura dinámica de la fila según el texto más largo
        const textHeights = [
          doc.heightOfString(entry.UsuarioNombre, { width: columnWidths[1] }),
          doc.heightOfString(entry.Accion, { width: columnWidths[2] }),
          doc.heightOfString(entry.Error || "N/A", { width: columnWidths[3] })
        ];
        const maxTextHeight = Math.max(...textHeights) + rowPadding * 2;

        // Dibujar cada celda alineada
        doc.text(`${entry.Bitacora_ID_PK}`, startX, startY, { width: columnWidths[0], align: "center" });
        doc.text(entry.UsuarioNombre, startX + columnWidths[0], startY, { width: columnWidths[1], align: "center" });
        doc.text(entry.Accion, startX + columnWidths[0] + columnWidths[1], startY, { width: columnWidths[2], align: "center" });
        doc.text(entry.Error || "N/A", startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY, { width: columnWidths[3], align: "center" });
        doc.text(entry.Fecha ? new Date(entry.Fecha).toLocaleString() : "N/A", startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY, { width: columnWidths[4], align: "center" });

        // Dibujar líneas de separación para toda la fila
        startY += maxTextHeight;
        doc.moveTo(startX, startY).lineTo(startX + columnWidths.reduce((a, b) => a + b), startY).stroke();
        startY += 5;
      });
    } else {
      // Si no hay registros, mostrar mensaje en la tabla
      startY += 10;
      doc.fontSize(14).text("No hay registros en la bitácora.", startX, startY, { align: "center" });
    }

    // Registrar en la bitácora
    await GenerarBitacora(req.user.id, "Descarga de reporte de Bitácora", null);

    doc.end();

    stream.on("finish", () => {
      console.log("PDF generado correctamente.");
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error("Error al enviar el PDF:", err);
          return res.status(500).json({ success: false, message: "Error al descargar PDF" });
        }

        console.log("Archivo enviado al cliente.");
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error al eliminar el archivo PDF:", unlinkErr);
        });
      });
    });

  } catch (error) {
    console.error("Error generando el informe:", error);
    res.status(500).json({ success: false, message: "Error generando PDF" });
  }
};

export const agregarCurso = async (req, res) => {
  const { nombreCurso, codigoCurso } = req.body;

  if (!nombreCurso || !codigoCurso) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  try {
      const pool = await poolPromise;

      // 1️⃣ Verificar si ya existe un curso con el mismo nombre o código
      const checkQuery = `
          SELECT CodigoCurso_ID_PK 
          FROM CodigoCurso_TB 
          WHERE Nombre_Curso = @nombreCurso OR Codigo_Curso = @codigoCurso
      `;
      const checkResult = await pool.request()
          .input("nombreCurso", nombreCurso)
          .input("codigoCurso", codigoCurso)
          .query(checkQuery);

      if (checkResult.recordset.length > 0) {
          return res.status(409).json({ error: "El curso ya existe." });
      }

      // 2️⃣ Insertar el nuevo curso
      const insertCursoQuery = `
          INSERT INTO CodigoCurso_TB (Nombre_Curso, Codigo_Curso) 
          OUTPUT INSERTED.CodigoCurso_ID_PK
          VALUES (@nombreCurso, @codigoCurso)
      `;
      const insertCursoResult = await pool.request()
          .input("nombreCurso", nombreCurso)
          .input("codigoCurso", codigoCurso)
          .query(insertCursoQuery);

      const nuevoCursoId = insertCursoResult.recordset[0].CodigoCurso_ID_PK;

      // 3️⃣ Insertar el primer grupo (G1) en la tabla GrupoCurso_TB
      const insertGrupoQuery = `
          INSERT INTO GrupoCurso_TB (Codigo_Grupo, Curso_ID_FK) 
          VALUES (1, @nuevoCursoId)
      `;
      await pool.request()
          .input("nuevoCursoId", nuevoCursoId)
          .query(insertGrupoQuery);

          await GenerarBitacora(req.user.id, "Curso Agregado", null);
      return res.status(201).json({ message: "Curso y grupo G1 agregados correctamente." });

  } catch (error) {
      console.error("Error al agregar curso:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const obtenerCursos = async (req, res) => {
  try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
          SELECT CodigoCurso_ID_PK AS id, Nombre_Curso AS nombre, Codigo_Curso AS codigo 
          FROM CodigoCurso_TB
      `);

      res.json(result.recordset);
  } catch (error) {
      console.error("Error obteniendo cursos:", error);
      res.status(500).json({ error: "Error obteniendo los cursos." });
  }
};

// Obtener el último grupo de un curso específico
export const obtenerUltimoGrupoCurso = async (req, res) => {
  try {
      const { courseId } = req.params;
      const pool = await poolPromise;
      const result = await pool.request()
          .input("courseId", courseId)
          .query(`
              SELECT TOP 1 Codigo_Grupo AS numero
              FROM GrupoCurso_TB
              WHERE Curso_ID_FK = @courseId
              ORDER BY Codigo_Grupo DESC
          `);

      const ultimoGrupo = result.recordset[0] || { numero: 1 }; // Si no hay grupos, el primero será G1
      res.json(ultimoGrupo);
  } catch (error) {
      console.error("Error obteniendo el último grupo:", error);
      res.status(500).json({ error: "Error obteniendo el último grupo." });
  }
};

export const guardarGrupo = async (req, res) => {
  try {
      const { cursoId, grupoNumero } = req.body; // Asegúrate de recibir ambos datos

      if (!cursoId || !grupoNumero) {
          return res.status(400).json({ mensaje: "El ID del curso y el número del grupo son obligatorios." });
      }

      const pool = await poolPromise;

      // 1️⃣ Verificar si el curso existe
      const cursoExiste = await pool
          .request()
          .input("cursoId", cursoId)
          .query("SELECT COUNT(*) AS total FROM CodigoCurso_TB WHERE CodigoCurso_ID_PK = @cursoId");

      if (cursoExiste.recordset[0].total === 0) {
          return res.status(404).json({ mensaje: "El curso no existe." });
      }

      // 2️⃣ Insertar el nuevo grupo
      await pool
          .request()
          .input("codigoGrupo", grupoNumero)
          .input("cursoId", cursoId)
          .query(`
              INSERT INTO GrupoCurso_TB (Codigo_Grupo, Curso_ID_FK)
              VALUES (@codigoGrupo, @cursoId)
          `);

      await GenerarBitacora(req.user.id, "Grupo Agregado", null);
      res.status(201).json({ mensaje: "Grupo creado con éxito", grupoNumero });
  } catch (error) {
      console.error("Error al guardar el grupo:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const agregarProfesor = async (req, res) => {
  try {
    const { manual, profesores } = req.body;
    let profesoresData = [];
    let saltados = 0;  // Variable para contar los usuarios saltados por duplicidad
    let nuevosProfesores = [];  // Almacenar solo los profesores nuevos para el PDF

    // Obtener el ID del rol 'Profesor'
    const pool = await poolPromise;
    const rolResult = await pool.request().query(`SELECT Rol_ID_PK FROM Rol_TB WHERE Rol = 'Profesor'`);

    if (rolResult.recordset.length === 0) {
      return res.status(400).json({ mensaje: "El rol 'Profesor' no está disponible en la base de datos." });
    }

    const rolId = rolResult.recordset[0].Rol_ID_PK;
    console.log('ID del rol de Profesor:', rolId);

    if (manual === "true") {
      // Carga manual
      const { name, lastName1, lastName2, email, gender  } = req.body;

      console.log('Datos para carga manual:', { name, lastName1, lastName2, email, gender  });

      if (!name || !lastName1 || !lastName2 || !email || !gender) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

      // Generar una contraseña aleatoria y encriptarla
      const generatedPassword = generatePassword(name);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      console.log('Contraseña generada:', generatedPassword);

      profesoresData.push({
        name,
        lastName1,
        lastName2,
        email,
        password: hashedPassword,  // Usar la contraseña encriptada
        generatedPassword,  // Contraseña generada (sin encriptar) para el PDF
        rolId,
        generoId: gender
      });

      console.log('Profesores agregados manualmente:', profesoresData);

    } else {
      // Si ya tienes el JSON de profesores
      if (!profesores || profesores.length === 0) {
        return res.status(400).json({ mensaje: "No se han recibido datos de profesores." });
      }

      console.log('Datos recibidos del JSON:', profesores);

      profesoresData = profesores.map(prof => {
        const generatedPassword = generatePassword(prof.name);  // Utilizar 'name' como en el JSON de entrada
        return {
          name: prof.name,
          lastName1: prof.lastName1,
          lastName2: prof.lastName2,
          email: prof.email,
          password: bcrypt.hashSync(generatedPassword, 10),  // Encriptar la contraseña
          generatedPassword,  // Guardar la contraseña generada para el PDF
          rolId,
          generoId: prof.gender  // Usar 'gender' como en el JSON de entrada
        };
      });

      console.log('Profesores cargados desde el JSON:', profesoresData);
    }

    // Insertar los profesores en la base de datos
    for (const prof of profesoresData) {
      console.log('Insertando profesor:', prof);

      // Verificar si el correo ya existe
      const existingUser = await pool.request()
        .input("email", sql.NVarChar, prof.email)
        .query(`SELECT 1 FROM Usuario_TB WHERE Correo = @email`);

      if (existingUser.recordset.length > 0) {
        console.log(`El correo ${prof.email} ya existe. Se omite este profesor.`);
        saltados++;  // Incrementar contador de usuarios saltados
        continue;  // Saltar a la siguiente iteración
      }

      // Si el correo no existe, proceder con la inserción
      await pool.request()
        .input("name", sql.NVarChar, prof.name)
        .input("lastName1", sql.NVarChar, prof.lastName1)
        .input("lastName2", sql.NVarChar, prof.lastName2)
        .input("email", sql.NVarChar, prof.email)
        .input("password", sql.NVarChar, prof.password)  // Insertar la contraseña encriptada
        .input("rolId", sql.Int, prof.rolId)
        .input("generoId", sql.Int, prof.generoId)
        .input("estado", sql.Bit, 1)
        .query(`INSERT INTO Usuario_TB (Nombre, Apellido1, Apellido2, Correo, Contraseña, Rol_ID_FK, Genero_ID_FK, Estado) 
                VALUES (@name, @lastName1, @lastName2, @email, @password, @rolId, @generoId, @estado)`);

      console.log('Profesor insertado correctamente:', prof);

      // Agregar solo los nuevos profesores a la lista de nuevosProfesores
      nuevosProfesores.push(prof);
    }

    // Generar el PDF solo con los nuevos profesores
    let pdfPath = '';
    if (nuevosProfesores.length > 0) {
      // Si hay nuevos profesores, generar el PDF con los datos de los profesores insertados
      pdfPath = await generatePDF(nuevosProfesores, saltados);
      console.log('PDF generado en:', pdfPath);
    } else {
      // Si todos fueron saltados, generar un PDF vacío
      pdfPath = await generatePDF([], saltados);
      console.log('Todos los profesores fueron omitidos, PDF vacío generado.');
    }

    // Leer el archivo PDF y convertirlo a base64
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');

    // Enviar el PDF como respuesta en base64 junto con el mensaje de omisiones
    const mensaje = saltados === profesoresData.length
      ? 'Se omitieron todos los profesores porque ya se encuentran registrados sus correos.'
      : `Se omitieron ${saltados} profesores porque ya se encuentran registrados sus correos.`;

      await GenerarBitacora(req.user.id, "Profesor/es agregados", null);
    res.json({
      success: true,
      pdfBase64,
      mensaje
    });

    // Eliminar el archivo PDF después de enviarlo
    fs.unlink(pdfPath, (err) => {
      if (err) console.error("Error al eliminar el archivo PDF:", err);
    });

  } catch (error) {
    console.error("Error al agregar profesores:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const desvincularGrupo = async (req, res) => {
  const { profesorId, grupoId } = req.body;

  console.log(grupoId)

  try {
      const pool = await poolPromise;
      await pool.request()
          .input('profesorId', profesorId)
          .input('grupoId', grupoId)
          .query(`
              DELETE FROM GrupoVinculado_TB
              WHERE GruposEncargados_ID_PK = @grupoId
          `);

      res.status(200).json({ message: 'Grupo desvinculado correctamente' });
  } catch (error) {
      console.error("Error desvinculando grupo:", error);
      res.status(500).json({ error: "Error desvinculando grupo" });
  }
};

// Obtener todos los profesores
export const getAllProfessors = async (req, res) => {
  try {
      // Usar poolPromise para obtener la conexión y realizar la consulta
      const pool = await poolPromise;
      const result = await pool.request()
        .query("SELECT u.Usuario_ID_PK, u.Nombre, u.Apellido1, u.Apellido2, u.Correo FROM Usuario_TB u JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK WHERE r.Rol = 'Profesor';");

      // Responder con los datos obtenidos
      res.status(200).json({ professors: result.recordset });
  } catch (err) {
      console.error('Error al obtener profesores:', err);
      res.status(500).json({ error: 'Error al obtener profesores' });
  }
};


export const getAllGroups = async (req, res) => {
  try {
      const pool = await poolPromise; // Obtener la conexión
      const result = await pool.request()
          .query(`
              SELECT gc.GrupoCurso_ID_PK, gc.Codigo_Grupo, cc.Nombre_Curso, cc.Codigo_Curso
              FROM GrupoCurso_TB gc
              JOIN CodigoCurso_TB cc ON gc.Curso_ID_FK = cc.CodigoCurso_ID_PK
          `);

      // Formatear los resultados
      const formattedGroups = result.recordset.map(group => {
          return {
              id: group.GrupoCurso_ID_PK,
              codigo: group.Codigo_Curso, // Código del curso
              nombre: group.Nombre_Curso, // Nombre del curso
              grupo: group.Codigo_Grupo, // Número de grupo
          };
      });

      res.status(200).json({ groups: formattedGroups });
  } catch (error) {
      console.error("Error al obtener grupos:", error);
      res.status(500).json({ message: "Error al obtener los grupos" });
  }
};

export const obtenerCursosDelProfesor = async (req, res) => {
  const { profesorId } = req.params; 

  try {
      const pool = await poolPromise;

      // Consulta SQL para obtener los cursos del profesor
      const query = `
          SELECT 
              GruposEncargados_ID_PK AS id, 
              CC.Nombre_Curso AS nombre, 
              CC.Codigo_Curso AS codigo,
              GC.Codigo_Grupo AS grupo
          FROM 
              GrupoVinculado_TB GV
          INNER JOIN 
              GrupoCurso_TB GC ON GV.GrupoCurso_ID_FK = GC.GrupoCurso_ID_PK
          INNER JOIN 
              CodigoCurso_TB CC ON GC.Curso_ID_FK = CC.CodigoCurso_ID_PK
          WHERE 
              GV.Usuario_ID_FK = @profesorId
      `;

      const result = await pool.request()
          .input('profesorId', profesorId) // Parámetro para evitar SQL Injection
          .query(query);

      res.json(result.recordset); // Enviar los cursos como respuesta
  } catch (error) {
      console.error("Error obteniendo los cursos del profesor:", error);
      res.status(500).json({ error: "Error obteniendo los cursos del profesor." });
  }
};

export const getGruposDisponibles = async (req, res) => {
  try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
          SELECT 
          gc.GrupoCurso_ID_PK AS id, 
          cc.Codigo_Curso AS codigo, 
          cc.Nombre_Curso AS nombre, 
          gc.Codigo_Grupo AS grupo
      FROM 
          GrupoCurso_TB gc
      JOIN 
          CodigoCurso_TB cc ON gc.Curso_ID_FK = cc.CodigoCurso_ID_PK
      WHERE 
          NOT EXISTS (
              SELECT 1
              FROM GrupoVinculado_TB gv
              JOIN Usuario_TB u ON gv.Usuario_ID_FK = u.Usuario_ID_PK
              JOIN Rol_TB r ON u.Rol_ID_FK = r.Rol_ID_PK
              WHERE gc.GrupoCurso_ID_PK = gv.GrupoCurso_ID_FK
                AND r.Rol = 'Profesor'
          );
      `);

      res.status(200).json({ grupos: result.recordset });
  } catch (error) {
      console.error("Error obteniendo grupos disponibles:", error);
      res.status(500).json({ error: "Error obteniendo grupos disponibles" });
  }
};

export const asignarGrupo = async (req, res) => {
  const { profesorId, grupoId } = req.body;

  try {
      const pool = await poolPromise;
      await pool.request()
          .input('profesorId', profesorId)
          .input('grupoId', grupoId)
          .query(`
              INSERT INTO GrupoVinculado_TB (Usuario_ID_FK, GrupoCurso_ID_FK)
              VALUES (@profesorId, @grupoId)
          `);

      res.status(200).json({ message: 'Grupo asignado correctamente' });
  } catch (error) {
      console.error("Error asignando grupo:", error);
      res.status(500).json({ error: "Error asignando grupo" });
  }
};


// Función para generar una contraseña aleatoria
function generatePassword(name) {
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `${name}${randomNumber}`;
}

// Función para generar el PDF
async function generatePDF(profesores) {
  const pdf = new PDFDocument();
  const filePath = `./profesores_${Date.now()}.pdf`;
  const writeStream = fs.createWriteStream(filePath);

  // Pipe el PDF al archivo
  pdf.pipe(writeStream);

  // Título de la página
  pdf.fontSize(20).text("Credenciales de Profesores", { align: "center" });
  pdf.moveDown(2);

  // Dibujar la cabecera de la tabla con fondo azul
  const startX = 50;
  let startY = pdf.y;
  const columnWidths = [100, 100, 100, 100, 100]; // Ancho de cada columna

  pdf.fillColor('#3b82f6')  // Fondo azul
    .rect(startX, startY, columnWidths.reduce((a, b) => a + b), 30)  // Cabecera de la tabla
    .fill()
    .stroke();

  pdf.fillColor('#FFFFFF')  // Color del texto
    .fontSize(12)
    .text('Correo', startX, startY + 7, { width: columnWidths[0], align: 'center' })
    .text('Contraseña', startX + columnWidths[0], startY + 7, { width: columnWidths[1], align: 'center' })
    .text('Nombre', startX + columnWidths[0] + columnWidths[1], startY + 7, { width: columnWidths[2], align: 'center' })
    .text('Apellido', startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY + 7, { width: columnWidths[3], align: 'center' })
    .text('Género', startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY + 7, { width: columnWidths[4], align: 'center' });
  
  pdf.moveDown();

  // Línea separadora entre el encabezado y las filas
  startY += 30;
  pdf.moveTo(startX, startY).lineTo(startX + columnWidths.reduce((a, b) => a + b), startY).stroke();
  startY += 5;

  // Añadir filas de la tabla
  profesores.forEach((prof, index) => {
    pdf.rect(startX, startY, columnWidths.reduce((a, b) => a + b), 30)  // Borde de las filas
      .fill('#FFFFFF')  // Color de fondo de las filas
      .stroke();

    pdf.fillColor('#000000')
      .text(prof.email, startX, startY + 7, { width: columnWidths[0], align: 'center' })
      .text(prof.generatedPassword, startX + columnWidths[0], startY + 7, { width: columnWidths[1], align: 'center' })
      .text(prof.name, startX + columnWidths[0] + columnWidths[1], startY + 7, { width: columnWidths[2], align: 'center' })
      .text(prof.lastName1, startX + columnWidths[0] + columnWidths[1] + columnWidths[2], startY + 7, { width: columnWidths[3], align: 'center' })
      .text(prof.generoId === 1 ? 'Masculino' : 'Femenino', startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], startY + 7, { width: columnWidths[4], align: 'center' });

    // Línea separadora entre las filas
    startY += 30;
    pdf.moveTo(startX, startY).lineTo(startX + columnWidths.reduce((a, b) => a + b), startY).stroke();
    startY += 5;
  });

  // Terminar el PDF
  pdf.end();

  // Asegurarse de que el archivo esté completamente escrito antes de retornar el path
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(filePath));  // Si se completa la escritura
    writeStream.on('error', reject);  // Si hay un error
  });
}

export { generatePDF };

