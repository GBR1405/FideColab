import React, { useEffect, useState } from "react";
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";
import axios from "axios";

//  Componente para la tabla de usuarios
const UsuariosTable = ({ usuarios }) => {
  return (
    <div className="data__content">
      <table id="myTable">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Edad</th>
            <th>Correo</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.apellido}</td>
              <td>{usuario.edad}</td>
              <td>{usuario.correo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Botón para agregar usuarios
const AgregarUsuarioButton = ({ onClick }) => {
  return (
    <div className="option__button">
      <button type="button" onClick={onClick}>
        Agregar
      </button>
    </div>
  );
};

// Sección completa de Usuarios
const UsuariosSection = ({ usuarios, onAgregar }) => {
  return (
    <section className="data__container">
      <div className="data__top">
        <h3>Usuarios</h3>
        <AgregarUsuarioButton onClick={onAgregar} />
      </div>
      <UsuariosTable usuarios={usuarios} />
    </section>
  );
};

// Página principal
const UsuariosPage = () => {
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
  }, []);

  const handleAgregarUsuario = () => {
    alert("Abrir modal o formulario para agregar usuario");
  };

  return (
    <LayoutAdmin>
      <UsuariosSection usuarios={usuarios} onAgregar={handleAgregarUsuario} />
    </LayoutAdmin>
  );
};

export default UsuariosPage;
