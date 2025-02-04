import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import "../styles/helpmanual.css";

// Función para obtener el valor de una cookie por su nombre
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const HelpManual = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para controlar la carga de datos
  const navigate = useNavigate(); // Usar useNavigate en lugar de useHistory

  // Cargar userData desde la cookie cuando el componente se monta
  useEffect(() => {
    const cookieData = getCookie('userData');
    if (cookieData) {
      console.log("Cookie encontrada:", cookieData);
      setUserData(JSON.parse(cookieData));
    }
    setLoading(false); // Al terminar de cargar, setear loading a false
  }, []);

  // Función para generar un ícono con las primeras dos letras del nombre
  const getUserIcon = (name) => {
    if (!name) return 'NA'; // Si no hay nombre, se coloca "NA"
    const initials = name.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
    return initials;
  };

  // Función para generar un color aleatorio para el fondo
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    document.cookie = 'authToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = 'userData=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'; // Borrar la cookie de userData
    navigate('/login'); // Usar navigate para redirigir a /login
  };

  // Mientras los datos se están cargando, mostrar un loader o spinner
  if (loading) {
    return (
      <div className="loading-screen">Cargando...</div>
    );
  }

  // Generar el ícono usando las primeras dos letras del nombre
  const userIcon = userData && userData.userData && userData.userData.name
    ? getUserIcon(userData.userData.name)
    : 'NA';  // Si no hay nombre, se utiliza 'NA'

  const iconColor = getRandomColor(); // Obtener un color aleatorio para el ícono

  return (
    <div className="body">
      <header className="header">
        <div className="header__title header__title--none">
          <h1 className="title__text" onClick={() => navigate('/userhome')}>FideColab</h1> {/* Redirige a /userhome */}
        </div>
        <div className="header__profile">
          {/* Ícono generado a partir del nombre */}
          <div 
            className="profile__img-label" 
            style={{ backgroundColor: iconColor }} // Color de fondo aleatorio
            onClick={() => navigate('/profile')} // Redirige a /profile al hacer clic en el ícono
          >
            {userIcon}
          </div>
          <a 
            className="profile__text"
            onClick={() => navigate('/profile')} // Redirige a /profile al hacer clic en el nombre
          >
            {userData ? userData.userData.name : 'Cargando...'}
          </a>
        </div>
      </header>

      <nav className="sidebar">
        <div className="sidebar__top">
          <div className="top__logo">
            <img className="logo__img" src="logo.png" alt="" />
            <span className="logo__text">Institución</span>
          </div>

          <div className="top__close">
            <button className="close__btn">
              <i className="fa-solid fa-angles-left"></i>
            </button>
          </div>
        </div>

        <ul className="sidebar__list">
          <li className="list__item">
            <a className="item__area" href="index.html">
              <i className="fa-solid fa-circle-question"></i>
              <span className="area__text">Centro de ayuda</span>
            </a>
          </li>
          <li className="list__item list__item--active">
            <a className="item__area" href="helpmanual.html">
              <i className="fa-solid fa-book"></i>
              <span className="area__text area__text--active">Manual de Usuario</span>
            </a>
          </li>
          <li className="list__item">
            <a className="item__area" href="calendar.html">
              <i className="fa-solid fa-square-poll-vertical"></i>
              <span className="area__text">Tutorial</span>
            </a>
          </li>
          <li className="list__item">
            <a className="item__area" href="calendar.html">
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span className="area__text">Preguntas frecuentes</span>
            </a>
          </li>
        </ul>

        <div className="sidebar__return">
          <button className="return__btn" onClick={() => navigate('/homeScreen')}>
            <i className="fa-solid fa-square-caret-left"></i>
            <span className="btn__text">Volver</span>
          </button>
        </div>
      </nav>

      <main className="main">
        <section className="main__container">
          <div className="container__navegation">
            <a className="navegation__text" href="#">
              Centro de Ayuda
            </a>
            <a className="navegation__text navegation__text--active" href="#">
              /Manual de Usuario
            </a>
          </div>

          <div className="container__content">
            <h2>Manual de Usuario</h2>
            <p className="content__text">
              Aquí podrás encontrar la guía completa de cómo utilizar el sistema FideColab.
            </p>

            {/* Sección de Preguntas Frecuentes (FAQ) */}
            <div className="faq__section">
              <h3>Preguntas Frecuentes</h3>

              <div className="faq__item">
                <button className="faq__question">
                  ¿Cómo me registro en el sistema?
                </button>
                <div className="faq__answer">
                  <p>Para registrarte, solo debes completar el formulario de registro en la página principal con tus datos básicos como nombre, correo y contraseña.</p>
                </div>
              </div>

              <div className="faq__item">
                <button className="faq__question">
                  ¿Olvidé mi contraseña, qué debo hacer?
                </button>
                <div className="faq__answer">
                  <p>Si olvidaste tu contraseña, puedes hacer clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión y seguir las instrucciones para restablecerla.</p>
                </div>
              </div>

              <div className="faq__item">
                <button className="faq__question">
                  ¿Puedo cambiar mi nombre de usuario?
                </button>
                <div className="faq__answer">
                  <p>No es posible cambiar tu nombre de usuario una vez registrado. Sin embargo, puedes actualizar tu información personal desde la configuración de tu cuenta.</p>
                </div>
              </div>

              {/* Más preguntas pueden ser agregadas de la misma manera */}
            </div>

          </div>
        </section>
      </main>

      <script src="https://kit.fontawesome.com/fa4744a987.js" crossOrigin="anonymous"></script>
    </div>
  );
}

export default HelpManual;
