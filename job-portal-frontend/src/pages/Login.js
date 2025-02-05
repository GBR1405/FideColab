import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { toast } from "react-toastify";
import '../styles/login.css';




const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!correo) {
      errors.correo = "Correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      errors.correo = "Por favor ingresa un correo válido";
    }
    if (!contraseña) {
      errors.contraseña = "Contraseña es obligatoria";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        correo,
        contraseña,
      });

      if (response.data.success) {
        toast.success("Inicio de sesión exitoso!");
        const token = response.data.token;
        sessionStorage.setItem("authToken", token);
        navigate("/homeScreen");
      } else {
        toast.error(response.data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      toast.error(error.response?.data?.message || "Algo salió mal. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <>
      <header className="header">
        <img className="header__img" src="../image/logo.png" alt="Logo" />
        <span className="header__text">Institución</span>
      </header>
      <main className="main">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="correo">Correo:</label>
            <input
              type="email"
              id="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="form-control"
            />
            {errors.correo && <span className="error-text">{errors.correo}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="contraseña">Contraseña:</label>
            <input
              type="password"
              id="contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="form-control"
            />
            {errors.contraseña && <span className="error-text">{errors.contraseña}</span>}
          </div>
          <button type="submit" className="login-button">Iniciar sesión</button>
        </form>
      </main>
      <aside className="aside">
        <article className="aside__article">
          <span className="article__quote">“</span>
          <span className="article__text">
            El éxito del equipo radica en la colaboración, no en la competencia
          </span>
          <span className="article__author">— Anónimo</span>
          <img className="article__img" src="../image/vector.svg" alt="Imagen ilustrativa" />
        </article>
      </aside>
      <script src="https://kit.fontawesome.com/fa4744a987.js" crossorigin="anonymous"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet"
      />
    </>
  );
};

export default Login;
