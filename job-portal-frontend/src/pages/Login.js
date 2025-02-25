import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/login.css";


const apiUrl = process.env.REACT_APP_API_URL;

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [setErrors] = useState({});
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
      const response = await axios.post(`${apiUrl}/auth/login`, {
        correo,
        contraseña,
    });    
    

      if (response.data.success) {
        toast.success("Inicio de sesión exitoso!");
        const token = response.data.token;
        Cookies.set("authToken", token, { expires: 1 });
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
      <div className="body-login">
        <header className="header-login">
          <img className="header__img-login" src="logo.png" alt="" />
          <span className="header__text-login">FideColab</span>
        </header>
        <main className="main-login">
          <div>
            <form onSubmit={handleSubmit}>
              <div className="form__heading-login">
                <h2 className="heading__title-login">Accede a tu cuenta</h2>
                <span className="heading__text-login">
                  Acceda con el usuario que te dio el profesor
                </span>
              </div>
              <div className="form__input-login">
                <label className="input__label-login" htmlFor="correo">
                  Correo
                </label>
                <input
                  className="input__shape-login"
                  type="email"
                  id="correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Ingresa el correo"
                />
              </div>
              <div className="form__input-login">
                <label className="input__label-login" htmlFor="contraseña">
                  Contraseña
                </label>
                <input
                  className="input__shape-login"
                  type="password"
                  id="contraseña"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  placeholder="Contraseña"
                />
              </div>
              <div className="form__check-login">
                <input className="check__box-login" type="checkbox" id="rememberMe" />
                <label className="check__text-login" htmlFor="rememberMe">
                  Recuerda mi contraseña
                </label>
              </div>
              <div className="form__button-login">
                <button className="button__shape-login" type="submit">
                  Iniciar sesión
                </button>
              </div>
              <div className="form__link-login">
                <a className="link__text-login" href="/forgot-password">
                  ¿Contraseña olvidada?
                </a>
              </div>
              <div className="form__link-login">
                <a className="link__text-login" href="/test-view">
                ¿No eres estudiante? Echa un vistazo a la pagina!
                </a>
              </div>
            </form>
          </div>
        </main>
        <aside className="aside-login">
          <article className="aside__article-login">
            <img className="article__quote-login" src="quote.svg" alt="" />
            <span className="article__text-login">
              El éxito del equipo radica en la colaboración, no en la competencia
            </span>
            <span className="article__author-login">— Anónimo</span>
            <img className="article__square-login" src="vector.svg" alt="" />
          </article>
        </aside>
        <script
          src="https://kit.fontawesome.com/fa4744a987.js"
          crossOrigin="anonymous"
        ></script>
      </div>
    </>
);

};

export default Login;
