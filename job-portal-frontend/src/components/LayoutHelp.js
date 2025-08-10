import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/help.css";

const LayoutHelp = ({ children, userData }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtiene la URL actual

  return (
    <div className="help__body">
      <nav className="help__sidebar">
        <div className="sidebar__logo">
            <img className="logo__img" src="https://i.postimg.cc/NGzXwBp6/logo.png" alt="" />
            <span className="logo__text" onClick={() => navigate('/homeScreen')} style={{ cursor: 'pointer' }}>FideColab</span>
        </div>
        <ul className="sidebar__list">
          <li className={`list__item ${location.pathname === "/help" ? "list__item--active" : ""}`}>
            <a className="item__area" href="/help">
              <i className="fa-solid fa-circle-question"></i>
              <span className="area__text">Centro de ayuda</span>
            </a>
          </li>
          <li className={`list__item ${location.pathname === "/help/manual" ? "list__item--active" : ""}`}>
            <a className="item__area" href="/help/manual">
              <i className="fa-solid fa-book"></i>
              <span className="area__text">Manual de Usuario</span>
            </a>
          </li>
          <li className={`list__item ${location.pathname === "/help/tutorial" ? "list__item--active" : ""}`}>
            <a className="item__area" href="/help/tutorial">
              <i className="fa-solid fa-square-poll-vertical"></i>
              <span className="area__text">Tutorial</span>
            </a>
          </li>
          <li className={`list__item ${location.pathname === "/help/preguntasfrecuentes" ? "list__item--active" : ""}`}>
            <a className="item__area" href="/help/preguntasfrecuentes">
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span className="area__text">Preguntas Frecuentes</span>
            </a>
          </li>
        </ul>
        <div className="sidebar__bottom">
          <button className="return__btn" onClick={() => navigate('/homeScreen')}>
            <i className="fa-solid fa-square-caret-left"></i>
            <span className="btn__text">Volver</span>
          </button>
        </div>
      </nav>
      <main className="help__main">
        {children}
      </main>
    </div>
  );
};

export default LayoutHelp;
