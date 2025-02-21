import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/teacher.css";

// Componente para agregar un profesor manualmente
const AgregarProfesor = () => {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/profesores/agregar", { nombre, correo });
            alert(response.data.message);
        } catch (error) {
            alert("Error al agregar profesor");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            <button type="submit">Agregar Profesor</button>
        </form>
    );
};

// Componente para subir un archivo de profesores
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
            alert("Error al subir el archivo");
        }
    };

    return (
        <form onSubmit={handleFileUpload}>
            <input type="file" onChange={(e) => setArchivo(e.target.files[0])} required />
            <button type="submit">Subir Archivo</button>
        </form>
    );
};

// Componente para asignar un profesor a un grupo
const AsignarProfesor = () => {
    const [profesores, setProfesores] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [profesorSeleccionado, setProfesorSeleccionado] = useState("");
    const [grupoSeleccionado, setGrupoSeleccionado] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const profesoresRes = await axios.get("/api/profesores");
            const gruposRes = await axios.get("/api/grupos");
            setProfesores(profesoresRes.data);
            setGrupos(gruposRes.data);
        };
        fetchData();
    }, []);

    const handleAsignar = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/profesores/asignar", { profesorId: profesorSeleccionado, grupoId: grupoSeleccionado });
            alert(response.data.message);
        } catch (error) {
            alert("Error al asignar profesor");
        }
    };

    return (
        <form onSubmit={handleAsignar}>
            <select value={profesorSeleccionado} onChange={(e) => setProfesorSeleccionado(e.target.value)} required>
                <option value="">Seleccione un profesor</option>
                {profesores.map((prof) => (
                    <option key={prof.id} value={prof.id}>{prof.nombre}</option>
                ))}
            </select>
            <select value={grupoSeleccionado} onChange={(e) => setGrupoSeleccionado(e.target.value)} required>
                <option value="">Seleccione un grupo</option>
                {grupos.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
                ))}
            </select>
            <button type="submit">Asignar Profesor</button>
        </form>
    );
};

const Teacher = () => {
    return (
        <div>
            <h1>Gestión de Profesores</h1>
            <AgregarProfesor />
            <SubirArchivo />
            <AsignarProfesor />
        </div>
    );
};

export default Teacher;

