import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";
import "../styles/HomeScreen.css";

function UserHomeScreen() {
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const token = Cookies.get("IFUser_Info");
    if (!token) setError("User is not logged in");

    // Carrusel automático
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev === 2 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (error) return <Layout userData={null} />;

  return (
    <Layout>
      <div className="main__container_HS" style={{ overflowY: "hidden" }}>

        {/* Sección de bienvenida */}
        <div className="welcome-section">
          <div className="welcome-card">
            <h1 className="padding">¡Bienvenido a</h1>
            <div className="app-name">
              <span className="fide">FIDE</span>
              <span className="colab">COLAB</span>
            </div>
            <p className="tagline">Tu plataforma de aprendizaje colaborativo</p>
            <div className="mission">
              <p>FideColab fue creado para transformar la educación a través de la gamificación y el trabajo en equipo.</p>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="main-content">
          {/* Carrusel de pasos */}
          <div className="steps-section">
            <div className="steps-carousel">
              <h2 className="carousel-title">¿Cómo empezar a explorar y disfrutar?</h2>
              <div className="carousel-inner">
                <div className={`step ${currentStep === 0 ? 'active' : ''}`}>
                  <div className="step-content">
                    <span className="step-number">1</span>
                    <div className="step-text-container">
                      <p className="step-text">Espera a ser invitado a una sala</p>
                      <div className="step-decoration">
                        <div className="decoration-circle"></div>
                        <div className="decoration-line"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
                  <div className="step-content">
                    <span className="step-number">2</span>
                    <div className="step-text-container">
                      <p className="step-text">Entra y convive con tus compañeros</p>
                      <div className="step-decoration">
                        <div className="decoration-circle"></div>
                        <div className="decoration-line"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
                  <div className="step-content">
                    <span className="step-number">3</span>
                    <div className="step-text-container">
                      <p className="step-text">Completa actividades y mejora en tus habilidades</p>
                      <div className="step-decoration">
                        <div className="decoration-circle"></div>
                        <div className="decoration-line"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="carousel-dots">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    className={`dot ${currentStep === i ? 'active' : ''}`}
                    onClick={() => setCurrentStep(i)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Panel de notificaciones */}
          <div className="notifications-section">
            <div className="notifications-panel">
              <h2>Últimas noticias</h2>
              <div className="notifications-content">
                <div className="notification">
                  <div className="notification-icon">📢</div>
                  <div className="notification-text">
                    <h3>Gran apetura</h3>
                    <p>Se de los primeros en utilizar este gran sistema</p>
                  </div>
                </div>
                <div className="notification">
                  <div className="notification-icon">🚧</div>
                  <div className="notification-text">
                    <h3>En desarrollo</h3>
                    <p>El sistema esta aun en fase Beta, cualquier error por favor comunicarlo lo antes posible</p>
                  </div>
                </div>
                <div className="notification">
                  <div className="notification-icon">🎓</div>
                  <div className="notification-text">
                    <h3>Sistema hecho para estudiantes</h3>
                    <p>Hecho por y para estudiantes, trabaja en equipo y mejora en tus habilidades</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </Layout>
  );
}

export default UserHomeScreen;