import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/animationRecharge.css";
import "../styles/layoutAdmin.css";

const LayoutHelp = ({ children, userData }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Función para verificar si la ruta actual coincide con el enlace
  const isActive = (path) => location.pathname === path;

  // Manejo de cierre de sesión
  const handleLogout = () => {
    document.cookie = 'IFUser_Token=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = 'IFUser_Info=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';  // Limpiar la cookie de usuario también
    navigate('/login');
  };

  return (
    <div className="body__admin">
      <header className="header">
        <div className="header__title">
          <h1 className="title__text">Modo Administración - Fidecolab</h1>
        </div>
      </header>
      <nav className="sidebar">
        <div className="sidebar__top">
          <div className="top__logo">
            <img className="logo__img" src="https://i.postimg.cc/NGzXwBp6/logo.png" alt="" />
          </div>
          <div className="top__text">
            <h3 className="logo__title">FideColab</h3>
            <span className="logo__text">Administrador</span>
          </div>
        </div>
        <ul className="sidebar__list">
          <li className={`list__item ${isActive("/admin") ? "list__item--active" : ""}`}>
            <a className="item__area" href="/admin">
              <i className="fa-solid fa-house"></i>
              <span className="area__text">Inicio</span>
            </a>
          </li>
          <li className={`list__item ${isActive("/admin/personalize_editor") ? "list__item--active" : ""}`}>
            <a className="item__area" href="/admin/personalize_editor">
                <i className="fa-solid fa-pencil-alt"></i> {/* Icono de lápiz */}
                <span className="area__text">Personalización</span>
            </a>
          </li>
          <li className={`list__item ${isActive("/admin/cursos") ? "list__item--active" : ""}`}>
            <a className="item__area" href="/admin/cursos">
                <i className="fa-solid fa-school"></i> {/* Icono de escuela */}
                <span className="area__text">Cursos y Profesores</span>
            </a>
        </li>
        <li className={`list__item ${isActive("/admin/reports") ? "list__item--active" : ""}`}>
            <a className="item__area" href="/admin/reports">
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span className="area__text">Reportes Generales</span>
            </a>
          </li>
          <li className={`list__item ${isActive("/admin/depuration") ? "list__item--active" : ""}`}>
            <a className="item__area" href="/admin/depuration">
              <i className="fa-solid fa-circle-question"></i>
              <span className="area__text">Monitoreo y Gestión</span>
            </a>
          </li>
              
          
          
        </ul>
        <div className="sidebar__buttom">
          <button className="buttom__btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="btn__text">Cerrar sesión</span>
          </button>
        </div>
      </nav>
      <main className="main">{children}</main>
    </div>
  );
};

export default LayoutHelp;
