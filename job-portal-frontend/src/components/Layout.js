import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import '../styles/layout.css';
import "../styles/animationRecharge.css";
import Swal from 'sweetalert2';
import Cookies from "js-cookie";
import { io } from 'socket.io-client';

const apiUrl = process.env.REACT_APP_API_URL;
const token = Cookies.get("authToken");


// Función para obtener el valor de una cookie por su nombre
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const Layout = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Clave de desencriptado obtenida desde el archivo .env
  const decryptionKey = process.env.REACT_APP_SECRET_KEY;
  const isSimulationsActive = location.pathname === '/simulations' || location.pathname.startsWith('/simulations/');

  const handleJoinSimulation = async () => {
  try {

    Swal.fire({
      title: 'Conectando...',
      text: 'Obteniendo información',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const response = await fetch(`${apiUrl}/check-participation`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.isParticipant) {
      const { partidaId, estadoPartida, equipoNumero } = data;

      // Obtener la cookie del usuario
      const token = getCookie('IFUser_Info');

      if (!token) {
        Swal.fire('Error', 'No se pudo obtener la información del usuario.', 'error');
        return;
      }

      try {
        const bytes = CryptoJS.AES.decrypt(token, decryptionKey);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedData) {
          Swal.fire('Error', 'No se pudo desencriptar la información del usuario.', 'error');
          return;
        }

        const parsedToken = JSON.parse(decryptedData);
        const userId = parsedToken.id;
        const rol = parsedToken.rol;
        const fullName = `${parsedToken.nombre} ${parsedToken.apellido1} ${parsedToken.apellido2}`;

        if (!userId || !fullName) {
          Swal.fire('Error', 'No se pudo obtener el ID o el nombre del usuario.', 'error');
          return;
        }

        // Guardar en localStorage
        localStorage.setItem('userId', userId);
        localStorage.setItem('userFullName', fullName);
        localStorage.setItem('role', rol);

        // 🔁 Redirección según estado de la partida
        if (estadoPartida === 'iniciada') {
          // Conectar al socket solo si va a la sala de espera
          const socket = io('https://backend-fidecolab.onrender.com', {
            withCredentials: true,
          });

          socket.emit('JoinRoom', partidaId, { userId, fullName });

          socket.on('UserJoined', (user) => {
            console.log(`Usuario ${user.fullName} (ID: ${user.userId}) se unió a la sala`);
          });

          socket.on('UserLeft', (user) => {
            console.log(`Usuario ${user.fullName} (ID: ${user.userId}) salió de la sala`);
          });

          window.location.href = `/waiting-room/${partidaId}`;

        } else if (estadoPartida === 'en proceso') {
          if (rol === 'Profesor') {
            window.location.href = `/professor-dashboard/${partidaId}`;
          } else {
            if (!equipoNumero) {
              Swal.fire('Error', 'No se pudo determinar el equipo del jugador.', 'error');
              return;
            }
            window.location.href = `/team-room/${partidaId}/${equipoNumero}`;
          }

        } else {
          Swal.fire('Error', 'Estado de la partida no reconocido.', 'error');
        }

      } catch (error) {
        console.error('Error al desencriptar o parsear la cookie:', error);
        Swal.fire('Error', 'Hubo un problema al procesar la información del usuario.', 'error');
      }

    } else {
      Swal.fire('Información', 'No estás participando en ninguna partida activa.', 'info');
    }

  } catch (error) {
    console.error('Error al verificar la participación:', error);
    Swal.fire('Error', 'Hubo un problema al verificar la participación', 'error');
  }
};


  // Cargar userData desde la cookie al montar el componente
  useEffect(() => {
    const token = getCookie('IFUser_Info');

    if (token) {
      try {
        // Desencriptar la cookie
        const bytes = CryptoJS.AES.decrypt(token, decryptionKey);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        if (decryptedData) {
          const parsedToken = JSON.parse(decryptedData);

          const fullName = `${parsedToken.nombre} ${parsedToken.apellido1} ${parsedToken.apellido2}`;
          setUserData({
            nombreCompleto: fullName,
            rol: parsedToken.rol
          });
        }
      } catch (error) {
        console.error('Error al desencriptar o parsear la cookie:', error);
      }
    }
    setLoading(false);
  }, []);

  // Función para generar un ícono con las primeras dos letras del nombre
  const getUserIcon = (name) => {
    if (!name) return 'NA';
    const initials = name.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
    return initials;
  };

  // Función para generar un color aleatorio para el fondo
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    document.cookie = 'IFUser_Token=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = 'IFUser_Info=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';  // Limpiar la cookie de usuario también
    navigate('/login');
  };

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  // Generar el ícono usando las primeras dos letras del nombre
  const userIcon = userData?.nombreCompleto ? getUserIcon(userData.nombreCompleto) : 'NA';
  const iconColor = getRandomColor();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="default__body">
      <header className="header">
        <div className="header__title header__title--none">
          <h1 className="title__text" onClick={() => navigate('/userhome')}>FideColab</h1>
        </div>
        <div className="header__profile">
          <div 
            className="profile__img-label" 
            style={{ backgroundColor: iconColor }}
            onClick={() => navigate('/profile')}
          >
            {userIcon}
          </div>
          <a className="profile__text" onClick={() => navigate('/profile')}>
            {userData?.nombreCompleto || 'Cargando...'}
          </a>
        </div>
      </header>

      <nav className="sidebar">
        <div className="sidebar__logo">
            <img className="logo__img" src="https://i.postimg.cc/NGzXwBp6/logo.png" alt="" />
            <span className="logo__text" onClick={() => navigate('/homeScreen')} style={{ cursor: 'pointer' }}>FideColab</span>
        </div>

        <ul className="sidebar__list">
          <li className={`list__item ${
            location.pathname === '/homeScreen' || 
            location.pathname === '/profile'
            ? 'list__item--active' 
            : ''
          }`}>
            <a className="item__area" onClick={() => navigate('/homeScreen')} style={{ cursor: 'pointer' }}>
              <i className="fa-solid fa-house"></i>
              <span className="area__text">Inicio</span>
            </a>
          </li>

          {/* Opciones para Estudiantes */}
          {userData?.rol === 'Estudiante' && (
    <>
              <li className={`list__item ${location.pathname === '/student-history' ? 'list__item--active' : ''}`}>
                  <a className="item__area" onClick={() => navigate('/student-history')} style={{ cursor: 'pointer' }}>
                      <i className="fa-solid fa-clock-rotate-left"></i>
                      <span className="area__text">Historial</span>
                  </a>
              </li>
              {/* Nueva opción para unirse a partida */}
              <li className={`list__item ${location.pathname === '/join-simulation' ? 'list__item--active' : ''}`}>
                  <a className="item__area" onClick={handleJoinSimulation} style={{ cursor: 'pointer' }}>
                      <i className="fa-solid fa-door-open"></i>
                      <span className="area__text">Unirse a Partida</span>
                  </a>
              </li>
          </>
      )}

      {/* Opciones para Profesores */}
      {userData?.rol === 'Profesor' && (
          <>
              <li className={`list__item ${location.pathname === '/students' ? 'list__item--active' : ''}`}>
                  <a className="item__area" onClick={() => navigate('/students')} style={{ cursor: 'pointer' }}>
                      <i className="fa-solid fa-users"></i>
                      <span className="area__text">Estudiantes</span>
                  </a>
              </li>
              <li className={`list__item ${isSimulationsActive ? 'list__item--active' : ''}`}>
                <a className="item__area" onClick={() => navigate('/simulations')} style={{ cursor: 'pointer' }}>
                  <i className="fa-solid fa-play-circle"></i>
                  <span className="area__text">Empezar Simulación</span>
                </a>
              </li>
              <li className={`list__item ${location.pathname === '/teacher-history' ? 'list__item--active' : ''}`}>
                  <a className="item__area" onClick={() => navigate('/teacher-history')} style={{ cursor: 'pointer' }}>
                      <i className="fa-solid fa-clock-rotate-left"></i>
                      <span className="area__text">Historial Profesor</span>
                  </a>
              </li>
              {/* Nueva opción para unirse a partida */}
              <li className={`list__item ${location.pathname === '/join-simulation' ? 'list__item--active' : ''}`}>
                  <a className="item__area" onClick={handleJoinSimulation} style={{ cursor: 'pointer' }}>
                      <i className="fa-solid fa-door-open"></i>
                      <span className="area__text">Unirse a Partida</span>
                  </a>
              </li>
          </>
      )}
        </ul>
        <div className="sidebar__buttom">
          <button className="buttom__btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="btn__text">Cerrar sesión</span>
          </button>
        </div>
      </nav>
      <main className="main">
        {children}
        <a className="main__float" href='/help'>
          <i class="fa-solid fa-question"></i>
        </a>
      </main>
      <script src="https://kit.fontawesome.com/fa4744a987.js" crossOrigin="anonymous"></script>
      <script type="text/javascript" src="js/app.js" defer></script>
    </div>
  );
};

export default Layout;
