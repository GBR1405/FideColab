import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const StudentDrawingDemo = ({ partidaId, gameConfig }) => {
  const socket = useSocket();
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const loadDrawing = () => {
      socket.emit('getCurrentDrawing', partidaId, (response) => {
        if (!response.error) {
          setCurrentTeam(response.currentTeam);
          setCurrentDrawing(response.imageData);
        }
      });
    };

    socket.on('demoStarted', loadDrawing);
    socket.on('demoTeamChanged', loadDrawing);
    socket.on('demoEnded', () => {
      setCurrentTeam(null);
      setCurrentDrawing(null);
    });

    return () => {
      socket.off('demoStarted', loadDrawing);
      socket.off('demoTeamChanged', loadDrawing);
      socket.off('demoEnded');
    };
  }, [socket, partidaId]);

  if (!currentTeam) return null;

  return (
    <div>
      <h4>Dibujo del Equipo {currentTeam}</h4>
      <p>Tema: {gameConfig.tema}</p>
      {currentDrawing ? (
        <img src={currentDrawing} alt={`Dibujo del equipo ${currentTeam}`} />
      ) : (
        <p>No hay dibujo disponible</p>
      )}
    </div>
  );
};

export default StudentDrawingDemo;