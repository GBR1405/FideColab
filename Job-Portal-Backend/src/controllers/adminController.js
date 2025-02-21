import axios from 'axios';
import PDFDocument from "pdfkit";
import { poolPromise } from "../config/db.js";
import fs from "fs";
import path from "path";

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
