import React, {useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/layout.css';
import "../styles/animationRecharge.css";

const Layout = ({ children }) => {
  const [userData] = useState(null);
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/login');
  };

  // Definimos los estilos dentro del componente

  return (
    <div className="default__body">
      <header className="header">
      </header>

      <nav className="sidebar">
        <div className="sidebar__top">
          <div className="sidebar__logo">
              <img className="logo__img" src="https://i.postimg.cc/NGzXwBp6/logo.png" alt="" />
              <span className="logo__text" onClick={() => navigate('/homeScreen')} style={{ cursor: 'pointer' }}>FideColab</span>
          </div>
        </div>

        <ul className="sidebar__list">
          <li className="list__item list__item--active">
            <a className="item__area" href="/">
              <i className="fa-solid fa-house"></i>
              <span className="area__text area__text--active">Inicio</span>
            </a>
          </li>

          {/* Opciones para Estudiantes */}
          {userData?.rol === 'Estudiante' && (
            <>
              <li className="list__item">
                <a className="item__area" href="/">
                  <i className="fa-solid fa-flag"></i>
                  <span className="area__text">Simulaciones</span>
                </a>
              </li>
              <li className="list__item">
                <a className="item__area" href="/">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  <span className="area__text">Historial</span>
                </a>
              </li>
            </>
          )}
        </ul>

        <div className="sidebar__buttom">
          <button className="buttom__btn" onClick={handleRedirect}>
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="btn__text">Regresar</span>
          </button>
        </div>
      </nav>
      <main className="main">
        {children}
        <a className="main__float" href='/help'>
          <i class="fa-solid fa-question"></i>
        </a>
      </main>
      <script src="https://kit.fontawesome.com/fa4744a987.js" crossOrigin="anonymous"></script>
      <script type="text/javascript" src="js/app.js" defer></script>
    </div>
  );
};

export default Layout;
