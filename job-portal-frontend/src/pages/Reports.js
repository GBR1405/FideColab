import React from 'react';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";

const Reports = () => {
  return (
    <>
      <LayoutAdmin>
        <section className="report__container">
            <div className="report__top">
                <h3>Reportes</h3>
            </div>
            <div className="report__middle">
                <button className="report__button">
                    <div className="report__icon">
                        <i className="fa-solid fa-puzzle-piece"></i>
                    </div>
                    <div className="report__text">
                        <span>Descargar</span>
                        <span>Partidas</span>
                    </div>                    
                </button>
                <button className="report__button">
                    <div className="report__icon">
                        <i className="fa-solid fa-user-graduate"></i>
                    </div>                    
                    <div className="report__text">
                        <span>Descargar</span>
                        <span>Estudiantes</span>
                    </div>       
                </button>
                <button className="report__button">
                    <div className="report__icon">
                        <i className="fa-solid fa-user-tie"></i>
                    </div>                    
                    <div className="report__text">
                        <span>Descargar</span>
                        <span>Profesores</span>
                    </div>       
                </button>
                <button className="report__button">
                    <div className="report__icon">
                        <i className="fa-solid fa-book-open-reader"></i>
                    </div>                    
                    <div className="report__text">
                        <span>Descargar</span>
                        <span>Bitacora</span>
                    </div>       
                </button>
            </div>
            <div className="report__bottom">
                <div className="report__left">
                    <div className="left__title">
                        <h3>Bitácora de Descargas</h3>
                    </div>
                    <div className="left__content">
                        <span>
                            Por ahora no has descargado reportes
                        </span>
                    </div>
                </div>
                <div className="report__right">
                    <div className="report__box">
                        <div className="box__shape">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <div className="right__text">
                            <p className="text__title">Historial</p>
                            <p className="text__description">Si gusta no descagar puede optar por ver el historial de este cuatrimestre.</p>
                        </div>
                    </div>
                    <div className="report__box">
                        <div className="box__shape">
                            <i className="fa-solid fa-eraser"></i>
                        </div>
                        <div className="right__text">
                            <p className="text__title">Depuracion</p>
                            <p className="text__description">Si desea eliminar datos, estudiantes o información y guardarlos puede depurar el sistema.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </LayoutAdmin>
    </>
  );
};

export default Reports;
