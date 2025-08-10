import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useParams, useNavigate, Link  } from 'react-router-dom';
import Swal from 'sweetalert2';
import "../styles/simulationComponents.css";
import "../styles/animationRecharge.css";
import "../styles/simulationLayout.css";
import Cookies from "js-cookie";

const apiUrl = process.env.REACT_APP_API_URL;
const token = Cookies.get("authToken");

const WaitingRoom = () => {
  const socket = useSocket(); // Obtener la instancia de Socket.IO
  const { partidaId } = useParams(); // Obtener el partidaId de la URL.
  const navigate = useNavigate(); // Para redirigir al usuario
  const [users, setUsers] = useState([]); // Estado para almacenar la lista de usuarios
  const audioRef = useRef(null); // Referencia al elemento de audio

  // Obtener el ID, nombre completo y rol del usuario desde el localStorage
  const userId = localStorage.getItem('userId');
  const userFullName = localStorage.getItem('userFullName');
  const userRole = localStorage.getItem('role'); // Obtener el rol del usuario
  const [visibleTeams, setVisibleTeams] = useState([]);
  
  const [teamGroups, setTeamGroups] = useState({});

  useEffect(() => {
      if (!socket || !partidaId) return;
    
      // 🔍 Verificar estado de la partida antes de ejecutar lógica
      const verificarEstadoPartida = async () => {
        try {
          const res = await fetch(`${apiUrl}/check-activity`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ partidaId })
          });
    
          const data = await res.json();
    
          if (data.isFinished) {
            window.location.href = `/resultados/${partidaId}`;
            return;
          }
    
          console.log('Partida activa, obteniendo configuración...');
        } catch (error) {
          console.error('Error al verificar estado de la partida:', error);
        }
      };
    
      
    
      verificarEstadoPartida(); // Llamado antes del emit
    }, [socket, partidaId]);


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

      if (socket && partidaId) {
        socket.emit('GetGroupStructure', parseInt(partidaId), (response) => {
          if (response.success) {
            setTeamGroups(response.teams);
          } else {
            console.error('Error al obtener los grupos:', response.error);
          }
        });
      }

  
      // Escuchar eventos de la sala
      socket.on('UpdateUsers', (usuarios) => {
        // Eliminar duplicados basados en userId o fullName
        const usuariosUnicos = usuarios.reduce((acc, current) => {
          const x = acc.find(item => 
            item.userId === current.userId || 
            item.fullName === current.fullName
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
  
        // Reproducir el sonido cuando un nuevo usuario se une
        if (usuariosUnicos.length > users.length) {
          if (audioRef.current) {
            audioRef.current.play();
          }
        }

        socket.on('StartTimer', () => {
          showSweetAlertTimer(); // Mostrar el temporizador en todos los usuarios
        });
  
  
        setUsers(usuariosUnicos);
        console.log('USERS ACTUALIZADOS:', usuariosUnicos);
      });
  
      // Limpiar listeners al desmontar el componente
      return () => {
        socket.off('UpdateUsers');
        socket.off('StartTimer');
      };
    }
  }, [socket, partidaId, userId, userFullName, userRole]);

  useEffect(() => {
  console.log('GRUPOS:', teamGroups);
}, [teamGroups]);

  const isUserConnected = (userId) => {
  return users.some(u => Number(u.userId) === Number(userId));
};

  const getUniqueUsers = (users) => {
    const uniqueUsers = [];
    const seen = new Set();
    
    for (const user of users) {
      const identifier = user.userId || user.fullName;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniqueUsers.push(user);
      }
    }
    
    return uniqueUsers;
  };
  
  // Filtrar la lista de usuarios para excluir al profesor y asegurar unicidad
  const filteredUsers = getUniqueUsers(
    users.filter(user => user.role !== 'Profesor')
  );

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

    useEffect(() => {
  if (Object.keys(teamGroups).length > 0) {
    // Mostrar equipos uno por uno con intervalo de 200ms
    Object.keys(teamGroups).forEach((teamNumber, index) => {
      setTimeout(() => {
        setVisibleTeams(prev => [...prev, teamNumber]);
      }, index * 135);
    });
  }
}, [teamGroups]);

  // Función para mostrar el SweetAlert con el temporizador de 3 segundos
  const showSweetAlertTimer = () => {
    let timeLeft = 3;
  
    Swal.fire({
      title: '¡Comienza la partida!',
      html: `
        <div class="custom-timer-container">
          <div class="timer-text">Iniciando en...</div>
          <div class="timer-circle">
            <div class="timer-count">${timeLeft}</div>
            <svg class="timer-svg" viewBox="0 0 100 100">
              <circle class="timer-circle-bg" cx="50" cy="50" r="45"></circle>
              <circle class="timer-circle-fill" cx="50" cy="50" r="45"></circle>
            </svg>
          </div>
        </div>
        <div class="particles-container"></div>
      `,
      showConfirmButton: false,
      timer: timeLeft * 1000,
      didOpen: () => {
        const timerFill = Swal.getPopup().querySelector('.timer-circle-fill');
        const timerCount = Swal.getPopup().querySelector('.timer-count');
        const particlesContainer = Swal.getPopup().querySelector('.particles-container');
        
        const circumference = 2 * Math.PI * 45;
        timerFill.style.strokeDasharray = circumference;
        
        const timerInterval = setInterval(() => {
          timerCount.classList.add('changing');
          setTimeout(() => {
            timerCount.classList.remove('changing');
          }, 400);
          
          // Crear partículas (3 grupos: centro + 2 puntos aleatorios)
          createParticleGroup(particlesContainer, 'center');
          createParticleGroup(particlesContainer, 'random');
          createParticleGroup(particlesContainer, 'random');
          
          timeLeft -= 1;
          timerCount.textContent = timeLeft;
          timerFill.style.strokeDashoffset = circumference * (1 - timeLeft / 3);
          
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Explosión final con 5 grupos
            for (let i = 0; i < 5; i++) {
              createParticleGroup(particlesContainer, i === 0 ? 'center' : 'random', true);
            }
          }
        }, 1000);

        const createParticleGroup = (container, originType, isFinal = false) => {
          const particleCount = isFinal ? 15 : 8;
          const baseSize = isFinal ? 15 : 12;
          
          for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('timer-particle');
            
            // Configurar origen
            if (originType === 'random') {
              particle.classList.add('random-origin');
              particle.style.setProperty('--random-origin-x', Math.random());
              particle.style.setProperty('--random-origin-y', Math.random());
            }
            
            // Propiedades dinámicas
            particle.style.setProperty('--random-x', (Math.random() * 2 - 1));
            particle.style.setProperty('--random-y', (Math.random() * 2 - 1));
            particle.style.width = `${Math.random() * 8 + baseSize}px`;
            particle.style.height = particle.style.width;
            
            // Colores alternados para mejor efecto
            if (i % 3 === 0) {
              particle.style.backgroundColor = '#f59e0b'; // Amarillo
            } else if (i % 3 === 1) {
              particle.style.backgroundColor = '#3b82f6'; // Azul
            } else {
              particle.style.backgroundColor = '#ffffff'; // Blanco
            }
            
            particle.style.animationDuration = `${Math.random() * 0.3 + 0.7}s`;
            particle.style.animationDelay = `${i * 0.03}s`;
            container.appendChild(particle);
            
            // Eliminar después de la animación
            setTimeout(() => {
              particle.remove();
            }, 1000);
          }
        };

      },
      willClose: () => {
        handleTimerComplete();
      }

      
    });
  
    const createParticles = (container) => {
      container.innerHTML = '';
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.classList.add('timer-particle');
        particle.style.setProperty('--random-x', (Math.random() * 2 - 1));
        particle.style.setProperty('--random-y', (Math.random() * 2 - 1));
        particle.style.animationDelay = `${i * 0.05}s`;
        container.appendChild(particle);
      }
    };
  
    const createFinalExplosion = (container) => {
      container.innerHTML = '';
      for (let i = 0; i < 24; i++) {
        const particle = document.createElement('div');
        particle.classList.add('timer-particle');
        particle.style.width = `${Math.random() * 10 + 5}px`;
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = `hsl(${Math.random() * 60 + 200}, 80%, 60%)`;
        particle.style.setProperty('--random-x', (Math.random() * 3 - 1.5));
        particle.style.setProperty('--random-y', (Math.random() * 3 - 1.5));
        particle.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;
        container.appendChild(particle);
      }
    };
  };

  // Función para iniciar la partida (solo para el profesor)
  const handleStartGame = () => {
    if (isStartButtonEnabled && userRole === 'Profesor') {
      socket.emit('StartGame', partidaId); // Notificar al servidor que la partida ha comenzado
      console.log('Partida iniciada');
    }
  };

  useEffect(() => {
  if (socket && users.length > 0) {
    const last = users[users.length - 1];
    if (last && last.fullName !== userFullName) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${last.fullName} se ha conectado`,
        showConfirmButton: false,
        timer: 2000
      });
    }
  }
}, [users]);


  return (
    <div className="body__room">
      <header className="header">
        <Link to="/" className="logo__link">
          <div className="logo__image">
            <img 
              className="image__source" 
              src="https://i.postimg.cc/NGzXwBp6/logo.png" 
              alt="Logo institución" 
            />
          </div>
          <div>
            <h2 className="logo__text">FideColab</h2>
          </div>
        </Link>
        <div className="header__title">
          <h1 className="title__text">Sala de Espera</h1>
        </div>
        <div className="header__profile">
          {userRole === 'Profesor' && (
            <button
              className="profile__text_S"
              disabled={!isStartButtonEnabled}
              onClick={handleStartGame}
            >
              {isStartButtonEnabled ? (
                <>
                  <i className="fa-solid fa-play"></i> Iniciar Partida
                </>
              ) : (
                <>
                  <i className="fa-solid fa-hourglass-half"></i> Esperando jugadores...
                </>
              )}
            </button>
          )}
        </div>
      </header>     
      <main className="main">
        <section className="room__container">
          {/* #CAMBIO Inicio del codigo agregado */}
          <div className="container__background">
            <div className="background__content">
              {Object.entries(teamGroups).map(([teamNumber, members]) => (
                <div 
                  className={`content__widget ${visibleTeams.includes(teamNumber) ? 'pop-animation' : ''}`}
                  key={teamNumber}
                  style={{ display: visibleTeams.includes(teamNumber) ? 'grid' : 'none' }}
                >
                <div className="content__widget" key={teamNumber}>
                  <div className="widget__title">
                    <h3>Grupo {teamNumber}</h3>
                  </div>
                  <div className="widget__data">
                    {Array.from({ length: 4 }).map((_, index) => {
                      const user = members[index];
                      return (
                        <div className="data__player" key={index}>
                          {user ? (
                            <>
                              <span className="player__text" title={user.fullName}>
                                {user.fullName}
                              </span>
                              <span
                                className={`connection-dot ${isUserConnected(user.userId) ? 'dot-online' : 'dot-offline'}`}
                                title={isUserConnected(user.userId) ? 'Conectado' : 'Desconectado'}
                              ></span>
                            </>
                          ) : (
                            <>
                              <span className="player__text">[Vacío]</span>
                              <i className="fa-regular fa-circle not-connected"></i>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                </div>
              ))}
            </div>
          </div>
          {/* #CAMBIO Fin del codigo agregado */}
          <div className="container__information">
            <div className="information__title">
              <h3>Información</h3>
            </div>
            <div className="information__description">
              <h3>Descripción</h3>
              <p>
                Esta es la sala de espera. Espera a que todos tus compañeros se conecten. 
                Cuando estén todos, el profesor podrá iniciar la partida.
              </p>
              <p>
                <strong>Estudiantes conectados:</strong> {filteredUsers.length}
              </p>
              {userRole === 'Profesor' && (
                <p className="teacher-note">
                  <i className="fa-solid fa-chalkboard-user"></i> Eres el profesor. 
                  Podrás iniciar la partida cuando todos los estudiantes estén conectados.
                </p>
              )}
            </div>
            <div className="information__button">
              <button className="button__help">
                <i className="fa-solid fa-question-circle"></i> Ayuda
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WaitingRoom;