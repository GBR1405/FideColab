import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/help.css";

const LayoutHelp = ({ children, userData }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtiene la URL actual

  return (
    <div className="body-help">
      <header className="header-help">
        <div className="header__title-help header__title--none-help">
          <h1 className="title__text-help" onClick={() => navigate('/userhome')}>FideColab</h1>
        </div>
      </header>

      <nav className="sidebar-help">
        <div className="sidebar__top-help">
          <div className="top__logo-help">
            <img className="logo__img-help" src="https://i.postimg.cc/NGzXwBp6/logo.png" alt="" />
            <span className="logo__text-help">FideColab</span>
          </div>

          <div className="top__close-help">
            <button className="close__btn-help">
              <i className="fa-solid fa-angles-left"></i>
            </button>
          </div>
        </div>

        <ul className="sidebar__list-help">
          <li className={`list__item-help ${location.pathname === "/help" ? "list__item--active-help" : ""}`}>
            <a className="item__area-help" href="/help">
              <i className="fa-solid fa-circle-question"></i>
              <span className="area__text-help">Centro de ayuda</span>
            </a>
          </li>
          <li className={`list__item-help ${location.pathname === "/help/manual" ? "list__item--active-help" : ""}`}>
            <a className="item__area-help" href="/help/manual">
              <i className="fa-solid fa-book"></i>
              <span className="area__text-help">Manual de Usuario</span>
            </a>
          </li>
          <li className={`list__item-help ${location.pathname === "/help/tutorial" ? "list__item--active-help" : ""}`}>
            <a className="item__area-help" href="/help/tutorial">
              <i className="fa-solid fa-square-poll-vertical"></i>
              <span className="area__text-help">Tutorial</span>
            </a>
          </li>
          <li className={`list__item-help ${location.pathname === "/help/preguntasfrecuentes" ? "list__item--active-help" : ""}`}>
            <a className="item__area-help" href="/help/preguntasfrecuentes">
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span className="area__text-help">Preguntas Frecuentes</span>
            </a>
          </li>
        </ul>

        <div className="sidebar__return-help">
          <button className="return__btn-help" onClick={() => navigate('/homeScreen')}>
            <i className="fa-solid fa-square-caret-left"></i>
            <span className="btn__text-help">Volver</span>
          </button>
        </div>
      </nav>

      <main className="main-help">
        {children}
      </main>
    </div>
  );
};

export default LayoutHelp;
