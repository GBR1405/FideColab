import React from 'react';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";

const Depuration = () => {
  return (
    <>
      <LayoutAdmin>
        <section className="depuration__container">
            <div className="depuration__title">
                <h3>Depuracion</h3>
            </div>
            <div className="depuration__content">
                <div className="depuration__left">
                    <div className="left__box">
                        <div className="box__shape">
                            <i className="fa-solid fa-user-tie"></i>
                        </div>
                        <div className="right__text">
                            <p className="text__title">Depurar Profesores</p>
                            <p className="text__description">Desde acá podras depurar, agregar, editar o eliminar profesores.</p>
                        </div>
                    </div>
                    <div className="left__box">
                        <div className="box__shape_y">
                            <i className="fa-solid fa-user-graduate"></i>
                        </div>
                        <div className="right__text">
                            <p className="text__title">Depurar Estudiantes</p>
                            <p className="text__description">Desde acá podras depurar, agregar, editar o eliminar estudiantes.</p>
                        </div>
                    </div>
                    <div className="left__box">
                        <div className="box__shape_yh">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <div className="right__text">
                            <p className="text__title">Depurar Historial</p>
                            <p className="text__description">Desde acá podrás depurar el historial para la limpieza total de las partidas.</p>
                        </div>
                    </div>
                    <div className="left__box">
                        <div className="box__shape_g">
                            <i className="fa-solid fa-pen-ruler"></i>
                        </div>
                        <div className="right__text">
                            <p className="text__title">Depurar Bitácora</p>
                            <p className="text__description">Se eliminará información de acciones hechas por el profesor y errores.</p>
                        </div>
                    </div>
                </div>
                <div className="depuration__right">
                    <div className="depuration__top">
                        <div className="depuration__options">
                            <div className="options__top">
                                <div className="depuration__title">
                                    <h3>Acciones</h3>
                                </div>
                                <div className="option__button button--selection">
                                    <button type="submit">Eliminar lo seleccionado</button>
                                </div>
                                <div className="option__button button--all">
                                    <button type="submit">Eliminar todo</button>
                                </div>
                            </div>
                            <div className="options__bottom">
                                <div className="option__search">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input type="search" placeholder="Busca elemento" />
                                </div>
                                <div className="option__button button--search">
                                    <button type="submit">Buscar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="depuration__bottom">
                        <div className="bottom__title">
                            <h3>Lista a depurar</h3>
                        </div>
                        <div className="bottom__content">
                            <span>
                                Seleccione una lista para depurarla
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </LayoutAdmin>
    </>
  );
};

export default Depuration;
