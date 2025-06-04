import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Swal from 'sweetalert2';
import "../styles/simulationComponents.css";
import "../styles/teacherComponents.css";
import DrawingDemoView from '../games/DrawingDemoView ';


const TeamProgress = ({ partidaId, currentGameType, socket }) => {
  const [teamProgress, setTeamProgress] = useState({});
  
  useEffect(() => {
    if (!socket) return;
    
    // Función para actualizar el estado con los últimos datos
    const updateProgress = () => {
      socket.emit('getTeamProgress', partidaId, (progress) => {
        setTeamProgress(progress);
      });
    };
    
    // Obtener progreso inicial
    updateProgress();
    
    // Configurar intervalo para actualizaciones periódicas
    const interval = setInterval(updateProgress, 2000); // Actualizar cada 2 segundos
    
    // Escuchar actualizaciones específicas
    const handleProgressUpdate = (data) => {
      if (data.juegoType === currentGameType) {
        setTeamProgress(prev => ({
          ...prev,
          [data.equipoNumero]: {
            ...prev[data.equipoNumero],
            [data.juegoType]: data.progress
          }
        }));
      }
    };
    
    socket.on('teamProgressUpdate', handleProgressUpdate);
    
    return () => {
      clearInterval(interval);
      socket.off('teamProgressUpdate', handleProgressUpdate);
    };
  }, [socket, partidaId, currentGameType]);
  
  // Ordenar equipos por número
  const sortedTeams = Object.keys(teamProgress)
    .map(Number)
    .sort((a, b) => a - b)
    .filter(team => teamProgress[team][currentGameType] !== undefined);
  
  if (sortedTeams.length === 0) {
    return (
      <div className="no-progress-message">
        <p>Los equipos aparecerán aquí cuando comiencen a jugar</p>
      </div>
    );
  }
  
  return (
    <div className="team-progress-container">
      {sortedTeams.map(team => (
        <div key={team} className="team-progress-item">
          <div className="team-header">
            <span className="team-name">Equipo {team}</span>
            {teamProgress[team][currentGameType] !== undefined ? (
              <span className="team-progress-value">
                {teamProgress[team][currentGameType]}%
              </span>
            ) : (
              <span className="team-inactive">Conectado</span>
            )}
          </div>
          {teamProgress[team][currentGameType] !== undefined ? (
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${teamProgress[team][currentGameType]}%` }}
              ></div>
            </div>
          ) : (
            <div className="progress-bar inactive">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const SimulationProfessor = () => {
  const { partidaId } = useParams();
  const socket = useSocket();
  const [gameConfig, setGameConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionGame, setTransitionGame] = useState(null);
  const [groups, setGroups] = useState([]); // Estado para los grupos
  const transitionTimeoutRef = useRef(null);
  const [currentDate] = useState(new Date().toLocaleDateString());
  const [timer, setTimer] = useState({
    remaining: 0,
    total: 0,
    active: false,
    gameType: '',
    difficulty: ''
  });

  const [demoDrawings, setDemoDrawings] = useState({});
  const [currentDemoTeam, setCurrentDemoTeam] = useState(1);
  const [showDemo, setShowDemo] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const [totalDemoTeams, setTotalDemoTeams] = useState(0);
  const [drawingDemonstration, setDrawingDemonstration] = useState({});

  const [demoState, setDemoState] = useState({
    active: false,
    currentTeam: 1,
    totalTeams: 0,
    teams: []
  });

  

  useEffect(() => {
    if (!socket) return;
  
    // Verificar si hay demo activa al cargar
    socket.emit('checkActiveDemo', partidaId, (response) => {
      if (response.active) {
        setDemoState({
          active: true,
          currentTeam: response.currentTeam,
          totalTeams: response.totalTeams,
          teams: response.teams
        });
      }
    });

    

  
    const handleDemoStarted = ({ currentTeam, totalTeams, teams }) => {
      setDemoState({
        active: true,
        currentTeam,
        totalTeams,
        teams
      });
      setDemoActive(true);
    };
  
    const handleTeamChanged = ({ currentTeam, teamIndex, totalTeams }) => {
      setDemoState(prev => ({
        ...prev,
        currentTeam,
        teamIndex
      }));
    };
  
    const handleDemoEnded = () => {
      setDemoState({
        active: false,
        currentTeam: 1,
        totalTeams: 0,
        teams: []
      });
      setDemoActive(false);
    };
  
    socket.on('demoStarted', handleDemoStarted);
    socket.on('demoTeamChanged', handleTeamChanged);
    socket.on('demoEnded', handleDemoEnded);
  
    return () => {
      socket.off('demoStarted', handleDemoStarted);
      socket.off('demoTeamChanged', handleTeamChanged);
      socket.off('demoEnded', handleDemoEnded);
    };
  }, [socket, partidaId]);



  
  const changeDemoTeam = (direction) => {
    const currentIndex = demoState.teams.indexOf(demoState.currentTeam);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % demoState.teams.length;
    } else {
      newIndex = (currentIndex - 1 + demoState.teams.length) % demoState.teams.length;
    }
    
    const newTeam = demoState.teams[newIndex];
    socket.emit('changeDemoTeam', { partidaId, equipoNumero: newTeam });
  };

// Efectos para sincronización
// Reemplazar el useEffect que maneja la demostración
useEffect(() => {
    if (!socket) return;

    const handleDemoStarted = ({ currentTeam, totalTeams }) => {
      setDemoState(prev => ({
        ...prev,
        active: true,
        currentTeam,
        totalTeams,
        teamIndex: 1
      }));
      loadCurrentDrawing(currentTeam);
    };

    const handleTeamChanged = ({ currentTeam, teamIndex }) => {
      setDemoState(prev => ({
        ...prev,
        currentTeam,
        teamIndex
      }));
      loadCurrentDrawing(currentTeam);
    };

    const handleDemoEnded = () => {
      setDemoState({
        active: false,
        currentTeam: null,
        totalTeams: 0,
        currentDrawing: null,
        teamIndex: 0
      });
    };

    socket.on('drawingDemoStarted', handleDemoStarted);
    socket.on('drawingDemoTeamChanged', handleTeamChanged);
    socket.on('drawingDemoEnded', handleDemoEnded);

    return () => {
      socket.off('drawingDemoStarted', handleDemoStarted);
      socket.off('drawingDemoTeamChanged', handleTeamChanged);
      socket.off('drawingDemoEnded', handleDemoEnded);
    };
  }, [socket, partidaId]);

  const loadCurrentDrawing = (team) => {
    socket.emit('getCurrentDrawing', partidaId, ({ imageData }) => {
      setDemoState(prev => ({
        ...prev,
        currentDrawing: imageData
      }));
    });
  };

  const startDemo = () => {
    Swal.fire({
      title: '¿Iniciar demostración de dibujos?',
      text: 'Se mostrarán los dibujos de todos los equipos en orden',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Iniciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        socket.emit('startDrawingDemo', partidaId, (response) => {
          if (response.error) {
            Swal.fire('Error', response.error, 'error');
          }
        });
      }
    });
  };


  // Agrega esto cerca de los otros efectos
useEffect(() => {
  if (!socket) return;

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Solo sincronizar si el temporizador está activo
      if (timer.active) {
        console.log('Solicitando sincronización de tiempo...');
        socket.emit('RequestTimeSync', partidaId);
      }
    }
  };

  // Agregar el event listener
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    // Limpiar el event listener
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [socket, partidaId, timer.active]);

// 3. Función para calcular el tiempo inicial
const calculateGameTime = (gameType, difficulty) => {
  const difficultyLower = difficulty.toLowerCase();
  
  if (gameType === 'Dibujo' || gameType === 'Ahorcado') {
    return {
      'fácil': 7 * 60,
      'facil': 7 * 60,
      'normal': 5 * 60,
      'difícil': 3 * 60,
      'dificil': 3 * 60
    }[difficultyLower] || 5 * 60;
  }
  return 4.5 * 60; // Memoria y Rompecabezas
};

// Función para formatear el tiempo
const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 2. Efecto para manejar actualizaciones del temporizador
useEffect(() => {
  if (!socket) return;

  const handleTimerUpdate = (data) => {
    console.log('Actualización de temporizador recibida:', data);
    setTimer({
      remaining: data.remaining,
      total: data.total,
      active: data.remaining > 0,
      gameType: data.gameType,
      difficulty: data.difficulty,
    });

  };

  socket.on('timerUpdate', handleTimerUpdate);
  socket.emit('RequestTimeSync', partidaId);

  return () => {
    socket.off('timerUpdate', handleTimerUpdate);
  };
}, [socket, partidaId, gameConfig]);

useEffect(() => {
  if (!socket) return;

  const handleGameConfig = (response) => {
    if (response.error) return;
    
    if (response.juegos?.length > 0) {
      const firstGame = response.juegos[response.currentIndex || 0];
      const initialTime = calculateGameTime(firstGame.tipo, firstGame.dificultad);
      
      setTimer({
        remaining: initialTime,
        total: initialTime,
        active: true,
        gameType: firstGame.tipo,
        difficulty: firstGame.dificultad
      });
    }
  };

  socket.emit('getGameConfig', partidaId, handleGameConfig);
}, [socket, partidaId]);



// Reemplaza todos los useEffect del timer con este único efecto
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
  };

  const handleTimeUp = async (gameType) => {
    setTimer(prev => ({
      ...prev,
      remaining: 0,
      active: false
    }));
    
    // Mostrar notificación de tiempo terminado
    await Swal.fire({
      title: '¡Tiempo terminado!',
      text: `Se ha acabado el tiempo para el juego ${gameType}`,
      icon: 'info',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false
    });

    // Solo avanzar si no es el último juego
    if (gameConfig?.currentIndex < gameConfig?.juegos?.length - 1) {
      handleAutoNextGame();
    }
  };

  socket.on('timerUpdate', handleTimerUpdate);
  socket.on('timeUp', handleTimeUp);
  socket.emit('RequestTimeSync', partidaId);

  return () => {
    socket.off('timerUpdate', handleTimerUpdate);
    socket.off('timeUp', handleTimeUp);
  };
}, [socket, partidaId, gameConfig]);

useEffect(() => {
  if (!timer.active) return;

  const interval = setInterval(() => {
    setTimer((prev) => {
      const newRemaining = Math.max(prev.remaining - 1, 0);
      
      // Solo actualiza el estado, no maneja el cambio de juego aquí
      return {
        ...prev,
        remaining: newRemaining,
      };
    });
  }, 1000);

  return () => clearInterval(interval);
}, [timer.active]);

const TimerDisplay = () => {
  // Efecto para animación cuando el tiempo es crítico
  useEffect(() => {
    if (timer.remaining <= 30 && timer.active) {
      const timerElement = document.querySelector('.time-display.low-time');
      if (timerElement) {
        timerElement.classList.add('pulse');
        setTimeout(() => timerElement.classList.remove('pulse'), 1000);
      }
    }
  }, [timer.remaining]);

  return (
    <div className="timer-container">
      <div className={`time-display ${timer.remaining <= 30 && timer.active ? 'low-time' : ''}`}>
        {formatTime(timer.remaining)}
      </div>
      <div className="time-details">
        <span className="time-game-type">{timer.gameType}</span>
        {timer.difficulty && (
          <span className="time-difficulty">({timer.difficulty})</span>
        )}
      </div>
      <div className="time-progress-bar">
        <div 
          className={`time-progress-fill ${timer.remaining <= 30 && timer.active ? 'low-time' : ''}`}
          style={{ width: `${(timer.remaining / timer.total) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

const handleAutoNextGame = () => {
  if (!gameConfig || gameConfig.currentIndex >= gameConfig.juegos.length - 1) {
    return;
  }

  const newIndex = gameConfig.currentIndex + 1;
  const nextGame = gameConfig.juegos[newIndex];
  
  // Mostrar transición
  setTransitionGame({
    tipo: nextGame.tipo,
    configEspecifica: nextGame.configEspecifica,
    dificultad: nextGame.dificultad,
    tema: nextGame.tema
  });
  setShowTransition(true);
  
  // Enviar petición al backend
  socket.emit('nextGame', partidaId, (response) => {
    if (response.error) {
      console.error('Error al cambiar de juego:', response.error);
      setError(response.error);
      setShowTransition(false);
    } else {
      // Actualizar estado local después de la transición
      setTimeout(() => {
        setShowTransition(false);
        updateGameState(newIndex);
        
        // No necesitamos configurar el timer aquí, 
        // el servidor enviará la actualización
      }, 3000);
    }
  });
};


  // Función para actualizar el estado local y global
  const updateGameState = (currentIndex) => {
    setGameConfig(prev => ({
      ...prev,
      currentIndex: currentIndex
    }));
    
    if (global.partidasConfig && global.partidasConfig[partidaId]) {
      global.partidasConfig[partidaId].currentIndex = currentIndex;
    }
  };

  // Manejar el cambio de juego con animación
  const handleGameChangeWithTransition = (data) => {
    console.log('Actualización de juego recibida:', data);
    
    setTransitionGame({
      tipo: data.currentGame.tipo,
      configEspecifica: data.currentGame.configEspecifica,
      dificultad: data.currentGame.dificultad,
      tema: data.currentGame.tema
    });
    setShowTransition(true);
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    transitionTimeoutRef.current = setTimeout(() => {
      setShowTransition(false);
      updateGameState(data.currentIndex);
    }, 3000);
  };

  useEffect(() => {
    if (!socket) return;
  
    setLoading(true);
    setError(null);
  
    // Obtener configuración inicial
    const fetchGameConfig = () => {
      socket.emit('getGameConfig', partidaId, (response) => {
        if (response.error) {
          console.error('Error al obtener configuración:', response.error);
          setError(response.error);
          setLoading(false);
          return;
        }
    
        if (!response.juegos || response.juegos.length === 0) {
          const errorMsg = 'No hay juegos configurados para esta partida';
          console.error(errorMsg);
          setError(errorMsg);
          setLoading(false);
          return;
        }
    
        // Guardar configuración global
        if (!global.partidasConfig) global.partidasConfig = {};
        global.partidasConfig[partidaId] = {
          juegos: response.juegos,
          currentIndex: response.currentIndex || 0,
          profesorId: response.profesorId
        };
    
        // Actualizar estado local
        setGameConfig({
          juegos: response.juegos,
          currentIndex: response.currentIndex || 0,
          total: response.juegos.length
        });
        setLoading(false);
      });
    };

    // Obtener lista de grupos
    const fetchGroups = () => {
      socket.emit('getGroups', partidaId, (response) => {
        if (!response.error) {
          setGroups(response.groups);
        }
      });
    };

    fetchGameConfig();
    fetchGroups();
  
    // Escuchar actualizaciones de juego
    socket.on('gameChanged', handleGameChangeWithTransition);
  
    return () => {
      socket.off('gameChanged', handleGameChangeWithTransition);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [socket, partidaId]);

  const nextGame = () => {
    if (!gameConfig) return;
  
    Swal.fire({
      title: 'Confirmar cambio de juego',
      text: '¿Estás seguro que deseas avanzar al siguiente juego?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, avanzar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const newIndex = gameConfig.currentIndex + 1;
        updateGameState(newIndex);
        setDemoActive(false);
        
        const nextGame = gameConfig.juegos[newIndex];
        setTransitionGame({
          tipo: nextGame.tipo,
          configEspecifica: nextGame.configEspecifica,
          dificultad: nextGame.dificultad,
          tema: nextGame.tema
        });
        setShowTransition(true);
        
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
        
        transitionTimeoutRef.current = setTimeout(() => {
          setShowTransition(false);
        }, 3000);
        
        socket.emit('nextGame', partidaId, (response) => {
          if (response.error) {
            console.error(response.error);
            setError(response.error);
            Swal.fire('Error', 'No se pudo cambiar al siguiente juego', 'error');
            updateGameState(gameConfig.currentIndex - 1);
          }
        });
      }
    });
  };

  const finishGame = () => {
    Swal.fire({
      title: 'Finalizar partida',
      text: '¿Estás seguro que deseas finalizar la partida? Esto no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        socket.emit('finishGame', partidaId, (response) => {
          if (response.error) {
            Swal.fire('Error', 'No se pudo finalizar la partida', 'error');
          } else {
            Swal.fire('Éxito', 'Partida finalizada correctamente', 'success').then(() => {
              window.location.href = '/professor/dashboard';
            });
          }
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando configuración de juegos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/professor/dashboard'}>Volver al dashboard</button>
      </div>
    );
  }

  if (!gameConfig) {
    return (
      <div className="error-screen">
        <h2>Error de configuración</h2>
        <p>No hay configuración de juegos disponible</p>
      </div>
    );
  }

  const currentGame = gameConfig.juegos[gameConfig.currentIndex];

  if (!currentGame) {
    return (
      <div className="error-screen">
        <h2>Error</h2>
        <p>No se pudo cargar el juego actual</p>
      </div>
    );
  }

  const completionPercentage = Math.round(((gameConfig.currentIndex + 1) / gameConfig.total) * 100);

  const startDrawingDemonstration = () => {
    Swal.fire({
      title: '¿Iniciar demostración?',
      text: 'Mostrará los dibujos de todos los equipos en orden',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Iniciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        socket.emit('startDrawingDemo', partidaId);
      }
    });
  };

  return (
    <div className="professor-dashboard">
      {/* Overlay de transición */}
      {showTransition && transitionGame && (
        <div className="game-transition-overlay">
          <div className="game-transition-content">
            <div className="transition-game-icon">
              <i className="fas fa-gamepad"></i>
            </div>
            <div className="transition-game-text">
              Siguiente Juego:<br />
              <span className="transition-game-name">{transitionGame.tipo}</span>
            </div>
          </div>
        </div>
      )}
  
      {/* Header */}
      <header className="header">
        <div className="header__heading">
          <div>
            <h1 className="heading__title">FideColab - Partida Personalizada</h1>
          </div>
          <div className="heading__text">
            <span>Fecha: </span>
            <span>{currentDate}</span>
          </div>   
        </div>
      </header>
  
      {/* Contenido principal */}
      <div className="dashboard-content">
        {/* Sección izquierda - Información y controles */}
        {!demoActive ? (
          <>
            <div className="control-panel">
              <div className="info-section">
                <div className="content__box">
                  <div className="box__title">
                    <h3>Información de la partida</h3>
                  </div>
                  <div className="box__information">
                    <div className="information__text">
                      <span>Grupo: </span>
                      <span>{partidaId}</span>
                    </div>
                    <div className="information__text">
                      <span>Juego actual: </span>
                      <span>{currentGame.tipo || 'No especificado'}</span>
                    </div>
                    <div className="information__text">
                      <span>Dificultad: </span>
                      <span>{currentGame.dificultad || 'No especificada'}</span>
                    </div>
                    {currentGame.tipo.toLowerCase() === 'dibujo' && (
                      <div className="information__text">
                        <span>Tema: </span>
                        <span>{currentGame.tema || 'No especificado'}</span>
                      </div>
                    )}
                    <div className="timer-section">
                      <h4>Tiempo restante:</h4>
                      <TimerDisplay />
                    </div>
                  </div>
                </div>
              </div>
  
              <div className="progress-section">
                <div className="content__box">
                  <div className="box__title">
                    <h3>Progreso de la partida</h3>
                  </div>
                  <div className="box__percentage">
                    <div 
                      className="bar__progress" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                    <div className="percentage__text">
                      {completionPercentage}% completado ({gameConfig.currentIndex + 1} de {gameConfig.total} juegos)
                    </div>
                  </div>
                </div>
              </div>
  
              <div className="options-section">
                <div className="content__box">
                  <div className="box__title">
                    <h3>Opciones</h3>
                  </div>
                  <div className="box__options"> 
                    <div className="option__button">
                      <button 
                        onClick={nextGame}
                        disabled={gameConfig.currentIndex >= gameConfig.juegos.length - 1 || showTransition}
                        className={gameConfig.currentIndex >= gameConfig.juegos.length - 1 ? 'disabled-button' : ''}
                      >
                        {gameConfig.currentIndex >= gameConfig.juegos.length - 1 ? 
                          'Todos completados' : 
                          'Siguiente juego'}
                      </button> 
                    </div>
                    {currentGame.tipo.toLowerCase() === 'dibujo' && (
                      <div className="option__button">
                        <button 
                          onClick={() => {
                            setDemoActive(true);
                            socket.emit('startDrawingDemo', partidaId);
                          }}
                          disabled={showTransition}
                        >
                          Iniciar Demostración
                        </button>
                      </div>
                    )}
                    <div className="option__button">
                      <button onClick={finishGame} className="finish-button">
                        Finalizar partida
                      </button> 
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Componente de demostración de dibujos */}
            {currentGame.tipo.toLowerCase() === 'dibujo' && (
              <DrawingDemoView 
                partidaId={partidaId} 
                gameConfig={currentGame} 
                onDemoStart={() => setDemoActive(true)}
              />
            )}
  
            {/* Sección derecha - Lista de grupos */}
            <div className="groups-panel">
              <div className="content__box">
                <div className="box__title">
                  <h3>Grupos Participantes</h3>
                </div>
                <div className="groups-list">
                <div className="progress-section">
                  <div className="content__box">
                    <div className="box__title">
                      <h3>Progreso de los Equipos</h3>
                    </div>
                    <div className="box__content">
                      <TeamProgress 
                        partidaId={partidaId} 
                        currentGameType={currentGame.tipo} 
                        socket={socket} 
                      />
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Vista completa de demostración cuando está activa */
          <div className="full-demo-view">
            <div className="demo-header">
              <h2>Demostración de Dibujos</h2>
              <div className="demo-team-counter">
                Equipo {currentDemoTeam} de {totalDemoTeams}
              </div>
            </div>
  
            <div className="demo-main-content">
              <div className="demo-image-container">
                {demoDrawings[currentDemoTeam] ? (
                  <img 
                    src={demoDrawings[currentDemoTeam]} 
                    alt={`Dibujo del Equipo ${currentDemoTeam}`}
                    className="demo-image"
                  />
                ) : (
                  <div className="no-drawing">
                    <i className="fas fa-image"></i>
                    <p>Este equipo no ha subido dibujo</p>
                  </div>
                )}
              </div>
  
              <div className="demo-controls">
                <button 
                  onClick={() => changeDemoTeam('prev')}
                  disabled={currentDemoTeam <= 1}
                  className="demo-nav-button prev-button"
                >
                  <i className="fas fa-chevron-left"></i> Anterior
                </button>
                
                <button 
                  onClick={nextGame}
                  disabled={gameConfig.currentIndex >= gameConfig.juegos.length - 1 || showTransition}
                  className={gameConfig.currentIndex >= gameConfig.juegos.length - 1 ? 'disabled-button' : ''}
                >
                  {gameConfig.currentIndex >= gameConfig.juegos.length - 1 ? 
                    'Todos completados' : 
                    'Siguiente juego'}
                </button> 
                
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `dibujo-equipo-${currentDemoTeam}.png`;
                    link.href = demoDrawings[currentDemoTeam];
                    link.click();
                  }}
                  className="download-button"
                  disabled={!demoDrawings[currentDemoTeam]}
                >
                  <i className="fas fa-download"></i> Descargar
                </button>
                
                <button 
                  onClick={() => changeDemoTeam('next')}
                  disabled={currentDemoTeam >= totalDemoTeams}
                  className="demo-nav-button next-button"
                >
                  Siguiente <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationProfessor;