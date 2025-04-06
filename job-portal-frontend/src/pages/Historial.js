import React from 'react';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";

const Historial = () => {
  return (
    <>
      <LayoutAdmin>
        <section className="historial__container">
            <div className="historial__title">
                <h3>Historial</h3>
            </div>
            <div className="historial__options">
                <div className="options__top">
                    <div className="option__box">
                        <select>
                            <option value="0" disabled selected>Curso:</option>
                            <option value="1">Opción 1</option>
                            <option value="2">Opción 2</option>
                            <option value="3">Opción 3</option>
                        </select>
                    </div>
                    <div className="option__box">
                        <select>
                            <option value="0" disabled selected>Grupo:</option>
                            <option value="1">Opción 1</option>
                            <option value="2">Opción 2</option>
                            <option value="3">Opción 3</option>
                        </select>
                    </div>
                    <div className="option__box">
                        <input type="date" id="fecha" />
                    </div>
                </div>
                <div className="options__bottom">
                    <div className="option__search">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input type="search" placeholder="Busca por nombre de profesor" />
                    </div>
                    <div className="option__button">
                        <button type="submit">Buscar</button>
                    </div>
                </div>
            </div>
            <div className="historial__view">
                <p>No se han generado partidas en este cuatrimestre</p>
            </div>
        </section>
      </LayoutAdmin>
    </>
  );
};

export default Historial;
