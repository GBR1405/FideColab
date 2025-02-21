import React from 'react';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";

const AdminDashboard = () => {
  return (
    <>
      <LayoutAdmin>
        <section className="main__container">
            <div className="container__top">
                <div className="top__box">
                    <div className="box__img">
                        <i className="fa-solid fa-puzzle-piece"></i>
                    </div>
                    <div className="box__text">
                        <p className="box__name">Partidas jugadas</p>
                        <p className="box__number">0</p>
                    </div>
                </div>
                <div className="top__box">
                    <div className="box__img">
                        <i className="fa-solid fa-user-graduate"></i>
                    </div>
                    <div className="box__text">
                        <p className="box__name">Estudiantes</p>
                        <p className="box__number">0</p>
                    </div>
                </div>
                <div className="top__box">
                    <div className="box__img">
                        <i className="fa-solid fa-user-tie"></i>
                    </div>
                    <div className="box__text">
                        <p className="box__name">Profesores</p>
                        <p className="box__number">0</p>
                    </div>
                </div>
                <div className="top__box">
                    <div className="box__img">
                        <i className="fa-solid fa-pen-ruler"></i>
                    </div>
                    <div className="box__text">
                        <p className="box__name">Personalizaciones</p>
                        <p className="box__number">0</p>
                    </div>
                </div>
            </div>
            <div className="container__left">
            </div>
            <div className="container__right">
                <div className="right__title">
                    <h3>Accesos directos</h3>
                </div>
                <div className="right__box">
                    <div className="box__shape">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <div className="right__text">
                        <p className="text__title">Historial</p>
                        <p className="text__description">Puedes ver el historial de las partidas.</p>
                    </div>
                </div>
                <div className="right__box">
                    <div className="box__shape">
                        <i className="fa-solid fa-envelope-open-text"></i>
                    </div>
                    <div className="right__text">
                        <p className="text__title">Reportes</p>
                        <p className="text__description">Puedes ver reportes personalizados respecto al último cuatrimestre.</p>
                    </div>
                </div>
                <div className="right__box">
                    <div className="box__shape">
                        <i className="fa-solid fa-eraser"></i>
                    </div>
                    <div className="right__text">
                        <p className="text__title">Depuración</p>
                        <p className="text__description">Puedes generar una limpieza de usuarios u otro archivos.</p>
                    </div>
                </div>
                <div className="right__box">
                    <div className="box__shape">
                        <i className="fa-solid fa-pen-to-square"></i>
                    </div>
                    <div className="right__text">
                        <p className="text__title">Personalizacion</p>
                        <p className="text__description">Puedes personalizar y ayudar a darle mas vida a las partidas.</p>
                    </div>
                </div>
            </div>
        </section>
      </LayoutAdmin>
    </>
  );
};

export default AdminDashboard;
