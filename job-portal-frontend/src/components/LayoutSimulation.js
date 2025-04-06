import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/simulationLayout.css";
import "../styles/simulationComponents.css";

const LayoutSimulation = ({ children, userData }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtiene la URL actual

  return (
    <div className="game__body">
      <header className="header">
          <div className="header__logo">
              <div className="logo__image">
                  <img className="image__source" src="https://i.postimg.cc/NGzXwBp6/logo.png" alt="" />
              </div>
              <div className="logo__text">
                  <h2>FideColab</h2> 
              </div>       
          </div>
          <div className="header__title">
              <h1 className="title__text">Partida por equipos</h1>
          </div>
          <div className="header__profile">
              <img className="profile__img" src="user.png" alt="" />
          </div>
      </header>
      <main className="main">
          <section className="main__container">              
              {children}              
              <div className="container__information">
                  <div className="information__title">
                      <h3>Información</h3>                    
                  </div>
                  <div className="information__description">
                      <h3>Descripción</h3>
                      <p>Esta es la sala de espera, tienes que esperar a tus compañeros, al estar todos el profesor puede dar empezada la partida</p>
                  </div>
                  <div className="information__time">
                      <h3>Tiempo transcurrido</h3>  
                      <span>02:10</span>   
                  </div>
                  <div className="information__button">
                      <button className="button__help">Ayuda</button>   
                  </div>
              </div>
          </section>
      </main>
      <script src="https://kit.fontawesome.com/fa4744a987.js" crossorigin="anonymous"></script>
  </div>
  );
};

export default LayoutSimulation;
