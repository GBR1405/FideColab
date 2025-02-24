import React, { useEffect, useState } from "react";
import "../styles/TeacherComponentsComponents.css";
import LayoutTeacher from "../components/LayoutTeacher";
import $ from "jquery";
import "datatables.net-dt/css/jquery.dataTables.css";
import "datatables.net";
import axios from "axios";

// Componente para subir archivos
const SubirArchivo = () => {
    const [archivo, setArchivo] = useState(null);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("archivo", archivo);

        try {
            const response = await axios.post("/api/usuarios/subir", formData, {
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

// Componente para asignar usuario a grupo
const AsignarUsuario = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
    const [grupoSeleccionado, setGrupoSeleccionado] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usuariosRes = await axios.get("/api/usuarios");
                const gruposRes = await axios.get("/api/grupos");
                setUsuarios(usuariosRes.data);
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
            const response = await axios.post("/api/usuarios/asignar", {
                usuarioId: usuarioSeleccionado,
                grupoId: grupoSeleccionado,
            });
            alert(response.data.message);
        } catch (error) {
            alert(error.response?.data?.message || "Error al asignar usuario");
        }
    };

    return (
        <form onSubmit={handleAsignar}>
            <select onChange={(e) => setUsuarioSeleccionado(e.target.value)} required>
                <option value="">Seleccione un Usuario</option>
                {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
                ))}
            </select>
            <select onChange={(e) => setGrupoSeleccionado(e.target.value)} required>
                <option value="">Seleccione un Grupo</option>
                {grupos.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
                ))}
            </select>
            <button type="submit">Asignar Usuario</button>
        </form>
    );
};

// Componente principal para mostrar usuarios
const UsuariosLista = () => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await axios.get("/api/usuarios");
                setUsuarios(response.data);
            } catch (error) {
                alert(error.response?.data?.message || "Error al cargar usuarios");
            }
        };

        fetchUsuarios();

        if ($.fn.dataTable.isDataTable("#tableUsuarios")) {
            $("#tableUsuarios").DataTable().destroy();
        }
        $("#tableUsuarios").DataTable();
    }, []);

    return (
        <LayoutTeacher>
            <section className="user__container">
                <div className="container__title">
                    <h3>Usuarios</h3>
                </div>
                <div className="container__content">
                    <div className="content__box">
                        <h3>Subir Archivo de Usuarios</h3>
                        <SubirArchivo />
                    </div>
                    <div className="content__box">
                        <h3>Asignar Usuario a Grupo</h3>
                        <AsignarUsuario />
                    </div>
                    <div className="content__box">
                        <h3>Lista de Usuarios</h3>
                        <table id="tableUsuarios">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.id}</td>
                                        <td>{usuario.nombre}</td>
                                        <td>{usuario.correo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </LayoutTeacher>
    );
};

export default UsuariosLista;
