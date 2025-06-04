import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/simulationLayout.css";
import "../styles/simulationComponents.css";

const LayoutSimulation = ({ children, userData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="game__body">
      <header className="header">
        <div className="header__logo">
          <img className="image__source" src="https://i.postimg.cc/NGzXwBp6/logo.png" alt="Logo" />
          <div>
            <h2 className="logo__text">FideColab</h2> 
          </div>       
        </div>
        <div className="header__title">
          <h1 className="title__text">Partida por equipos</h1>
        </div>
      </header>
      <main className="main">                    
        {children}        
      </main>
      <script src="https://kit.fontawesome.com/fa4744a987.js" crossorigin="anonymous"></script>
    </div>
  );
};

export default LayoutSimulation;