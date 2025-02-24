import React from 'react';
import "../styles/TeacherComponents.css";
import LayoutTeacher from "../components/LayoutTeacher";

const ProfessorProfile = () => {
  return (
    <>
      <LayoutTeacher>
      
        <section className="Teacher__container">
            <div className="container__top">
                <div className="top__image">
                    <img className="image__user" src="user.png" alt="" />
                </div>
                <div className="top__info">
                    <div className="info__box">
                        <h1 className="info__title">Mario Quirós</h1>
                        <span>Profesor</span>
                    </div>
                    <div className="info__stats">
                        <div className="stats__group">
                            <div className="stats__icon">
                                <i className="fa-solid fa-flag"></i>
                            </div>
                            <div className="stats__text">
                                <h3>27</h3>
                                <span>Partidas</span>
                            </div>
                        </div>
                        <div className="stats__group">
                            <div className="stats__icon">
                                <i className="fa-solid fa-clock"></i>
                            </div>
                            <div className="stats__text">
                                <h3>3</h3>
                                <span>Personalizaciones</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container__bottom">
                <div className="container__heading">
                    <h3>Simulaciones recientes</h3>
                    <a className="bottom__text" href="#">Ver historial completo</a>
                </div>
                <div className="bottom__content">
                    <span className="bottom__text">¡Todavia no has hecho una simulación!</span>
                </div>
            </div>
        </section>
      </LayoutTeacher>
    </>
  );
};

export default ProfessorProfile;