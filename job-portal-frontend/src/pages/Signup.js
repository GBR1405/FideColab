import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import UserModel from "../model/userModel";

const apiUrl = process.env.REACT_APP_API_URL;

const SignUp = () => {
  const [formValues, setFormValues] = useState(new UserModel({}));
  const [formErrors, setFormErrors] = useState({});

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formValues.nombre) errors.nombre = "Nombre is required";
    if (!formValues.apellido1) errors.apellido1 = "Apellido1 is required";
    if (!formValues.apellido2) errors.apellido2 = "Apellido2 is required";

    if (!formValues.correo) {
      errors.correo = "Correo is required";
    } else if (!/\S+@\S+\.\S+/.test(formValues.correo)) {
      errors.correo = "Please enter a valid email address";
    }

    if (!formValues.contraseña) errors.contraseña = "Contraseña is required";
    if (!formValues.rolId) errors.rolId = "Rol is required";
    if (!formValues.generoId) errors.generoId = "Genero is required";

    return errors;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await axios.post(`${apiUrl}/auth/register-user`, formValues);
        if (response.data.success) {
          toast.success(response.data.message || "Registration successful!");
          setFormValues(new UserModel({}));
          setFormErrors({});
        } else {
          toast.error(response.data.message || "Registration failed!");
        }
      } catch (error) {
        console.error("Error during registration:", error);
        toast.error(error.response?.data?.message || "Something went wrong. Please try again later.");
      }
    }
  };

  // Actualizar valores del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  return (
    <div className="login-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formValues.nombre}
            onChange={handleInputChange}
            placeholder="Enter your name"
          />
          {formErrors.nombre && <span className="error-message">{formErrors.nombre}</span>}
        </div>

        <div className="form-group">
          <label>Apellido 1</label>
          <input
            type="text"
            name="apellido1"
            value={formValues.apellido1}
            onChange={handleInputChange}
            placeholder="Enter your first last name"
          />
          {formErrors.apellido1 && <span className="error-message">{formErrors.apellido1}</span>}
        </div>

        <div className="form-group">
          <label>Apellido 2</label>
          <input
            type="text"
            name="apellido2"
            value={formValues.apellido2}
            onChange={handleInputChange}
            placeholder="Enter your second last name"
          />
          {formErrors.apellido2 && <span className="error-message">{formErrors.apellido2}</span>}
        </div>

        <div className="form-group">
          <label>Correo</label>
          <input
            type="email"
            name="correo"
            value={formValues.correo}
            onChange={handleInputChange}
            placeholder="Enter your email"
          />
          {formErrors.correo && <span className="error-message">{formErrors.correo}</span>}
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            name="contraseña"
            value={formValues.contraseña}
            onChange={handleInputChange}
            placeholder="Enter your password"
          />
          {formErrors.contraseña && <span className="error-message">{formErrors.contraseña}</span>}
        </div>

        <div className="form-group">
          <label>Rol</label>
          <select name="rolId" value={formValues.rolId} onChange={handleInputChange}>
            <option value="">Select Role</option>
            <option value="1">Estudiante</option>
            <option value="2">Profesor</option>
            <option value="3">Administrador</option>
          </select>
          {formErrors.rolId && <span className="error-message">{formErrors.rolId}</span>}
        </div>

        <div className="form-group">
          <label>Genero</label>
          <select name="generoId" value={formValues.generoId} onChange={handleInputChange}>
            <option value="">Select Gender</option>
            <option value="1">Hombre</option>
            <option value="2">Mujer</option>
            <option value="3">Indefinido</option>
          </select>
          {formErrors.generoId && <span className="error-message">{formErrors.generoId}</span>}
        </div>

        <button type="submit" className="login-btn">Sign Up</button>
      </form>

      <p style={{ textAlign: "center" }}>
        Already have an account?{" "}
        <Link to="/login" className="toggle-link" style={{ color: "#007BFF", textDecoration: "underline" }}>
          Login
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
