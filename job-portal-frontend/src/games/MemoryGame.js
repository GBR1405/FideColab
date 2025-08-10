import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useParams } from 'react-router-dom';
import '../styles/games.css'; // Archivo de estilos (te lo proporciono después)

const MemoryGame = ({ gameConfig, onGameComplete }) => {
  const { partidaId, equipoNumero } = useParams();
  const socket = useSocket();
  const userId = localStorage.getItem('userId');
  
  const [gameState, setGameState] = useState({
    cards: [],
    flippedIndices: [],
    matchedPairs: 0,
    gameCompleted: false,
    loading: true
  });

  const [interactionDisabled, setInteractionDisabled] = useState(false);
  const [lastFlipTime, setLastFlipTime] = useState(0);

  useEffect(() => {
    setGameState({
      cards: [],
      flippedIndices: [],
      matchedPairs: 0,
      gameCompleted: false,
      loading: true,
      error: null
    });

    if (socket) {
      socket.emit('initMemoryGame', { partidaId, equipoNumero });
    }
  }, [partidaId, equipoNumero, socket]);

  // Inicializar el juego
  useEffect(() => {
    if (!socket) return;
    

    const handleGameState = (data) => {
      
      if (data.isNewGame) {
        // Reinicio completo para nuevo juego
        setGameState({
          cards: data.state.cards,
          flippedIndices: [],
          matchedPairs: 0,
          gameCompleted: false,
          loading: false
        });
      } else {
        // Actualización normal del estado
        setGameState(prev => ({
          ...prev,
          ...data.state,
          loading: false
        }));
      }

      // Si el juego está completado, notificar al componente padre
      if (data.state.gameCompleted) {
        onGameComplete({
          completed: true,
          pairsFound: data.state.matchedPairs,
          totalPairs: data.config.pairsCount
        });
      }
    };

    const handleGameError = (error) => {
      console.error('Error en el juego de memoria:', error);
      setGameState(prev => ({ ...prev, loading: false }));
    };

    // Escuchar eventos del socket
    socket.on('memoryGameState', handleGameState);
    socket.on('memoryGameError', handleGameError);

    // Inicializar el juego
    socket.emit('initMemoryGame', { partidaId, equipoNumero });

    // Sincronizar estado al montar
    socket.emit('syncMemoryGame', { partidaId, equipoNumero });

    return () => {
      socket.off('memoryGameState', handleGameState);
      socket.off('memoryGameError', handleGameError);
    };
  }, [socket, partidaId, equipoNumero, onGameComplete]);

  // Manejar el volteo de cartas
  const handleCardClick = (cardId) => {
    if (interactionDisabled) return;

    const cardIndex = gameState.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1 || 
        gameState.cards[cardIndex].matched || 
        gameState.cards[cardIndex].flipped ||
        gameState.flippedIndices.length >= 2) {
      return;
    }

    const currentIndex = gameConfig.Orden;
  
  socket.emit('flipMemoryCard', { 
    partidaId, 
    equipoNumero, 
    cardId,
    gameIndex: currentIndex // Enviar el índice actual
  });

    // Deshabilitar interacción temporalmente si es el segundo click
    if (gameState.flippedIndices.length === 1) {
      setInteractionDisabled(true);
      setTimeout(() => {
        setInteractionDisabled(false);
      }, 1000); // Cooldown de 1 segundo
    }
  };

  // Renderizar una carta individual
  const renderCard = (card) => {
    const isFlipped = card.flipped || card.matched;
    const isMatched = card.matched;
    const isDisabled = interactionDisabled || gameState.gameCompleted;

    return (
      <div 
        key={card.id}
        className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
        onClick={() => !isDisabled && handleCardClick(card.id)}
      >
        <div className="memory-card-inner">
          <div className="memory-card-front">
            {isFlipped ? card.symbol : '?'}
          </div>
          <div className="memory-card-back">
            <svg className="elogo__svg" viewBox="0 0 213.77 370.38" fill="white" xmlns="http://www.w3.org/2000/svg">
              <g id="Capa_1-2" data-name="Capa 1">
                <g id="Logo">
                  <path d="m198.32,293.72c-2.32,1.28-2.91,2.89-3.75,4.31-3.14,5.3-5.88,10.83-9.46,15.87-8.56,12.07-19.11,21.68-33.05,27.25-11.28,4.51-23.07,4.86-34.93,4.31-8.21-.38-16.15-2.16-23.63-5.76-16.64-8.01-26.47-21.85-32.88-38.54-8.01-20.87-10.2-42.66-10-64.8.01-1.48-.03-3.02,1.21-4.38,2.29-1.48,5.03-.94,7.64-.94,43.16-.03,86.32-.02,129.48-.03,2,0,4.02.15,5.99-.09,12.65-1.52,18.74-6.45,18.82-19.85.04-7.38-.83-14.64-2.17-21.85-2.97-16.02-7.38-31.47-18.08-44.38-9.16-11.05-19.61-20.48-33.14-25.82-24.85-9.82-50.66-10.43-76.2-4.82-37.19,8.16-61.35,31.96-74.24,67.39C2.21,202.82-.46,224.9.06,247.44c.48,20.78,3.08,41.16,10.67,60.7,9.8,25.25,26.86,43.5,52.25,53.22,25.89,9.91,52.65,11.58,79.59,5.36,15.81-3.65,29.74-11.33,41.42-22.99,11.09-11.07,18.42-24.37,24.43-38.57.58-1.37,1.24-2.76.61-5.02-2.57-3.15-6.76-4.63-10.72-6.42ZM50.86,205.02c1.48-13.76,3.28-27.46,8.63-40.41,3.47-8.41,8.38-15.86,14.29-22.74,6.61-7.69,15.11-11.95,24.91-13.63,13.76-2.36,27.2-1.8,39.78,5.24,6.5,3.64,11.05,9.07,14.28,15.6,7.13,14.42,10.55,29.77,10.99,45.81.02.83-.05,1.67-.14,2.49-1.19,11.57-5.06,15.18-16.72,15.2-29.66.06-59.32.03-88.98,0-1.97,0-4.02.27-5.85-.9-1.73-1.97-1.44-4.41-1.2-6.67Z"/>
                  <path d="m103.33,85.23c25.11-14.14,50.21-28.3,75.27-42.54,6.4-3.64,12.15-8.18,17.06-13.73,2.8-3.17,4.27-6.77,3.83-10.98-1.54-14.63-17.23-22.59-29.73-15.11-5.17,3.1-9.74,6.95-14.05,11.17-20.72,20.29-40.44,41.55-60.96,62.03-1.14,1.14-2.66,2.1-2.63,4.33,1.68,2.16,3.01,4.85,5.23,7,2.7.18,4.3-1.21,6-2.16Z"/>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Calcular el tamaño del grid basado en la dificultad
  const getGridSize = () => {
    const pairsCount = gameState.cards.length / 2;
    if (pairsCount <= 8) return 'grid-4x4';
    if (pairsCount <= 12) return 'grid-6x4';
    return 'grid-6x6';
  };

  if (gameState.loading) {
    return (
      <div className="memory-game-loading">
        <div className="spinner"></div>
        <p>Cargando juego de memoria...</p>
      </div>
    );
  }

  return (
    <div className="memory__container">
      <div className="memory-game-header">
        <div className="memory-game-stats">
          <p>Número de grupo</p>
          <span>{equipoNumero}</span>
        </div>
        <div className="memory-game-stats">
          <p>Pares encontrados</p>
          <span>{gameState.matchedPairs}/{gameState.cards.length / 2}</span>
        </div>
      </div>

      <div className={`memory-game-board ${getGridSize()}`}>
        {gameState.cards.map(renderCard)}
      </div>

      {gameState.gameCompleted && (
        <div className="memory-game-complete">
          <h3>¡Felicidades! Completaron el juego</h3>
          <p>Encontraron todos los {gameState.matchedPairs} pares</p>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;