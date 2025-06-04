import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import LayoutSimulation from '../components/LayoutSimulation';
import "../styles/simulationComponents.css";
import { games } from '../games/GameConfiguration';
import "../styles/TeamRoom.css";
import Swal from 'sweetalert2';

import MemoryGame from '../games/MemoryGame';
import HangmanGame from '../games/HangmanGame';
import PuzzleGame from '../games/PuzzleGame';
import DrawingGame from '../games/DrawingGame';

const TeamRoom = () => {
  const { partidaId, equipoNumero } = useParams();
  const socket = useSocket();
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentGameInfo, setCurrentGameInfo] = useState(null);
  const [gameProgress, setGameProgress] = useState({ current: 0, total: 0 });
  const [showTransition, setShowTransition] = useState(false);
  const [transitionGame, setTransitionGame] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const cursorContainerRef = useRef(null);
  const userId = localStorage.getItem('userId');
  const roomId = `team-${partidaId}-${equipoNumero}`;
  const transitionTimeoutRef = useRef(null);
  const timerRef = useRef(null);
  const [timer, setTimer] = useState({
    remaining: 0,
    total: 0,
    active: false,
    gameType: '',
    difficulty: ''
  });
  const [initialLoad, setInitialLoad] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [initialTimerSet, setInitialTimerSet] = useState(false);
  const [firstGameConfig, setFirstGameConfig] = useState(null);
  const [transitionPhase, setTransitionPhase] = useState('idle');

  // Función para generar hash de un string
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  // Actualizar cursor remoto
  const updateCursor = (userId, normalizedX, normalizedY) => {
    if (userId === localStorage.getItem('userId')) return;
    
    const container = cursorContainerRef.current;
    if (!container) return;
    
    // Obtener posición absoluta del contenedor
    const rect = container.getBoundingClientRect();
    
    // Calcular posición absoluta en píxeles
    const x = normalizedX * rect.width;
    const y = normalizedY * rect.height;
    
    let cursor = document.getElementById(`cursor-${userId}`);
    
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = `cursor-${userId}`;
      cursor.className = 'remote-cursor';
      
      const color = `hsl(${hashCode(userId) % 360}, 70%, 50%)`;
      cursor.style.setProperty('--cursor-color', color);
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'cursor-name';
      nameSpan.textContent = getUserName(userId);
      cursor.appendChild(nameSpan);
      
      container.appendChild(cursor);
    }
  
    // Aplicar posición absoluta con transform
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  };

  // Obtener nombre de usuario
  const getUserName = (userId) => {
    return teamMembers.find(m => m.userId === userId)?.fullName 
           || localStorage.getItem('userFullName') 
           || `Usuario ${userId}`;
  };

  // Manejar movimiento del mouse
  const handleMouseMove = (e) => {
    if (!cursorContainerRef.current || !socket) return;
    
    const rect = cursorContainerRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width;
    const normalizedY = (e.clientY - rect.top) / rect.height;

    socket.emit('SendMousePosition', { 
      roomId: `team-${partidaId}-${equipoNumero}`,
      userId,
      x: normalizedX,
      y: normalizedY
    });
  };

  // Configuración inicial y listeners
  useEffect(() => {
    if (!socket || !partidaId || !equipoNumero) return;

    // Unirse a la sala del equipo
    socket.emit('JoinTeamRoom', { 
      partidaId, 
      equipoNumero,
      userId 
    });

    // Unirse a la sala general de la partida
    socket.emit('joinPartidaRoom', partidaId);

    // Configurar listeners
    const handleUpdateTeamMembers = (members) => {
      setTeamMembers(members);
    };

    const handleBroadcastMouse = (userId, x, y) => {
      updateCursor(userId, x, y);
    };

    const handleGameChange = (data) => {
      handleGameChangeWithTransition(data);
    };

    const handleTimerUpdate = ({ remaining, total, gameType, difficulty }) => {
      setTimer({
        remaining,
        total,
        active: remaining > 0,
        gameType,
        difficulty
      });
    };

    const handleTimeUp = (gameType) => {
      setTimer(prev => ({
        ...prev,
        remaining: 0,
        active: false
      }));
      
      Swal.fire({
        title: '¡Tiempo terminado!',
        text: `Se ha acabado el tiempo para el juego ${gameType}.`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false
      });
    };

    

    // Configurar listeners
    socket.on('UpdateTeamMembers', handleUpdateTeamMembers);
    socket.on('BroadcastMousePosition', handleBroadcastMouse);
    socket.on('gameChanged', handleGameChange);
    socket.on('timerUpdate', handleTimerUpdate);
    socket.on('timeUp', handleTimeUp);

    // Obtener configuración del juego
    socket.emit('getGameConfig', partidaId, (response) => {
      if (response.error) {
        console.error('Error al obtener configuración:', response.error);
        return;
      }

      if (response.juegos?.length > 0) {
        const initialIndex = response.currentIndex || 0;
        const currentGame = response.juegos[initialIndex];
        
        if (games[currentGame.tipo.toLowerCase()]) {
          setCurrentGameInfo({
            ...games[currentGame.tipo.toLowerCase()],
            config: currentGame.configEspecifica,
            dificultad: currentGame.dificultad,
            tema: currentGame.tema
          });
          
          setGameProgress({
            current: initialIndex + 1,
            total: response.juegos.length
          });
          resetTimer();
        }
      }
    });

    // Agregar listener de movimiento del mouse
    window.addEventListener('mousemove', handleMouseMove);

    // Limpieza
    return () => {
      socket.off('UpdateTeamMembers', handleUpdateTeamMembers);
      socket.off('BroadcastMousePosition', handleBroadcastMouse);
      socket.off('gameChanged', handleGameChange);
      socket.off('timerUpdate', handleTimerUpdate);
      socket.off('timeUp', handleTimeUp);
      
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Limpiar cursores al desmontar
      const container = cursorContainerRef.current;
      if (container) {
        const remoteCursors = container.querySelectorAll('.remote-cursor');
        remoteCursors.forEach(cursor => cursor.remove());
      }
    };
  }, [socket, partidaId, equipoNumero, userId]);

  useEffect(() => {
    if (!socket) return;
  
    const handleTimerUpdate = ({ remaining, total, gameType, difficulty }) => {
      setTimer({
        remaining,
        total,
        active: remaining > 0,
        gameType,
        difficulty
      });
  
      // Verificar si el tiempo llegó a 0 al recibir una actualización
      if (remaining <= 0) {
        handleTimeUp(gameType);
      }
    };
  
    const handleTimeUp = (gameType) => {
      // Evitar mostrar múltiples alerts
      if (window.timeUpAlert) return;
  
      setTimer(prev => ({
        ...prev,
        remaining: 0,
        active: false
      }));
      
      // Mostrar notificación de tiempo terminado (sin timer para que no se cierre solo)
      Swal.fire({
        title: '¡Tiempo terminado!',
        text: `Se ha acabado el tiempo para el juego ${gameType}. El profesor pasará al siguiente juego cuando todos estén listos.`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          // Guardar referencia del alert para cerrarlo luego
          window.timeUpAlert = Swal.getPopup();
        }
      });
    };
  
    // Verificación inicial al cargar el componente
    const checkInitialTimerState = () => {
      // Si el timer ya está en 0 (por ejemplo, al recargar la página)
      if (timer.remaining <= 0 && timer.gameType) {
        handleTimeUp(timer.gameType);
      }
      // Si no hay datos del timer (estado inicial)
      else if (!timer.gameType) {
        // Esperar un momento para recibir la actualización del servidor
        setTimeout(() => {
          if (timer.remaining <= 0 && timer.gameType) {
            handleTimeUp(timer.gameType);
          }
        }, 1000);
      }
    };
  
    socket.on('timerUpdate', handleTimerUpdate);
    socket.on('timeUp', handleTimeUp);
  
    // Solicitar sincronización del tiempo al conectarse
    socket.emit('RequestTimeSync', partidaId);
  
    // Ejecutar la verificación inicial
    checkInitialTimerState();
  
    return () => {
      socket.off('timerUpdate', handleTimerUpdate);
      socket.off('timeUp', handleTimeUp);
      
      // Limpiar el alert al desmontar
      if (window.timeUpAlert) {
        Swal.close();
        window.timeUpAlert = null;
      }
    };
  }, [socket, partidaId, timer.remaining, timer.gameType]);

  // Temporizador
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeElapsed(0);
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
  };

  // Formatear tiempo
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Porcentaje de tiempo restante
  const getTimePercentage = () => {
    if (timer.total === 0) return 100;
    return Math.max(0, (timer.remaining / timer.total) * 100);
  };

  // Transición entre juegos
  // Manejar el cambio de juego con animación
  const handleGameChangeWithTransition = (data) => {
    // 1. Iniciar blur
    setTransitionPhase('blurring');
    
    // Pequeño retraso para que el blur se aplique antes de mostrar el overlay
    setTimeout(() => {
      setTransitionGame({
        ...games[data.currentGame.tipo.toLowerCase()],
        name: data.currentGame.tipo,
        config: data.currentGame.configEspecifica
      });
      setTransitionPhase('showing');
      
      // Ocultar después de 2.5 segundos
      setTimeout(() => {
        setTransitionPhase('hiding');
        
        // Primero quitar el overlay
        setTimeout(() => {
          setTransitionPhase('idle');
          setShowTransition(false);
          
          // Luego quitar el blur después de que el overlay desaparezca
          setTimeout(() => {
            setCurrentGameInfo({
              ...games[data.currentGame.tipo.toLowerCase()],
              config: data.currentGame.configEspecifica,
              dificultad: data.currentGame.dificultad,
              tema: data.currentGame.tema
            });
            setGameProgress({
              current: data.currentIndex + 1,
              total: data.total
            });
          }, 100);
        }, 500); // Duración animación salida
      }, 2500); // Tiempo mostrado
    }, 300); // Tiempo para aplicar blur
  };


  // Pantalla de bienvenida
  useEffect(() => {
    if (!showWelcome) return;
  
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowWelcome(false);
          if (socket) {
            socket.emit('RequestTimeSync', partidaId);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => clearInterval(timer);
  }, [showWelcome, socket, partidaId]);

  // Mostrar ayuda
  const showHelpModal = () => {
    Swal.fire({
      title: 'Ayuda de la Simulación',
      width: '800px',
      html: `
        <div class="help-modal-container">
          <div class="help-tabs">
            <button class="tab-button active" data-tab="general">General</button>
            <button class="tab-button" data-tab="puzzle">Rompecabezas</button>
            <button class="tab-button" data-tab="memory">Memoria</button>
            <button class="tab-button" data-tab="quiz">Ahorcado</button>
            <button class="tab-button" data-tab="scramble">Dibujo</button>
          </div>
          
          <div class="tab-content active" id="general-tab">
            <h3>Cómo funciona la simulación</h3>
            <p>La simulación consiste en una serie de juegos que deben completar en equipo:</p>
            <ul>
              <li>El profesor controla el flujo de los juegos</li>
              <li>Cada juego tiene un tiempo límite</li>
              <li>Deben trabajar en equipo para resolver los desafíos</li>
              <li>Al final se mostrarán los resultados del equipo</li>
            </ul>
            <p><strong>Consejo:</strong> Colaboren y comuníquense bien para obtener mejores resultados.</p>
          </div>
          
          <div class="tab-content" id="puzzle-tab">
            <h3>Juego de Rompecabezas</h3>
            <p>Deben armar un rompecabezas entre todos los miembros del equipo:</p>
            <ul>
              <li>Cada miembro puede mover las piezas asignadas</li>
              <li>Las piezas se encajan cuando están en la posición correcta</li>
              <li>El tiempo comienza cuando el profesor inicia el juego</li>
            </ul>
            <p><strong>Consejo:</strong> Completen primero las esquinas para finalizar con el centro</p>
          </div>
          
          <div class="tab-content" id="memory-tab">
            <h3>Juego de Memoria</h3>
            <p>Encuentren las parejas de cartas:</p>
            <ul>
              <li>Todos pueden voltear las cartas cuando gusten</li>
              <li>Si hacen pareja, las cartas permanecen visibles</li>
              <li>El objetivo es encontrar todas las parejas en el menor tiempo posible</li>
            </ul>
          </div>
          
          <div class="tab-content" id="quiz-tab">
            <h3>Juego del Ahorcado</h3>
            <p>Adivinen la palabra!:</p>
            <ul>
              <li>Tendran una palabra y 10 intentos</li>
              <li>Entre todos piensen en cual palabra o frase puede ser</li>
              <li>Si pierden tendran que continuar, tengan en mente el tiempo</li>
            </ul>
          </div>
          
          <div class="tab-content" id="scramble-tab">
            <h3>Juego de dibujo</h3>
            <p>Dejen volar su imaginacion y trabajo en equipo:</p>
            <ul>
              <li>Tendran un tema especifico</li>
              <li>Deben dibujar entre todos aquel tema</li>
              <li>Al finalizar el tiempo o cuando el profesor decida tendran que exponer su dibujo</li>
            </ul>
          </div>
        </div>
      `,
      showConfirmButton: false,
      didOpen: () => {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
          });
        });
      }
    });
  };

  // Pantalla de bienvenida
  if (showWelcome) {
    return (
      <LayoutSimulation>
        <div className="welcome-screen">
          <div className="welcome-content">
            <h1>¡Bienvenidos!</h1>
            <p>El juego comenzará en {countdown} segundos</p>
            
            <div className="team-section">
              <h2>Equipo {equipoNumero}</h2>
              <div className="team-members">
                {teamMembers.map((member, index) => (
                  <div key={index} className="member">
                    {member.fullName} {member.userId === userId && "(Tú)"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LayoutSimulation>
    );
  }

  return (
    <LayoutSimulation>
      <div className="team-room-container">
        {/* Overlay de transición */}
        <div className={`game-transition_overlay ${
          transitionPhase === 'showing' ? '_showing' : 
          transitionPhase === 'hiding' ? '_hiding' : ''
        }`}>
          {transitionGame && (
            <div className="game-transition_content">
              <div className="game-transition_icon">
                {transitionGame.icon}
              </div>
              <div className="game-transition_text">
                Siguiente Juego:
              </div>
              <div className="game-transition_name">
                {transitionGame.name}
              </div>
            </div>
          )}
        </div>   

        {/* Área del juego */}
        <div ref={cursorContainerRef} className="game-container">
          {/* Header del equipo */}
          <div className="team-room-header">
            <h1>Equipo {equipoNumero}</h1>
            {currentGameInfo && (
              <div className="game-progress">
                Juego {gameProgress.current} de {gameProgress.total}
              </div>
            )}
          </div>

          {/* Efecto blur durante transición */}
          <div className={`game-display ${
              (transitionPhase === 'blurring' || transitionPhase === 'showing') ? '_blurring' : ''
            }`}>
              {currentGameInfo ? (
                <>
                  {currentGameInfo.name.toLowerCase().includes('dibujo') ? (
                    <DrawingGame 
                      key={`drawing-${partidaId}-${equipoNumero}`}
                      gameConfig={currentGameInfo}
                      onGameComplete={(result) => {
                        console.log('Dibujo completado:', result);
                      }}
                    />
                  ) : currentGameInfo.name.toLowerCase().includes('memoria') ? (
                    <MemoryGame 
                      key={`memory-${partidaId}-${equipoNumero}`}
                      gameConfig={currentGameInfo} 
                      onGameComplete={(result) => {
                        console.log('Juego completado:', result);
                      }}
                    />
                  ) : currentGameInfo.name.toLowerCase().includes('ahorcado') ? (
                    <HangmanGame 
                      key={`hangman-${partidaId}-${equipoNumero}`}
                      gameConfig={currentGameInfo} 
                      onGameComplete={(result) => {
                        console.log('Juego completado:', result);
                      }}
                    />
                  ) : currentGameInfo.name.toLowerCase().includes('rompecabezas') ? (
                    <PuzzleGame 
                      key={`puzzle-${partidaId}-${equipoNumero}-${Date.now()}`}
                      gameConfig={currentGameInfo} 
                      onGameComplete={(result) => {
                        console.log('Rompecabezas completado:', result);
                      }}
                    />
                  ) : (
                    <div className="game-not-implemented">
                      <h3>Juego {currentGameInfo.name} en desarrollo</h3>
                      <p>Este juego estará disponible pronto</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="waiting-message">
                  <h2>Sala de Espera</h2>
                  <p>Esperando que el profesor inicie los juegos...</p>
                </div>
              )}
          </div>
          
        </div>    

        {/* Panel de información */}
        <div className="info__panel">
          {currentGameInfo ? (
            <>
              <div className="info__section">
                <div className="section__header">
                  <h3>Juego Actual: <br></br> {currentGameInfo.name} <br></br> {currentGameInfo.icon}</h3>
                </div>                
                <div className="game__info">
                  <p>{currentGameInfo.description}</p>                  
                  <div className="game__details">                   
                    <p><strong>Dificultad:</strong> {currentGameInfo.dificultad}</p>
                    <p><strong>Configuración:</strong> {currentGameInfo.config}</p>
                    {currentGameInfo.name.toLowerCase() === 'dibujo' && (
                      <p><strong>Tema:</strong> {currentGameInfo.tema}</p>
                    )}     
                  </div>
                </div>
              </div>                  
              <div className="info__section">
                <div className="section__header">
                  <h3>Miembros del Equipo</h3>
                </div>                
                <ul className="section__members">
                  {teamMembers.map((member, index) => (
                    <li key={index}>
                      {member.fullName} {member.userId === userId && "(Tú)"}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="info__section">
              <div className="section__header">
                <h3>Información</h3>
              </div>              
              <p>Esperando a que todos los miembros se unan al equipo...</p>
            </div>
          )}

          <div className="info__section">
            <div className="section__header">
              <h3>Tiempo Restante</h3>
            </div>            
            <div className="time-display-container">
              <div className={`time-display ${timer.remaining <= 30 && timer.active ? 'low-time' : ''}`}>
                {timer.active ? formatTime(timer.remaining) : '--:--'}
                <div className="time-progress-bar">
                  <div 
                    className={`time-progress-fill ${timer.remaining <= 30 && timer.active ? 'low-time' : ''}`}
                    style={{ width: `${getTimePercentage()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        
          <button 
            className="help__button"
            onClick={showHelpModal}
          >
            <i className="fas fa-question-circle"></i> Ayuda
          </button>
        </div>       
      </div>
    </LayoutSimulation>
  );
};

export default TeamRoom;