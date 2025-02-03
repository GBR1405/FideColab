import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Usamos useNavigate para redirigir
import Cookies from 'js-cookie'; // Importamos js-cookie

function Home() {
  const navigate = useNavigate(); // Usamos navigate para redirigir

  useEffect(() => {
    // Comprobamos si la cookie de autenticación existe
    const token = Cookies.get('authToken');
    if (!token) {
      // Si no hay cookie, redirigimos al login
      navigate('/login');
    }else{
        navigate('/homeScreen');
    }
  }, [navigate]); // Reaccionamos a cambios en 'navigate'

  return (
    <h2 style={{ textAlign: 'center' }}>
    </h2>
  );
}

export default Home;

