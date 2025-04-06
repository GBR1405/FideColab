import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Swal from 'sweetalert2';

const ProfessorDashboard = () => {
  const { partidaId } = useParams();
  const socket = useSocket();
  const [gameConfig, setGameConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionGame, setTransitionGame] = useState(null);
  const transitionTimeoutRef = useRef(null);

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
    
    // Mostrar animación de transición
    setTransitionGame({
      tipo: data.currentGame.tipo,
      configEspecifica: data.currentGame.configEspecifica,
      dificultad: data.currentGame.dificultad,
      tema: data.currentGame.tema
    });
    setShowTransition(true);
    
    // Configurar timeout para ocultar la transición
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

    fetchGameConfig();
  
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
        // Actualizar el estado local inmediatamente (optimistic update)
        const newIndex = gameConfig.currentIndex + 1;
        updateGameState(newIndex);
        
        // Mostrar animación de transición
        const nextGame = gameConfig.juegos[newIndex];
        setTransitionGame({
          tipo: nextGame.tipo,
          configEspecifica: nextGame.configEspecifica,
          dificultad: nextGame.dificultad,
          tema: nextGame.tema
        });
        setShowTransition(true);
        
        // Configurar timeout para ocultar la transición
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
        
        transitionTimeoutRef.current = setTimeout(() => {
          setShowTransition(false);
        }, 3000);
        
        // Emitir el evento al servidor
        socket.emit('nextGame', partidaId, (response) => {
          if (response.error) {
            console.error(response.error);
            setError(response.error);
            Swal.fire('Error', 'No se pudo cambiar al siguiente juego', 'error');
            // Revertir el cambio si hay error
            updateGameState(gameConfig.currentIndex - 1);
          }
        });
      }
    });
  };

  if (loading) {
    return <div className="loading-message">Cargando configuración de juegos...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!gameConfig) {
    return <div className="no-config-message">No hay configuración de juegos disponible</div>;
  }

  const currentGame = gameConfig.juegos[gameConfig.currentIndex];

  if (!currentGame) {
    return <div className="error-message">Error: No se pudo cargar el juego actual</div>;
  }

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

      <h1>Control de Partida #{partidaId}</h1>
      
      <div className={`game-controls ${showTransition ? 'blurred' : ''}`}>
        <h2>Juego Actual: {currentGame.tipo || 'No especificado'}</h2>
        <p>Dificultad: {currentGame.dificultad || 'No especificada'}</p>
        <p>Configuración: {currentGame.configEspecifica || 'No especificada'}</p>
        <p>Tema: {currentGame.tema || 'No especificado'}</p>
        <p>Progreso: {gameConfig.currentIndex + 1} de {gameConfig.total}</p>

        <button 
          onClick={nextGame} 
          className="next-button"
          disabled={gameConfig.currentIndex >= gameConfig.juegos.length - 1 || showTransition}
        >
          {gameConfig.currentIndex >= gameConfig.juegos.length - 1 ? 
            'Todos los juegos completados' : 
            'Siguiente Juego'}
        </button>
      </div>

      <div className={`games-list ${showTransition ? 'blurred' : ''}`}>
        <h3>Juegos Configurados:</h3>
        <ul>
          {gameConfig.juegos.map((juego, index) => (
            <li 
              key={index} 
              className={index === gameConfig.currentIndex ? 'active' : ''}
            >
              {index + 1}. {juego.tipo || 'Juego sin nombre'} - {juego.dificultad || 'Sin dificultad'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfessorDashboard;