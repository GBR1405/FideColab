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
          <div className="memory-card-back"></div>
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
    <div className="memory-game-container">
      <div className="memory-game-header">
        <h2>Juego de Memoria</h2>
        <div className="memory-game-stats">
          <span>Pares encontrados: {gameState.matchedPairs}/{gameState.cards.length / 2}</span>
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