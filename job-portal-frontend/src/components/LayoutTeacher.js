import React from "react";
import "../styles/layoutTeacher.css";

const LayoutProfessor = ({ children, userData }) => {
  return (
    <div className="body__professor">
        <header className="header">
            <div className="header__button">
            <button className="button__start" type="submit">Iniciar Juego</button>
            </div>
            <div className="header__profile">
                <img className="profile__img" src="user.png" alt=""/>
                <a className="profile__text">Profesor</a>
            </div>
        </header>
        <nav className="sidebar"> 
            <div className="sidebar__top">
                <div className="top__logo">
                    <img className="logo__img" src="logo.png" alt=""/>
                </div>
                <div className="top__text">
                    <h3 className="logo__title">Institución</h3> 
                </div>       
            </div>
            <ul className="sidebar__list">
                <li className="list__item list__item--active">
                    <a className="item__area" href="#">
                        <i className="fa-solid fa-house"></i>
                        <span className="area__text area__text--active">Inicio</span>
                    </a>
                </li>
                <li className="list__item">
                    <a className="item__area" href="#">
                        <i className="fa-solid fa-pen-to-square"></i>
                        <span className="area__text">Personalizar</span>
                    </a>
                </li> 
                <li className="list__item">
                    <a className="item__area" href="#">
                        <i className="fa-solid fa-user-graduate"></i>
                        <span className="area__text">Estudiantes</span>
                    </a>
                </li>
                <li className="list__item">
                    <a className="item__area" href="#">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                        <span className="area__text">Historial</span>
                    </a>
                </li>
            </ul>
            <div className="sidebar__buttom">       
                <button className="buttom__btn">
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span className="btn__text">Cerrar sesión</span>
                </button>   
            </div>
        </nav>
        <main className="main">
          {children}
        </main>        
    </div>
  );
};

export default LayoutProfessor;