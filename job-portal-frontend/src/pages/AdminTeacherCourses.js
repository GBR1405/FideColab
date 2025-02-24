import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";
import $ from "jquery";
import "datatables.net-dt/css/jquery.dataTables.css";
import "datatables.net";

const generarContrasena = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let contrasena = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * caracteres.length);
        contrasena += caracteres[randomIndex];
    }
    return contrasena;
};

const AgregarProfesor = () => {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [profesores, setProfesores] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const contrasenaGenerada = generarContrasena();
        try {
            const response = await axios.post("/api/profesores/agregar", { nombre, correo, contrasena: contrasenaGenerada });
            alert(response.data.message);
            setProfesores([...profesores, { nombre, correo, contrasena: contrasenaGenerada }]);
        } catch (error) {
            alert(error.response?.data?.message || "Error al agregar profesor");
        }
    };

    const handleDescargarPDF = () => {
        const doc = new jsPDF();
        doc.text('Lista de Profesores y sus Contraseñas', 10, 10);
        profesores.forEach((profesor, index) => {
            doc.text(`${index + 1}. Nombre: ${profesor.nombre} | Correo: ${profesor.correo} | Contraseña: ${profesor.contrasena}`, 10, 20 + index * 10);
        });
        doc.save('Contraseñas_Profesores.pdf');
    };

    return (
        <div>
            <h3>Agregar Profesor</h3>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                <button type="submit">Agregar Profesor</button>
            </form>
            <button onClick={handleDescargarPDF}>Descargar PDF</button>
        </div>
    );
};

const AdminProfessorCourses = () => {
    useEffect(() => {
        if ($.fn.dataTable.isDataTable("#tableTeachers")) {
            $("#tableTeachers").DataTable().destroy();
        }
        if ($.fn.dataTable.isDataTable("#tableCourses")) {
            $("#tableCourses").DataTable().destroy();
        }

        $("#tableTeachers").DataTable({
            language: {
                processing: "Procesando...",
                lengthMenu: "Mostrar _MENU_ registros",
                zeroRecords: "No se han encontrado registros",
                emptyTable: "No hay datos disponibles en la tabla",
                paginate: { first: "Primero", previous: "Anterior", next: "Siguiente", last: "Último" }
            },
            searching: false,
            info: false
        });

        $("#tableCourses").DataTable({
            language: {
                processing: "Procesando...",
                lengthMenu: "Mostrar _MENU_ registros",
                zeroRecords: "No se han encontrado registros",
                emptyTable: "No hay datos disponibles en la tabla",
                paginate: { first: "Primero", previous: "Anterior", next: "Siguiente", last: "Último" }
            },
            searching: false,
            info: false
        });
    }, []);

    return (
        <LayoutAdmin>
            <section className="add__container">
                <div className="container__title">
                    <h3>Profesores y Cursos</h3>
                </div>
                <AgregarProfesor />
                <div className="container__content">
                    <div className="content__box">
                        <h3>Lista Profesores</h3>
                        <table id="tableTeachers">
                            <thead>
                                <tr>
                                    <th>Codigo</th>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>123</td><td>Ejemplo</td><td>ejemplo@gmail.com</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="content__box">
                        <h3>Lista Cursos</h3>
                        <table id="tableCourses">
                            <thead>
                                <tr>
                                    <th>Codigo</th>
                                    <th>Curso</th>
                                    <th>Grupo</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>456</td><td>Curso 1</td><td>Grupo A</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </LayoutAdmin>
    );
};

export default AdminProfessorCourses;
