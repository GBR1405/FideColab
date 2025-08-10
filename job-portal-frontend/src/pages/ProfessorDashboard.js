import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import ProfessorDrawingViewer from '../games/DrawingLiveViewer';
import Swal from 'sweetalert2';
import "../styles/simulationComponents.css";
import "../styles/teacherComponents.css";
import "../styles/animationRecharge.css";
import Cookies from "js-cookie";
import DrawingDemoModal from '../games/DrawingDemoModal';

const apiUrl = process.env.REACT_APP_API_URL;
const token = Cookies.get("authToken");

const TeamProgress = ({ partidaId, currentGameType, socket }) => {
  const [teamProgress, setTeamProgress] = useState({});
  const [allTeams, setAllTeams] = useState([]);
  const [prevPositions, setPrevPositions] = useState({});


  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      navigate('/', { replace: true });
    };

    // Bloquear retroceso
    window.addEventListener('popstate', handlePopState);

    // Reemplazar la entrada actual en el historial (para evitar que "volver" lo lleve a atrás)
    window.history.replaceState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    if (!socket || !partidaId) return;

    // 1. Obtener todos los equipos
    socket.emit('getTeamsForPartida', partidaId, (response) => {
      if (response.success) {
        setAllTeams(response.equipos);
      }
    });

    // 2. Obtener progreso actual
    const updateProgress = () => {
      socket.emit('getTeamProgress', partidaId, (progress) => {
        setTeamProgress(progress);
      });
    };

    updateProgress();
    const interval = setInterval(updateProgress, 2000);

    return () => clearInterval(interval);
  }, [socket, partidaId]);

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
    const interval = setInterval(updateProgress, 1000); // Actualizar cada 2 segundos

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
  const sortedTeams = [...allTeams].sort((a, b) => {
    const progressA = teamProgress[a]?.[currentGameType] ?? 0;
    const progressB = teamProgress[b]?.[currentGameType] ?? 0;
    return progressB - progressA;
  });

  useEffect(() => {
    const currentPositions = {};
    sortedTeams.forEach((team, index) => {
      currentPositions[team] = index;
    });

    setPrevPositions(prev => {
      const newPrev = { ...prev };
      Object.keys(currentPositions).forEach(team => {
        if (prev[team] !== undefined && prev[team] !== currentPositions[team]) {
          // Guardamos la dirección del movimiento para la animación
          newPrev[team] = {
            position: prev[team],
            direction: prev[team] > currentPositions[team] ? 'up' : 'down'
          };
        } else {
          newPrev[team] = {
            position: currentPositions[team],
            direction: null
          };
        }
      });
      return newPrev;
    });
  }, [sortedTeams]);


  if (sortedTeams.length === 0) {
    return (
      <div className="no-progress-message">
        <p>Los equipos aparecerán aquí cuando comiencen a jugar</p>
      </div>
    );
  }

  return (
    <div className="team-progress-container">
      {sortedTeams.map((team, index) => {
        const prevPosition = prevPositions[team]?.position;
        const direction = prevPositions[team]?.direction;

        // Determinar clase de animación
        const animationClass = direction === 'up' ? 'move-up' :
          direction === 'down' ? 'move-down' : '';

        // Ahorcado: mostrar correctas vs errores
        if (currentGameType === 'Ahorcado') {
          const ahorcadoData = teamProgress[team]?.Ahorcado ?? {};
          const letrasEncontradas = ahorcadoData.correctas ?? 0;
          const letrasErradas = ahorcadoData.errores ?? 0;
          const total = letrasEncontradas + letrasErradas || 1;

          const porcentajeCorrectas = (letrasEncontradas / total) * 100;
          const porcentajeErrores = (letrasErradas / total) * 100;

          return (
            <div key={team} className={`team-card ${animationClass}`}>
              <div className="team-header">
                <div>
                  <span className="position-indicator">{index + 1}</span>
                  <span className="team-name">Equipo {team}</span>
                </div>
                <span className="team-progress-value">
                  Letras encontradas: {letrasEncontradas} / Errores: {letrasErradas}
                </span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-fill correct"
                  style={{ width: `${porcentajeCorrectas}%` }}
                ></div>
                <div
                  className="progress-fill wrong"
                  style={{ width: `${porcentajeErrores}%` }}
                ></div>
              </div>
            </div>
          );
        }

        // Otros juegos: barra de progreso normal
        const progress = teamProgress[team]?.[currentGameType];

        // Otros juegos: barra de progreso normal
        return (
          <div key={team} className={`team-card ${animationClass}`}>
            <div className="team-header">
              <div>
                <span className="position-indicator">{index + 1}</span>
                <span className="team-name">Equipo {team}</span>
              </div>
              {progress !== undefined ? (
                <span className="team-progress-value">
                  {progress}%
                </span>
              ) : (
                <span className="team-inactive">Conectado</span>
              )}
            </div>
            {progress !== undefined ? (
              <div className="progress-bar-container">
                <div
                  className="progress-fill normal"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            ) : (
              <div className="progress-bar-container inactive">
                <div className="progress-fill" style={{ width: '0%' }}></div>
              </div>
            )}
          </div>
        );
      })}
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
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDrawingLines, setTeamDrawingLines] = useState(null);
  const [drawingsByTeam, setDrawingsByTeam] = useState({});
  const userId = localStorage.getItem('userId');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showProfessorModal, setShowProfessorModal] = useState(false);
  const [isStudentDemoActive, setIsStudentDemoActive] = useState(false);


  // 1. Simplifica los estados de demo a uno solo
  const [demoState, setDemoState] = useState({
    active: false,
    currentTeam: null,
    totalTeams: 0,
    teams: []
  });



  const transitionTimeout = 3000;


  useEffect(() => {
    if (!socket || !partidaId) return;

    // Terminar cualquier demo activa al recargar/montar el componente
    socket.emit('endDrawingDemo', partidaId, (response) => {
      if (response?.success) {
        setIsStudentDemoActive(false);
        setShowProfessorModal(false);
      }
    });

    // ...resto del código del useEffect existente...
  }, [socket, partidaId]);



  useEffect(() => {
    // Resetear el estado del modal al cargar el componente
    setDemoActive(false);

    // Resto de tu lógica de inicialización...
  }, []);



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

    // Verificar estado inicial de la demo
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

    const handleDemoStarted = (data) => {
      setDemoState({
        active: true,
        currentTeam: data.currentTeam,
        totalTeams: data.totalTeams,
        teams: data.teams || []
      });
    };

    const handleDemoEnded = () => {
      setDemoState({
        active: false,
        currentTeam: null,
        totalTeams: 0,
        teams: []
      });
    };

    socket.on('drawingDemoStarted', handleDemoStarted);
    socket.on('drawingDemoEnded', handleDemoEnded);

    return () => {
      socket.off('drawingDemoStarted', handleDemoStarted);
      socket.off('drawingDemoEnded', handleDemoEnded);
    };
  }, [socket, partidaId]);

  const loadCurrentDrawing = (team) => {
    socket.emit('getCurrentDrawing', partidaId, team, (response) => {
      if (response.success) {
        setDemoState(prev => ({
          ...prev,
          currentDrawing: response.imageData
        }));
      }
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
        setShowDemoModal(true);
        socket.emit('startDrawingDemo', partidaId, (response) => {
          if (response.error) {
            Swal.fire('Error', response.error, 'error');
          }
        });
      }
    });
  };

  useEffect(() => {
    if (!socket || !partidaId || !selectedTeam) return;

    const interval = setInterval(() => {
      socket.emit(
        'getTeamDrawingForProfessor',
        { partidaId, equipoNumero: selectedTeam },
        (response) => {
          if (response.success && response.linesByUser) {
            setTeamDrawingLines(response.linesByUser);
          } else {
            setTeamDrawingLines({});
          }
        }
      );
    }, 500); // actualiza cada 0.5 segundos

    return () => clearInterval(interval); // detiene polling al cambiar de equipo
  }, [socket, partidaId, selectedTeam]);

  // Agrega esto cerca de los otros efectos
  useEffect(() => {
    if (!socket) return;

    const handleTeamSelection = (e) => {
      const equipo = parseInt(e.target.value);
      setSelectedTeam(equipo);
      setTeamDrawingLines(null); // limpia antes de cargar nuevo
    };

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


  useEffect(() => {
    if (!socket || !partidaId || !gameConfig?.juegos || gameConfig.currentIndex == null) return;

    // Función para calcular tiempo inicial
    const currentGame = gameConfig.juegos[gameConfig.currentIndex];
    if (!currentGame) return;

    const initialTime = calculateGameTime(
      currentGame.tipo,
      currentGame.dificultad,
      currentGame.configEspecifica
    );

    setTimer({
      remaining: initialTime,
      total: initialTime,
      active: true,
      gameType: currentGame.tipo,
      difficulty: currentGame.dificultad
    });

  }, [gameConfig?.currentIndex, gameConfig?.juegos]);


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
        socket.emit('getGameConfig', partidaId, handleGameConfig);
      } catch (error) {
        console.error('Error al verificar estado de la partida:', error);
      }
    };

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

    verificarEstadoPartida(); // Llamado antes del emit
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

      // ✅ ESTA es la única parte que debe cambiar el índice
      setGameConfig(prev => ({
        ...prev,
        currentIndex: data.currentIndex
      }));
    }, 3000);
  };

  useEffect(() => {
    if (!socket || !partidaId) return;

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

        // ✅ Solo continuar si NO está finalizada
        setLoading(true);
        setError(null);

        // Obtener configuración inicial
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

      } catch (error) {
        console.error('Error al verificar estado de la partida:', error);
      }
    };

    verificarEstadoPartida(); // ✅ ahora sí: toda la lógica está controlada
  }, [socket, partidaId]);

  useEffect(() => {
    if (!socket || !partidaId) return;
  }, [socket, partidaId]);

  useEffect(() => {
    if (socket && gameConfig) {
      // Inicializar estructura de dibujos para el profesor
      socket.emit('initProfessorDrawing', { partidaId });
    }
  }, [socket, gameConfig, partidaId]);

  useEffect(() => {
    if (!socket || !partidaId) return;

    let polling = null;

    const startPolling = () => {
      if (polling) return;

      polling = setInterval(() => {
        socket.emit('getGameConfig', partidaId, (response) => {
          if (!response || !response.juegos || response.currentIndex == null) return;

          const currentGame = response.juegos[response.currentIndex];

          if (!currentGame || typeof currentGame.tipo !== 'string') return;

          if (currentGame.tipo.toLowerCase() === 'dibujo') {
            socket.emit('getAllDrawingsForProfessor', partidaId, (drawingsRes) => {
              if (drawingsRes.success) {
                setDrawingsByTeam(drawingsRes.drawingsByTeam);
              }
            });
          }
        });
      }, 2000); // cada 2 segundos
    };

    startPolling();

    return () => {
      if (polling) clearInterval(polling);
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
          } else {


            setTimeout(() => {
              socket.emit('RequestTimeSync', partidaId);
            }, 2000);
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
        // Mostrar mensaje de espera
        Swal.fire({
          title: 'Finalizando partida',
          html: 'Se está finalizando la partida, espere por favor...',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        socket.emit('finishGame', partidaId, (response) => {
          // Cerrar el mensaje de espera antes de mostrar el resultado
          Swal.close();

          if (response.error) {
            Swal.fire('Error', 'No se pudo finalizar la partida', 'error');
          } else {
            // Mostrar pantalla con temporizador visual
            Swal.fire({
              title: '🎉 Partida finalizada con éxito',
              html: 'Serás redirigido a los resultados en <b>8</b> segundos...',
              icon: 'success',
              timer: 8000,
              timerProgressBar: true,
              allowOutsideClick: false,
              allowEscapeKey: false,
              showConfirmButton: false,
              didOpen: () => {
                Swal.showLoading();
                const content = Swal.getHtmlContainer();
                const b = content.querySelector('b');
                let timeLeft = 8;
                const interval = setInterval(() => {
                  timeLeft--;
                  if (b) b.textContent = timeLeft;
                  if (timeLeft <= 0) clearInterval(interval);
                }, 1000);
              },
              willClose: () => {
                window.location.href = `/resultados/${partidaId}`;
              }
            });
          }
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p className="loading-text">Cargando configuración de juegos...</p>
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
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>Error de configuración</h2>
        <p className="loading-text">No hay configuración de juegos disponible</p>
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
      title: '¿Iniciar demostración de dibujos?',
      text: 'Se mostrarán los dibujos de todos los equipos en orden',
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


  const stopDrawingDemonstration = () => {
    socket.emit('stopDrawingDemo', partidaId);
  };

  return (
    <div className="professor-dashboard">
      {showProfessorModal && (
        <DrawingDemoModal
          partidaId={partidaId}
          isOpen={showProfessorModal}
          currentTeam={demoState.currentTeam}
          totalTeams={demoState.totalTeams}
          currentDrawing={demoState.currentDrawing}
          onClose={() => setShowProfessorModal(false)}
          onChangeTeam={(direction) => {
            socket.emit('changeDemoTeam', {
              partidaId,
              direction
            });
          }}
          isProfessor={true}
        />
      )}

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
                  {currentGame.tipo.toLowerCase() === 'ahorcado' && (
                    <div className="information__text">
                      <span>Palabra: </span>
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
                  {currentGame.tipo.toLowerCase() === 'dibujo' && (
                    <>
                      {isStudentDemoActive && (
                        <div className="option__button">
                          <button
                            onClick={() => setShowProfessorModal(!showProfessorModal)}
                            className="view-demo-btn"
                          >
                            {showProfessorModal ? 'Cerrar Vista Previa' : 'Ver Modo Demostración'}
                          </button>
                        </div>
                      )}
                      <div className="option__button">
                        <button
                          onClick={() => {
                            if (!isStudentDemoActive) {
                              socket.emit('startDrawingDemo', partidaId, (response) => {
                                if (response?.success) {
                                  setIsStudentDemoActive(true);
                                  setShowProfessorModal(true);
                                }
                              });
                            } else {
                              socket.emit('endDrawingDemo', partidaId, (response) => {
                                if (response?.success) {
                                  setIsStudentDemoActive(false);
                                  setShowProfessorModal(false);
                                }
                              });
                            }
                          }}
                          className={isStudentDemoActive ? 'active-demo-btn' : ''}
                        >
                          {isStudentDemoActive ? 'Detener Demostración' : 'Iniciar Demostración'}
                        </button>
                      </div>
                    </>
                  )}

                  <div className="option__button">
                    <button
                      onClick={nextGame}
                      disabled={gameConfig.currentIndex >= gameConfig.juegos.length - 1 || showTransition || isStudentDemoActive}
                      className={`
                          ${gameConfig.currentIndex >= gameConfig.juegos.length - 1 ? 'disabled-button' : ''} 
                          ${isStudentDemoActive ? 'demo-active-disabled' : ''}
                        `}
                    >
                      {gameConfig.currentIndex >= gameConfig.juegos.length - 1 ?
                        'Todos completados' :
                        'Siguiente juego'}
                    </button>
                  </div>

                  <div className="option__button">
                    <button
                      onClick={finishGame}
                      disabled={isStudentDemoActive}
                      className={`finish-button ${isStudentDemoActive ? 'demo-active-disabled' : ''}`}
                    >
                      Finalizar partida
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Componente de demostración de dibujos */}


          {/* Sección derecha - Lista de grupos */}
          <div className="groups-panel">
            <div className="content__box">
              <div className="box__title">
                <h3>Grupos Participantes</h3>
              </div>
              <div className="groups-list">
                {socket && partidaId && currentGame?.tipo?.toLowerCase() === 'dibujo' ? (
                  <ProfessorDrawingViewer partidaId={partidaId} socket={socket} />
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default SimulationProfessor;