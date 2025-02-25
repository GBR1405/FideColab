import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "../styles/layoutTeacher.css";

// Función para generar contraseñas aleatorias
const generarContrasena = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let contrasena = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * caracteres.length);
        contrasena += caracteres[randomIndex];
    }
    return contrasena;
};

// Componente para agregar un profesor manualmente
const AgregarProfesor = () => {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [profesores, setProfesores] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const contrasenaGenerada = generarContrasena();  // Generar contraseña para el profesor

        try {
            // Enviar los datos al backend para agregar el profesor
            const response = await axios.post("/api/profesores/agregar", { nombre, correo, contrasena: contrasenaGenerada });
            alert(response.data.message); // Mostrar el mensaje del backend

            // Agregar el nuevo profesor a la lista
            setProfesores((prevProfesores) => [
                ...prevProfesores,
                { nombre, correo, contrasena: contrasenaGenerada },
            ]);
        } catch (error) {
            alert(error.response?.data?.message || "Error al agregar profesor");
        }
    };

    const handleDescargarPDF = () => {
        const doc = new jsPDF();
        doc.text('Lista de Profesores y sus Contraseñas', 10, 10);

        // Añadir cada profesor al PDF
        profesores.forEach((profesor, index) => {
            doc.text(`${index + 1}. Nombre: ${profesor.nombre} | Correo: ${profesor.correo} | Contraseña: ${profesor.contrasena}`, 10, 20 + index * 10);
        });

        // Descargar el archivo PDF
        doc.save('Contraseñas_Profesores.pdf');
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Correo"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                />
                <button type="submit">Agregar Profesor</button>
            </form>

            {profesores.length > 0 && (
                <div>
                    <h3>Profesores Agregados:</h3>
                    <ul>
                        {profesores.map((profesor, index) => (
                            <li key={index}>
                                {profesor.nombre} - {profesor.correo} - {profesor.contrasena}
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleDescargarPDF}>Generar PDF con Contraseñas</button>
                </div>
            )}
        </div>
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
            // Enviar el archivo al backend para procesarlo
            const response = await axios.post("/api/profesores/subir", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert(response.data.message); // Mostrar el mensaje del backend
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

// Componente para asignar un profesor a un grupo
const AsignarProfesor = () => {
    const [profesores, setProfesores] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [profesorSeleccionado, setProfesorSeleccionado] = useState("");
    const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener la lista de profesores y grupos del backend
                const profesoresRes = await axios.get("/api/profesores");
                const gruposRes = await axios.get("/api/grupos");
                setProfesores(profesoresRes.data);
                setGrupos(gruposRes.data);
                setLoading(false);
            } catch (error) {
                alert(error.response?.data?.message || "Error al cargar datos");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAsignar = async (e) => {
        e.preventDefault();
        try {
            // Enviar la asignación del profesor al grupo al backend
            const response = await axios.post("/api/profesores/asignar", {
                profesorId: profesorSeleccionado,
                grupoId: grupoSeleccionado,
            });
            alert(response.data.message); // Mostrar el mensaje del backend
        } catch (error) {
            alert(error.response?.data?.message || "Error al asignar profesor");
        }
    };

    return (
        <form onSubmit={handleAsignar}>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <>
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
                </>
            )}
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
