import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import '../styles/DrawingDemoModal.css';

// Modifica la definición de props para incluir onClose
const DrawingDemoModal = ({ partidaId, isProfessor, onClose }) => {
  const socket = useSocket();
  const canvasRef = useRef(null);
  const numericPartidaId = Number(partidaId);

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [votes, setVotes] = useState({});
  const [topTeams, setTopTeams] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
    const userId = localStorage.getItem('userId');

  // Obtener equipos + estado de demo
  useEffect(() => {
    if (!socket || isNaN(numericPartidaId)) return;

    socket.emit('getTeamsForPartida', numericPartidaId, (response) => {
      if (response.success) {
        const ordenados = response.equipos.sort((a, b) => a - b);
        setTeams(ordenados);

        socket.emit('checkDrawingDemo', numericPartidaId, (res) => {
          if (res.active) {
            setIsActive(true);
            setSelectedTeam(res.currentTeam);
          } else {
            if (ordenados.length > 0) {
              setSelectedTeam(ordenados[0]);
            }
          }
        });
      }
    });

    // Modifica el manejador del evento drawingDemoTeamChanged
    const handleTeamChange = ({ currentTeam }) => {
      console.log('Cambio de equipo recibido:', currentTeam); // Para debugging
      setSelectedTeam(currentTeam);
    };

    socket.on('drawingDemoStarted', ({ currentTeam }) => {
      setIsActive(true);
      setSelectedTeam(currentTeam);
    });

    socket.on('drawingDemoTeamChanged', handleTeamChange);

    socket.on('drawingDemoEnded', () => {
      setIsActive(false);
    });

    return () => {
      socket.off('drawingDemoStarted');
      socket.off('drawingDemoTeamChanged');
      socket.off('drawingDemoEnded');
    };
  }, [socket, numericPartidaId]);

  // Obtener y renderizar dibujo
  const fetchAndDrawTeamDrawing = () => {
    if (!socket || selectedTeam === null) return;

    setLoading(true);

    socket.emit('professorGetTeamDrawing', {
      partidaId: numericPartidaId,
      equipoNumero: selectedTeam
    }, (response) => {
      setLoading(false);
      if (response.success) {
        drawCanvas(response.drawing);
        setLastUpdate(new Date());
      } else {
        clearCanvas();
      }
    });
  };

  const drawCanvas = (drawingData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!drawingData) return;

    const sourceWidth = 800;
    const sourceHeight = 600;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const scaleX = canvasWidth / sourceWidth;
    const scaleY = canvasHeight / sourceHeight;

    Object.values(drawingData).forEach((userPaths) => {
      userPaths.forEach((path) => {
        if (!Array.isArray(path.points) || path.points.length < 4) return;

        ctx.beginPath();
        ctx.strokeStyle = path.color || '#000000';
        ctx.lineWidth = path.strokeWidth || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < path.points.length; i += 2) {
          const x = path.points[i] * scaleX;
          const y = path.points[i + 1] * scaleY;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Cambiar equipo (solo profesor)
  const selectTeam = (teamNumber) => {
    if (!isProfessor) return;
    
    // Actualiza el estado local inmediatamente
    setSelectedTeam(teamNumber);
    
    // Emite el evento al servidor
    socket.emit('changeDrawingDemoTeam', {
      partidaId: numericPartidaId,
      equipoNumero: teamNumber
    });
  };

  // Finalizar demo (solo profesor)
  const endDemo = () => {
    socket.emit('endDrawingDemo', numericPartidaId);
  };

  // Modifica la función endDemo para que también llame a onClose
  const handleClose = () => {
    if (isProfessor) {
      // Si es profesor, solo cerramos el modal sin terminar la demo
      onClose();
    } else {
      // Si es estudiante, emitimos el evento de finalizar demo
      socket.emit('endDrawingDemo', numericPartidaId);
    }
  };

  // Añade esta función para descargar el dibujo
  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Crear un elemento temporal de enlace
    const link = document.createElement('a');
    link.download = `dibujo-equipo-${selectedTeam}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Actualización instantánea al cambiar de equipo
  useEffect(() => {
    if (selectedTeam !== null) {
        console.log('Fetching drawing for team:', selectedTeam);
        fetchAndDrawTeamDrawing();
        loadVotes(); // <<<<< esta línea es la clave
    }
    }, [selectedTeam]);

  // Actualización periódica cada 30 segundos
  useEffect(() => {
    if (!selectedTeam) return;
    
    // Primera carga
    fetchAndDrawTeamDrawing();
    
    // Actualización cada 30 segundos
    const intervalId = setInterval(() => {
      console.log('Periodic update for team:', selectedTeam);
      fetchAndDrawTeamDrawing();
    }, 8000); // 30 segundos

    return () => clearInterval(intervalId);
  }, [selectedTeam]);

  // Obtener equipos + estado de demo
  useEffect(() => {
    if (!socket || isNaN(numericPartidaId)) return;

    socket.emit('getTeamsForPartida', numericPartidaId, (response) => {
      if (response.success) {
        const ordenados = response.equipos.sort((a, b) => a - b);
        setTeams(ordenados);

        socket.emit('checkDrawingDemo', numericPartidaId, (res) => {
          if (res.active) {
            setIsActive(true);
            setSelectedTeam(res.currentTeam);
          } else {
            if (ordenados.length > 0) {
              setSelectedTeam(ordenados[0]);
            }
          }
        });

        // Cargar votos iniciales
        loadVotes();
      }
    });

    const handleTeamChange = ({ currentTeam }) => {
      setSelectedTeam(currentTeam);
      checkIfVoted(currentTeam);
    };

    const handleVotesUpdated = ({ votes, topTeams }) => {
      setVotes(votes);
      setTopTeams(topTeams);
      checkIfVoted(selectedTeam);
    };

    socket.on('drawingDemoStarted', ({ currentTeam }) => {
      setIsActive(true);
      setSelectedTeam(currentTeam);
      loadVotes();
    });

    socket.on('drawingDemoTeamChanged', handleTeamChange);
    socket.on('drawingDemoEnded', () => {
      setIsActive(false);
    });
    socket.on('drawingVotesUpdated', handleVotesUpdated);

    return () => {
      socket.off('drawingDemoStarted');
      socket.off('drawingDemoTeamChanged');
      socket.off('drawingDemoEnded');
      socket.off('drawingVotesUpdated');
    };
  }, [socket, numericPartidaId]);

  const loadVotes = () => {
    socket.emit('getDrawingVotes', numericPartidaId, (response) => {
      if (response) {
        setVotes(response.votes || {});
        setTopTeams(response.topTeams || []);
      }
    });
  };

  const checkIfVoted = (team) => {
    if (!userId || !team) return;
    socket.emit('checkUserVote', { 
      partidaId: numericPartidaId, 
      userId, 
      equipoNumero: team 
    }, (response) => {
      setHasVoted(response?.hasVoted || false);
    });
  };

  const handleVote = () => {
    if (!selectedTeam || !userId) return;
    
    socket.emit('voteForDrawing', { 
      partidaId: numericPartidaId, 
      equipoNumero: selectedTeam, 
      userId 
    }, (response) => {
      if (response.success) {
        setHasVoted(true);
      } else {
        alert(response.error || 'Error al votar');
      }
    });
  };

  if (!isActive && !isProfessor) return null;

  return (
    <div className="demo-modal-container">
    <div className="demo-modal-overlay">
      <div className="demo-modal-container">
        <div className="demo-header">
          <h2>Modo Demostración</h2>
          {isProfessor && (
            <button onClick={handleClose} className="demo-close-btn">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="demo-content">
          <div className="demo-drawing-area">
            <div className="drawing-header">
              <h3 className="drawing-title">Dibujo del Equipo {selectedTeam}</h3>
              <div className="drawing-stats">
                <span className="votes-count">
                  <i className="fas fa-star"></i> {votes[selectedTeam] || 0} votos
                </span>
                {topTeams.includes(selectedTeam) && (
                  <span className="top-team-badge">¡Más votado!</span>
                )}
              </div>
            </div>
            
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="demo-drawing"
              />
              {loading && (
                <div className="demo-loading">
                  <div className="loading-spinner"></div>
                  <p>Cargando dibujo...</p>
                </div>
              )}
            </div>
          </div>

          {isProfessor ? (
            <div className="professor-panel">
              <div className="panel-header">
                <h3>Equipos Participantes</h3>
                <div className="teams-count">{teams.length} equipos</div>
              </div>
              
              <div className="teams-scroll-container">
                <ul className="teams-list">
                  {teams.map(team => (
                    <li
                      key={team}
                      className={`team-item ${selectedTeam === team ? 'active' : ''} ${topTeams.includes(team) ? 'top-team' : ''}`}
                      onClick={() => selectTeam(team)}
                    >
                      <div className="team-badge">Equipo {team}</div>
                      <div className="team-votes">
                        <span className="votes-number">{votes[team] || 0}</span>
                        <i className="fas fa-star"></i>
                      </div>
                      {topTeams.includes(team) && (
                        <div className="top-team-icon">
                          <i className="fas fa-trophy"></i>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="student-panel">
              <div className="most-voted-team">
                <h3>Equipo{topTeams.length > 1 ? 's' : ''} más votado{topTeams.length > 1 ? 's' : ''}</h3>
                {topTeams.length > 0 ? (
                  topTeams.map(team => (
                    <div key={team} className="top-team-card">
                      <div className="team-badge winner">Equipo {team}</div>
                      <div className="team-votes">
                        <span className="votes-number">{votes[team] || 0}</span>
                        <i className="fas fa-star"></i>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-top-teams">Aún no hay votos</p>
                )}
              </div>
              
              <div className="student-actions">
                <button 
                  className={`action-btn vote-btn ${hasVoted ? 'voted' : ''}`}
                  onClick={handleVote}
                  disabled={hasVoted}
                >
                  <i className={`fas ${hasVoted ? 'fa-check' : 'fa-thumbs-up'}`}></i>
                  {hasVoted ? '¡Votado!' : 'Votar'}
                </button>
                <button 
                  className="action-btn download-btn"
                  onClick={downloadDrawing}
                  title="Descargar dibujo actual"
                >
                  <i className="fas fa-download"></i> Descargar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default DrawingDemoModal;
