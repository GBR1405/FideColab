import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/login.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const apiUrl = 'https://backend-fidecolab.onrender.com/api';
const secretKey = process.env.REACT_APP_SECRET_KEY;

const frases = [
  "El éxito del equipo radica en la colaboración, no en la competencia",
  "Juntos alcanzamos más lejos que cualquier individuo solo",
  "La innovación florece cuando las mentes colaboran"
];

const autores = [
  "— Anónimo",
  "— Proverbio africano",
  "— Margaret Mead"
];

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [fraseIndex, setFraseIndex] = useState(0);
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlurred(true);
      setTimeout(() => {
        setFraseIndex((prevIndex) => (prevIndex + 1) % frases.length);
        setIsBlurred(false);
      }, 500); // Tiempo del desenfoque antes del cambio
    }, 10000); // Cambia cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!correo) {
      errors.correo = "Correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      errors.correo = "Por favor ingresa un correo válido";
    }
    if (!contraseña) {
      errors.contraseña = "Contraseña es obligatoria";
    } else if (contraseña.length < 8) {
      errors.contraseña = "La contraseña debe tener al menos 8 caracteres";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      for (let field in validationErrors) {
        toast.error(validationErrors[field]);
      }
      return;
    }

    setLoading(true);
  
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, {
        correo,
        contraseña,
      });
  
      if (response.data.success) {
        toast.success("Inicio de sesión exitoso!");
  
        const { user, token } = response.data;
        const encryptedUser = CryptoJS.AES.encrypt(JSON.stringify(user), secretKey).toString();
        const now = new Date();
        const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        localStorage.setItem('userId', user.id);
  
        Cookies.set("authToken", token, {
          expires: expires,
          secure: true,
          sameSite: "None"
        });

        Cookies.set("IFUser_Info", encryptedUser, {
          expires: expires,
          secure: true,
          sameSite: "None"
        });
  
        if (user.rol === "Administrador") {
          navigate("/admin");
        } else {
          navigate("/homeScreen");
        }
      } else {
        toast.error(response.data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      toast.error(error.response?.data?.message || "Algo salió mal. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="body-login">
      <header className="header-login">
        <img className="header__img-login" src="logo.png" alt="Logo" />
        <span className="header__text-login">FideColab</span>
      </header>
      <main className="main-login">
        <div>
          <form onSubmit={handleSubmit}>
            <div className="form__heading-login">
              <h2 className="heading__title-login">Accede a tu cuenta</h2>
              <span className="heading__text-login">
                Accede con el usuario que te dio el profesor
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
              <div className="input__wrapper-login">
                <input
                  className="input__shape-login"
                  type={mostrarContraseña ? "text" : "password"}
                  id="contraseña"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  placeholder="Contraseña"
                />
                <span
                  className="eye-icon"
                  onClick={() => setMostrarContraseña(!mostrarContraseña)}
                >
                  <FontAwesomeIcon icon={mostrarContraseña ? faEye :  faEyeSlash} />
                </span>
              </div>
            </div>

            <div className="form__button-login">
              <button
                className="button__shape-login"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="loader_login"></div>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </div>
            <div className="form__link-login">
              <a className="link__text-login" href="/forgot-password">
                ¿Contraseña olvidada?
              </a>
            </div>
            <div className="form__link-login">
              <a className="link__text-login" href="/test-view">
                ¿No eres estudiante? Echa un vistazo a la página!
              </a>
            </div>
          </form>
        </div>
      </main>
      <aside className="aside-login">
        <article className="aside__article-login">
          <img className="article__quote-login" src="quote.svg" alt="Cita" />
          <span className={`article__text-login ${isBlurred ? 'blurred' : ''}`}>
            {frases[fraseIndex]}
          </span>
          <span className={`article__author-login ${isBlurred ? 'blurred' : ''}`}>
            {autores[fraseIndex]}
          </span>
          <img className="article__square-login" src="vector.svg" alt="Vector" />
        </article>
      </aside>
    </div>
  );
};

export default Login;