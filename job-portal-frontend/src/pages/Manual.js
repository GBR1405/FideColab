import React from 'react';
import LayoutHelp from "../components/LayoutHelp";
import "../styles/helpComponents.css";
import pdfFile from '../docs/Manual de Uso.pdf';

const Manual = () => {
  return (
    <LayoutHelp>
      <section className="manual__container">
        <div className="container__navegation">
          <a className="navegation__text" href="/help">Centro de Ayuda</a>
          <a className="navegation__text navegation__text--active" href="/help/manual">/Manual</a>
        </div>

        <div className="container__content">
          <div className="manual__heading">
            <h3>Manual de Usuario</h3>
            <a href={pdfFile} download="Manual_de_Uso.pdf">
              <button className="manual__btn">Descargar</button>
            </a>
          </div>
          <div className="manual__content">
            <iframe className="manual__pdf" src={pdfFile} title="manual" />
          </div>
        </div>
      </section>
    </LayoutHelp>
  );
};

export default Manual;
