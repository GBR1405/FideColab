import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Layout from '../components/LayoutSimulation';
import "../styles/simulationComponents.css";
import { games } from '../games/GameConfiguration';
import "../styles/TeamRoom.css";

const TeamRoom = () => {
  const { partidaId, equipoNumero } = useParams();
  const socket = useSocket();
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentGameInfo, setCurrentGameInfo] = useState(null);
  const [gameProgress, setGameProgress] = useState({ current: 0, total: 0 });
  const [showTransition, setShowTransition] = useState(false);
  const [transitionGame, setTransitionGame] = useState(null);
  const cursorContainerRef = useRef(null);
  const userId = localStorage.getItem('userId');
  const roomId = `team-${partidaId}-${equipoNumero}`;
  const transitionTimeoutRef = useRef(null);

  // Manejar el cambio de juego con animación
  const handleGameChangeWithTransition = (data) => {
    console.log('Preparando transición para:', data);
    
    // 1. Mostrar la animación de transición
    setTransitionGame({
      ...games[data.currentGame.tipo.toLowerCase()],
      name: data.currentGame.tipo,
      config: data.currentGame.configEspecifica
    });
    setShowTransition(true);
    
    // 2. Limpiar timeout anterior si existe
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // 3. Ocultar la transición después de 2.5 segundos (animación durará 0.5s)
    transitionTimeoutRef.current = setTimeout(() => {
      // Primero activamos la clase de salida
      const overlay = document.querySelector('.game-transition-overlay');
      if (overlay) overlay.classList.add('exiting');
      
      // Esperamos a que termine la animación de salida antes de actualizar
      setTimeout(() => {
        setShowTransition(false);
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
      }, 500); // Tiempo de la animación de salida
    }, 2500); // Mostramos el overlay por 2.5 segundos
  };

  useEffect(() => {
    if (!socket || !partidaId || !equipoNumero) return;
  
    // 1. Unirse a las salas necesarias
    socket.emit('JoinTeamRoom', { 
      partidaId, 
      equipoNumero,
      userId 
    });

    socket.emit('joinPartidaRoom', partidaId);
  
    // 2. Configurar listeners
    const handleUpdateTeamMembers = (members) => {
      console.log('Miembros actualizados:', members);
      setTeamMembers(members);
    };
  
    const handleBroadcastMouse = (userId, x, y) => {
      updateCursor(userId, x, y);
    };
  
    socket.on('UpdateTeamMembers', handleUpdateTeamMembers);
    socket.on('BroadcastMousePosition', handleBroadcastMouse);
    socket.on('gameChanged', handleGameChangeWithTransition);
  
    // 3. Obtener configuración inicial (sin animación)
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
        }
      }
    });
  
    // 4. Configurar movimiento del mouse local
    const handleMouseMove = (e) => {
      if (!cursorContainerRef.current) return;
      
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
  
    window.addEventListener('mousemove', handleMouseMove);
  
    // Limpieza
    return () => {
      socket.off('UpdateTeamMembers', handleUpdateTeamMembers);
      socket.off('BroadcastMousePosition', handleBroadcastMouse);
      socket.off('gameChanged', handleGameChangeWithTransition);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      const container = cursorContainerRef.current;
      if (container) {
        const remoteCursors = container.querySelectorAll('.remote-cursor');
        remoteCursors.forEach(cursor => cursor.remove());
      }
    };
  }, [socket, partidaId, equipoNumero, userId]);

  const updateCursor = (userId, normalizedX, normalizedY) => {
    if (userId === localStorage.getItem('userId')) return;
    
    const container = cursorContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = normalizedX * rect.width;
    const y = normalizedY * rect.height;
    
    let cursor = document.getElementById(`cursor-${userId}`);
    
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = `cursor-${userId}`;
      cursor.className = 'remote-cursor';
      
      const color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      cursor.style.setProperty('--cursor-color', color);
      
      cursor.innerHTML = `<span class="cursor-name">${getUserName(userId)}</span>`;
      container.appendChild(cursor);
    }
  
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  };
  
  const getUserName = (userId) => {
    return teamMembers.find(m => m.userId === userId)?.fullName 
           || localStorage.getItem('userFullName') 
           || `Usuario ${userId}`;
  };

  return (
    <Layout>
      <div className="container__content">
        <div className="team-room-header">
          <h1>Equipo {equipoNumero}</h1>
          {currentGameInfo && (
            <div className="game-progress">
              Juego {gameProgress.current} de {gameProgress.total}
            </div>
          )}
        </div>

        <div 
          ref={cursorContainerRef}
          className="game-container"
          style={{ 
            position: 'relative', 
            width: '100%', 
            height: '70vh', 
            overflow: 'hidden'
          }}
        >
          {/* Overlay de transición */}
          {showTransition && transitionGame && (
            <div className="game-transition-overlay">
              <div className="game-transition-content">
                <div className="transition-game-icon">
                  {transitionGame.icon}
                </div>
                <div className="transition-game-text">
                  Siguiente Juego:<br />
                  <span className="transition-game-name">{transitionGame.name}</span>
                </div>
              </div>
            </div>
          )}

          {currentGameInfo ? (
            <div className={`game-info-container ${showTransition ? 'blurred' : ''}`}>
              <div className="game-icon">{currentGameInfo.icon}</div>
              <h2>{currentGameInfo.name}</h2>
              <p>{currentGameInfo.description}</p>
              
              <div className="game-details">
                <p><strong>Dificultad:</strong> {currentGameInfo.dificultad}</p>
                <p><strong>Configuración:</strong> {currentGameInfo.config}</p>
                <p><strong>Tema:</strong> {currentGameInfo.tema}</p>
              </div>

              <div className="team-members">
                <h3>Miembros del equipo:</h3>
                <ul>
                  {teamMembers.map((member, index) => (
                    <li key={index}>
                      {member.fullName} {member.userId === userId && "(Tú)"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="waiting-message">
              <p>Esperando que el profesor inicie los juegos...</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeamRoom;