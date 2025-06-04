import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const DrawingDemo = ({ partidaId, gameConfig }) => {
  const socket = useSocket();
  const [currentTeam, setCurrentTeam] = useState(null);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [loading, setLoading] = useState(false);

  const startDemo = async () => {
    setLoading(true);
    socket.emit('startDrawingDemo', partidaId, (response) => {
      setLoading(false);
      if (response.error) {
        alert(response.error);
      }
    });
  };

  const changeTeam = (direction) => {
    if (!currentTeam) return;
    
    setLoading(true);
    const newTeam = direction === 'next' ? currentTeam + 1 : currentTeam - 1;
    
    socket.emit('changeDemoTeam', partidaId, newTeam, (response) => {
      setLoading(false);
      if (response.error) {
        alert(response.error);
      }
    });
  };

  const endDemo = () => {
    socket.emit('endDemo', partidaId);
  };

  useEffect(() => {
    if (!socket) return;

    const loadDrawing = (team) => {
      socket.emit('getCurrentDrawing', partidaId, (response) => {
        if (!response.error) {
          setCurrentTeam(response.currentTeam);
          setCurrentDrawing(response.imageData);
        }
      });
    };

    socket.on('demoStarted', ({ currentTeam }) => {
      loadDrawing(currentTeam);
    });

    socket.on('demoTeamChanged', ({ currentTeam }) => {
      loadDrawing(currentTeam);
    });

    socket.on('demoEnded', () => {
      setCurrentTeam(null);
      setCurrentDrawing(null);
    });

    return () => {
      socket.off('demoStarted');
      socket.off('demoTeamChanged');
      socket.off('demoEnded');
    };
  }, [socket, partidaId]);

  if (!currentTeam) {
    return (
      <button onClick={startDemo} disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar Demostración'}
      </button>
    );
  }

  return (
    <div>
      <h3>Demostración - Equipo {currentTeam}</h3>
      <p>Tema: {gameConfig.tema}</p>
      
      {currentDrawing ? (
        <img src={currentDrawing} alt={`Dibujo del equipo ${currentTeam}`} />
      ) : (
        <p>No hay dibujo disponible</p>
      )}

      <div>
        <button onClick={() => changeTeam('prev')} disabled={loading}>
          Anterior
        </button>
        <button onClick={() => changeTeam('next')} disabled={loading}>
          Siguiente
        </button>
        <button onClick={endDemo} disabled={loading}>
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default DrawingDemo;