import React, { useState, useEffect } from 'react';
import "../styles/LoadingScreen.css";

const LoadingScreen = ({ loading }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Si loading cambia a false, activamos el fade out
    if (!loading) {
      setFadeOut(true);
      const timer = setTimeout(() => setFadeOut(false), 500); // Duración del fade out
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (!loading && !fadeOut) return null;

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : 'fade-in'}`}>
      <div className="loader"></div>
      <p>Cargando configuración de juegos...</p>
    </div>
  );
};

export default LoadingScreen;