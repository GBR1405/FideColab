import React from 'react'; 
import { Link } from "react-router-dom";
import "react-router-dom";
import Layout from "../components/LayoutHelp";
import "../styles/help.css"
import "../styles/helpComponents.css"


const Help = () => {
    return (
      <Layout>
        <section className="help__container">
          <div className="container__content">
            <div className="help__top">
              <h2 className="help__title">Bienvenido al Centro de Ayuda</h2>
              <p className="help__description">
                Aquí encontrarás toda la información necesaria para aprovechar al máximo FideColab.  
                Explora nuestras guías, tutoriales y preguntas frecuentes para resolver cualquier duda.
              </p>
            </div>          
            <div className="help__grid">
              <div className="help__card">
                <i className="fa-solid fa-book help__icon"></i>
                <h3 className="help__card-title">Manual de Usuario</h3>
                <p className="help__card-text">
                  Descarga el manual en formato PDF con información detallada sobre cada función del sistema.
                </p>
                <a href="/help/manual" className="help__button">Ir al Manual</a>
              </div>
              <div className="help__card">
                <i className="fa-solid fa-video help__icon"></i>
                <h3 className="help__card-title">Tutoriales en Video</h3>
                <p className="help__card-text">
                  Aprende paso a paso cómo realizar cada acción con nuestros videos explicativos.
                </p>
                <a href="/help/tutorial" className="help__button">Ver Tutoriales</a>
              </div>
              <div className="help__card">
                <i className="fa-solid fa-question-circle help__icon"></i>
                <h3 className="help__card-title">Preguntas Frecuentes</h3>
                <p className="help__card-text">
                  Encuentra respuestas rápidas a las dudas más comunes sobre el sistema.
                </p>
                <a href="/help/preguntasfrecuentes" className="help__button">Ver Preguntas</a>
              </div>
            </div>
            <div className="help__info">   
              <p className="help__description">
                Nuestro equipo trabaja constantemente para mejorar la plataforma y asegurarnos de que tengas  
                una navegación fluida y sencilla. ¡Tu comodidad es nuestra prioridad!
              </p>
              <div className="help__contact">
                <p>¿Tienes alguna sugerencia o comentario? Escríbenos a:</p>
                <a href="mailto:fidecolab@gmail.com" className="help__contact-email">fidecolab@gmail.com</a>
              </div>
            </div>
          </div>          
        </section>
      </Layout>   
  );
}

export default Help;
