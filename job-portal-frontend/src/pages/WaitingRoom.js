import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useParams, useNavigate  } from 'react-router-dom';
import Swal from 'sweetalert2';
import "../styles/simulationComponents.css";
import "../styles/animationRecharge.css";
import "../styles/simulationLayout.css";
import Cookies from "js-cookie";

const apiUrl = process.env.REACT_APP_API_URL;
const token = Cookies.get("authToken");

const WaitingRoom = () => {
  const socket = useSocket(); // Obtener la instancia de Socket.IO
  const { partidaId } = useParams(); // Obtener el partidaId de la URL
  const navigate = useNavigate(); // Para redirigir al usuario
  const [users, setUsers] = useState([]); // Estado para almacenar la lista de usuarios
  const audioRef = useRef(null); // Referencia al elemento de audio

  // Obtener el ID, nombre completo y rol del usuario desde el localStorage
  const userId = localStorage.getItem('userId');
  const userFullName = localStorage.getItem('userFullName');
  const userRole = localStorage.getItem('role'); // Obtener el rol del usuario

  // Función para obtener el número de equipo del estudiante
  const fetchTeamNumber = async () => {
    try {
        const response = await fetch(`${apiUrl}/checkgroup`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener el número de equipo');
        }

        const data = await response.json();

        const { isParticipant, partidaId, equipoNumero } = data;

        if (isParticipant && equipoNumero !== null) {
            return { partidaId, equipoNumero };
        } else {
            console.error('El estudiante no está en una partida activa o no tiene equipo asignado.');
            return null;
        }
    } catch (error) {
        console.error('Error al obtener el número de equipo:', error);
        return null;
    }
};

  // Unirse a la sala cuando el componente se monta
  useEffect(() => {
    if (socket && partidaId && userId && userFullName) {
      // Unirse a la sala con el ID y el nombre completo
      socket.emit('JoinRoom', partidaId, { userId, fullName: userFullName, role: userRole });

      // Escuchar eventos de la sala
      socket.on('UpdateUsers', (usuarios) => {
        // Reproducir el sonido cuando un nuevo usuario se une
        if (usuarios.length > users.length) {
          if (audioRef.current) {
            audioRef.current.play(); // Reproducir el sonido
          }
        }

        setUsers(usuarios); // Actualizar la lista de usuarios
      });

      // Escuchar el evento para iniciar el temporizador (para todos los usuarios)
      socket.on('StartTimer', () => {
        showSweetAlertTimer(); // Mostrar el temporizador en todos los usuarios
      });

      // Limpiar listeners al desmontar el componente
      return () => {
        socket.off('UpdateUsers');
        socket.off('StartTimer');
      };
    }
  }, [socket, partidaId, userId, userFullName, users.length, userRole]);

  // Filtrar la lista de usuarios para excluir al profesor
  const filteredUsers = users.filter(user => user.role !== 'Profesor');

  // Habilitar el botón "Iniciar Partida" si hay al menos 3 usuarios conectados
  const isStartButtonEnabled = filteredUsers.length >= 1;

  // Función para redirigir a los estudiantes después del temporizador
    const handleTimerComplete = async () => {
      if (userRole === 'Profesor') {
        navigate(`/professor-dashboard/${partidaId}`);
      } else {
        const teamInfo = await fetchTeamNumber();
        if (teamInfo) {
          navigate(`/team-room/${teamInfo.partidaId}/${teamInfo.equipoNumero}`);
        }
      }
    };

  // Función para mostrar el SweetAlert con el temporizador de 3 segundos
  const showSweetAlertTimer = () => {
    let timeLeft = 3; // Duración del temporizador en segundos

    Swal.fire({
      title: 'La partida comenzará en...',
      html: `<h1>${timeLeft}</h1>`,
      timer: timeLeft * 1000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const timer = Swal.getPopup().querySelector('h1');
        const timerInterval = setInterval(() => {
          timeLeft -= 1;
          timer.textContent = timeLeft;
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
          }
        }, 1000);
      },
      willClose: () => {
        handleTimerComplete(); // Llamar a la función de redirección
      }
    });
  };

  // Función para iniciar la partida (solo para el profesor)
  const handleStartGame = () => {
    if (isStartButtonEnabled && userRole === 'Profesor') {
      socket.emit('StartGame', partidaId); // Notificar al servidor que la partida ha comenzado
      console.log('Partida iniciada');
    }
  };

  return (
    <div className="body__room">
      <header className="header">
        <div className="header__logo">
          <div className="logo__image">
            <img className="image__source" src="logo.png" alt="" />
          </div>
          <div className="logo__text">
            <h2>Institución</h2>
          </div>
        </div>
        <div className="header__title">
          <h1 className="title__text">Sala de Espera</h1>
        </div>
        <div className="header__profile">
          <img className="profile__img" src="user.png" alt="" />
          {/* Mostrar el botón "Iniciar Partida" solo si el usuario es profesor */}
          {userRole === 'Profesor' && (
            <button
              className="profile__text"
              disabled={!isStartButtonEnabled}
              onClick={handleStartGame}
            >
              Iniciar Partida
            </button>
          )}
        </div>
      </header>
      <nav className="sidebar">
        <ul className="sidebar__list">
          <li className="list__item list__item--active">
            <a className="item__area" href="#">
              <i className="fa-solid fa-house"></i>
              <span className="area__text area__text--active">Inicio</span>
            </a>
          </li>
        </ul>
        <div className="sidebar__buttom">
          <button className="buttom__btn">
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="btn__text">Cerrar sesión</span>
          </button>
        </div>
      </nav>
      <main className="main">
        <section className="room__container">
          <div className="container__content">
            {/* Mostrar la lista de usuarios (excluyendo al profesor) */}
            {filteredUsers.map((user, index) => (
              <div
                className={`content__box ${index === filteredUsers.length - 1 ? 'pop' : ''}`}
                key={index}
              >
                <div className="box__title">
                  <h3>Prueba 1</h3>
                </div>
                <div className="box__data">
                  <div className="data__player">
                    <span className="player__text">{user.fullName}</span>
                    <i className="fa-solid fa-circle"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="container__information">
            <div className="information__title">
              <h3>Información</h3>
            </div>
            <div className="information__description">
              <h3>Descripción</h3>
              <p>
                Esta es la sala de espera, tienes que esperar a tus compañeros, al estar todos el profesor puede dar empezada la partida.
              </p>
              <p>
                <strong>Estudiantes conectados:</strong> {filteredUsers.length}
              </p>
            </div>
            <div className="information__button">
              <button className="button__help">Ayuda</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WaitingRoom;