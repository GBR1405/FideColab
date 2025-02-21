import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import '../styles/layout.css';
import "../styles/animationRecharge.css";

// Función para obtener el valor de una cookie por su nombre
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const Layout = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Clave de desencriptado obtenida desde el archivo .env
  const decryptionKey = process.env.REACT_APP_SECRET_KEY;

  // Cargar userData desde la cookie al montar el componente
  useEffect(() => {
    const token = getCookie('IFUser_Info');

    if (token) {
      try {
        // Desencriptar la cookie
        const bytes = CryptoJS.AES.decrypt(token, decryptionKey);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        if (decryptedData) {
          const parsedToken = JSON.parse(decryptedData);

          const fullName = `${parsedToken.nombre} ${parsedToken.apellido1} ${parsedToken.apellido2}`;
          setUserData({
            nombreCompleto: fullName,
            rol: parsedToken.rol
          });
        }
      } catch (error) {
        console.error('Error al desencriptar o parsear la cookie:', error);
      }
    }
    setLoading(false);
  }, []);

  // Función para generar un ícono con las primeras dos letras del nombre
  const getUserIcon = (name) => {
    if (!name) return 'NA';
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
    document.cookie = 'IFUser_Token=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = 'IFUser_Info=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';  // Limpiar la cookie de usuario también
    navigate('/login');
  };

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  // Generar el ícono usando las primeras dos letras del nombre
  const userIcon = userData?.nombreCompleto ? getUserIcon(userData.nombreCompleto) : 'NA';
  const iconColor = getRandomColor();

  return (
    <div className="body">
      <header className="header">
        <div className="header__title header__title--none">
          <h1 className="title__text" onClick={() => navigate('/userhome')}>FideColab</h1>
        </div>
        <div className="header__profile">
          <div 
            className="profile__img-label" 
            style={{ backgroundColor: iconColor }}
            onClick={() => navigate('/profile')}
          >
            {userIcon}
          </div>
          <a className="profile__text" onClick={() => navigate('/profile')}>
            {userData?.nombreCompleto || 'Cargando...'}
          </a>
        </div>
      </header>

      <nav className="sidebar">
        <div className="sidebar__top">
          <div className="top__logo">
            <img className="logo__img" src="logo.png" alt="" />
            <span className="logo__text" onClick={() => navigate('/homeScreen')}>FideColab</span>
          </div>
          <div className="top__close">
            <button className="close__btn">
              <i className="fa-solid fa-angles-left"></i>
            </button>
          </div>
        </div>

        <ul className="sidebar__list">
          <li className="list__item list__item--active">
            <a className="item__area" href="#">
              <i className="fa-solid fa-house"></i>
              <span className="area__text area__text--active">Inicio</span>
            </a>
          </li>

          {/* Opciones para Estudiantes */}
          {userData?.rol === 'Estudiante' && (
            <>
              <li className="list__item">
                <a className="item__area" href="#">
                  <i className="fa-solid fa-flag"></i>
                  <span className="area__text">Simulaciones</span>
                </a>
              </li>
              <li className="list__item">
                <a className="item__area" href="#">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  <span className="area__text">Historial</span>
                </a>
              </li>
            </>
          )}

          {/* Opciones para Profesores */}
          {userData?.rol === 'Profesor' && (
            <>
              <li className="list__item">
                <a className="item__area" href="#">
                  <i className="fa-solid fa-users"></i>
                  <span className="area__text">Estudiantes</span>
                </a>
              </li>
              <li className="list__item">
                <a className="item__area" href="#">
                  <i className="fa-solid fa-play-circle"></i>
                  <span className="area__text">Empezar Simulación</span>
                </a>
              </li>
              <li className="list__item">
                <a className="item__area" href="#">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  <span className="area__text">Historial Profesor</span>
                </a>
              </li>
            </>
          )}
        </ul>

        <div className="sidebar__buttom">
          <img 
            className="buttom__img" 
            src="help.png" 
            alt="Ayuda" 
            onClick={() => navigate('/help')} 
            style={{ cursor: 'pointer' }} 
          />
          <button className="buttom__btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="btn__text">Cerrar sesión</span>
          </button>
        </div>
      </nav>

      <main className="main">
        {children}
      </main>

      <script src="https://kit.fontawesome.com/fa4744a987.js" crossOrigin="anonymous"></script>
      <script type="text/javascript" src="js/app.js" defer></script>
    </div>
  );
};

export default Layout;
