import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/animationRecharge.css";

const NotFound = () => {
  return (
    <div style={styles.errorContainer}>
      <div style={styles.errorBox}>
        <div style={styles.errorHeader}>
          <img
            src="https://i.postimg.cc/NGzXwBp6/logo.png"
            alt="Fidecola Logo"
            style={styles.errorLogo}
          />
          <h1 style={styles.errorTitle}>Fidecolab</h1>
        </div>
        <h2 style={styles.errorWarning}>Lo sentimos</h2>
        <p style={styles.errorMessage}>
          La página que deseas entrar no existe o no tienes el permiso para acceder.
          <br />
          Para prevenir errores, se te pide regresar manualmente a la última página o volver a loguearte.
        </p>
        <div style={styles.buttonContainer}>
          <Link to="/login" style={styles.errorButton}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  errorContainer: {
    backgroundColor: 'rgb(1, 1, 138)',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '500px',
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  errorLogo: {
    width: '50px',
    height: 'auto',
    marginRight: '10px',
  },
  errorTitle: {
    fontSize: '36px',
    color: '#333',
  },
  errorWarning: {
    fontSize: '28px',
    color: '#555',
    marginBottom: '20px',
  },
  errorMessage: {
    fontSize: '18px',
    color: '#555',
    marginBottom: '30px',
  },
  buttonContainer: {
    marginTop: '20px',
  },
  errorButton: {
    fontSize: '18px',
    padding: '12px 24px',
    backgroundColor: '#fdf20c',
    color: 'black',
    border: 'none',
    borderRadius: '50px',
    textDecoration: 'none',
    display: 'inline-block',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s, transform 0.3s',
  },
  errorButtonHover: {
    backgroundColor: '#e0e000',
    transform: 'scale(1.05)',
  },
};

export default NotFound;
