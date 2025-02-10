import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/login.css";

const apiUrl = process.env.REACT_APP_API_URL;

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Mostrar el SweetAlert antes de enviar el correo
      Swal.fire({
        title: 'Enviando correo...',
        text: 'Por favor espera mientras enviamos el correo de recuperación.',
        icon: 'info',
        allowOutsideClick: false, // Evitar que el usuario cierre el modal
        didOpen: () => {
          Swal.showLoading(); // Muestra el indicador de carga
        }
      });
  
      try {
        await axios.post(`${apiUrl}/auth/forgot-password`, { email });
        Swal.fire({
          title: 'Correo enviado',
          text: 'Revisa tu bandeja de entrada para continuar con la recuperación de tu contraseña.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        navigate("/login");
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || "Error al enviar el correo.",
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
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
          <div className="login-right-login">
            <form onSubmit={handleSubmit} className="login-form-login">
              <div className="form__heading-login">
                <h2 className="heading__title-login">Recuperar la contraseña</h2>
                <span className="heading__text-login">Ingresa el correo para enviar un mensaje de recuperación</span>
              </div>  
              <div className="form__input-login">
                <label className="input__label-login" htmlFor="correo">Correo Electronico</label>
                <input 
                  className="input__shape-login" 
                  type="email" 
                  id="correo" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Ingresa el correo Electronico" 
                />
              </div>
              <div className="form__button-login">
                <button className="button__shape-login" type="submit">Enviar correo</button>
              </div>
              <div className="form__link-login">
                <a className="link__text-login" href="/login">Volver</a>
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
        <script src="https://kit.fontawesome.com/fa4744a987.js" crossOrigin="anonymous"></script>
      </div>
      </>
    );
  }
