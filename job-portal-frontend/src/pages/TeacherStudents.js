import React, { useEffect, useState } from "react";
import "../styles/TeacherComponentsComponents.css";
import LayoutTeacher from "../components/LayoutTeacher";
import $ from "jquery";
import "datatables.net-dt/css/jquery.dataTables.css";
import "datatables.net";
import axios from "axios";

const SubirArchivo = () => {
    const [archivo, setArchivo] = useState(null);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("archivo", archivo);

        try {
            const response = await axios.post("/api/profesores/subir", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert(response.data.message);
        } catch (error) {
            alert(error.response?.data?.message || "Error al subir el archivo");
        }
    };

    return (
        <form onSubmit={handleFileUpload}>
            <input type="file" onChange={(e) => setArchivo(e.target.files[0])} required />
            <button type="submit">Subir Archivo</button>
        </form>
    );
};

const AsignarProfesor = () => {
    const [profesores, setProfesores] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [profesorSeleccionado, setProfesorSeleccionado] = useState("");
    const [grupoSeleccionado, setGrupoSeleccionado] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profesoresRes = await axios.get("/api/profesores");
                const gruposRes = await axios.get("/api/grupos");
                setProfesores(profesoresRes.data);
                setGrupos(gruposRes.data);
            } catch (error) {
                alert(error.response?.data?.message || "Error al cargar datos");
            }
        };
        fetchData();
    }, []);

    const handleAsignar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/profesores/asignar", {
                profesorId: profesorSeleccionado,
                grupoId: grupoSeleccionado,
            });
            alert(response.data.message);
        } catch (error) {
            alert(error.response?.data?.message || "Error al asignar profesor");
        }
    };

    return (
        <form onSubmit={handleAsignar}>
            <select onChange={(e) => setProfesorSeleccionado(e.target.value)} required>
                <option value="">Seleccione un Profesor</option>
                {profesores.map((profesor) => (
                    <option key={profesor.id} value={profesor.id}>{profesor.nombre}</option>
                ))}
            </select>
            <select onChange={(e) => setGrupoSeleccionado(e.target.value)} required>
                <option value="">Seleccione un Grupo</option>
                {grupos.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
                ))}
            </select>
            <button type="submit">Asignar Profesor</button>
        </form>
    );
};

const ProfessorStudents = () => {
    useEffect(() => {
        if ($.fn.dataTable.isDataTable("#tableStudents")) {
            $("#tableStudents").DataTable().destroy();
        }
        $("#tableStudents").DataTable();
    }, []);

    return (
        <LayoutTeacher>
            <section className="student__container">
                <div className="container__title">
                    <h3>Estudiantes</h3>
                </div>
                <div className="container__content">
                    <div className="content__box">
                        <h3>Subir Archivo de Profesores</h3>
                        <SubirArchivo />
                    </div>
                    <div className="content__box">
                        <h3>Asignar Profesor a Grupo</h3>
                        <AsignarProfesor />
                    </div>
                    <div className="content__box">
                        <h3>Tabla de Estudiantes</h3>
                        <table id="tableStudents">
                            <thead>
                                <tr>
                                    <th>Codigo</th>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>123456789</td>
                                    <td>Ejemplo</td>
                                    <td>ejemplo@gmail.com</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </LayoutTeacher>
    );
};

export default ProfessorStudents;
