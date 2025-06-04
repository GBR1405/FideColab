import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import '../styles/games_puzzle.css';

const PuzzleGame = ({ gameConfig, onGameComplete }) => {
  const { partidaId, equipoNumero } = useParams();
  const socket = useSocket();
  const userId = localStorage.getItem('userId');
  const [pieces, setPieces] = useState([]);
  const [selectedPieces, setSelectedPieces] = useState([]);
  const [progress, setProgress] = useState(0);
  const [previousProgress, setPreviousProgress] = useState(0);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  
  const difficulty = gameConfig.dificultad.toLowerCase();
  const imageUrl = gameConfig.tema;


  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      initGame();
    };
  }, [imageUrl]);


  const initGame = useCallback(() => {
    if (!socket) return;
    socket.emit('initPuzzleGame', { partidaId, equipoNumero, difficulty, imageUrl });
    
    socket.on('puzzleGameState', (state) => {
      setPieces(state.pieces);
      setSelectedPieces(state.selectedPieces);
      setProgress(state.progress);
      setPreviousProgress(state.previousProgress);
      lastUpdateRef.current = Date.now();
    });
    
    return () => {
      socket.off('puzzleGameState');
    };
  }, [socket, partidaId, equipoNumero, difficulty, imageUrl]);


  useEffect(() => {
    if (!socket) return;

    const handlePieceUpdate = ({ modifiedPieces, selectedPieces, progress, previousProgress }) => {
      const now = Date.now();

      if (now - lastUpdateRef.current < 50) return;
      
      lastUpdateRef.current = now;
      
      setPieces(prev => prev.map(p => {
        const updatedPiece = modifiedPieces.find(mp => mp.id === p.id);
        return updatedPiece ? {...p, ...updatedPiece} : p;
      }));
      setSelectedPieces(selectedPieces);
      setProgress(progress);
      setPreviousProgress(previousProgress);
    };

    socket.on('updatePuzzlePiece', handlePieceUpdate);
    
    return () => {
      socket.off('updatePuzzlePiece', handlePieceUpdate);
    };
  }, [socket]);


  const handlePieceClick = useCallback((pieceId) => {
    if (!socket) return;
    socket.emit('selectPuzzlePiece', { partidaId, equipoNumero, pieceId, userId });
  }, [socket, partidaId, equipoNumero, userId]);


  const PuzzlePiece = React.memo(({ piece, isSelected, isCorrect, onClick, userId }) => {
    const size = difficulty === 'facil' ? 4 : difficulty === 'normal' ? 6 : 8;
    const bgSize = `${size * 100}% ${size * 100}%`;
    const bgPosX = `${(piece.correctCol / (size - 1)) * 100}%`;
    const bgPosY = `${(piece.correctRow / (size - 1)) * 100}%`;

    return (
      <div
        className={`puzzle-piece ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''}`}
        style={{
          position: 'absolute',
          width: `${piece.size}px`,
          height: `${piece.size}px`,
          left: `${piece.currentCol * piece.size}px`,
          top: `${piece.currentRow * piece.size}px`,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: bgSize,
          backgroundPosition: `${bgPosX} ${bgPosY}`,
          border: isSelected ? '3px solid #ffcc00' : '1px solid #333',
          cursor: piece.locked && piece.selectedBy !== userId ? 'not-allowed' : 'pointer',
          opacity: piece.locked && piece.selectedBy !== userId ? 0.6 : 1,
          transition: 'all 0.2s ease'
        }}
        onClick={onClick}
      >
        {piece.locked && piece.selectedBy !== userId && (
          <div className="piece-locked-overlay">
            <span>🔒</span>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="puzzle-game">
      <h2>Rompecabezas Colaborativo</h2>
      
      <div className="puzzle-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-text">
          Progreso: {progress}%
          {progress !== previousProgress && (
            <span className={`progress-change ${progress > previousProgress ? 'up' : 'down'}`}>
              {progress > previousProgress ? '↑' : '↓'}
            </span>
          )}
        </span>
      </div>
      
      <div className="puzzle-board-container">
        <div className="reference-image">
          <img src={imageUrl} alt="Referencia" />
          <p>Imagen de referencia</p>
        </div>
        
        <div 
          ref={containerRef}
          className="puzzle-container"
          style={{
            width: `${difficulty === 'facil' ? 400 : difficulty === 'normal' ? 600 : 800}px`,
            height: `${difficulty === 'facil' ? 400 : difficulty === 'normal' ? 600 : 800}px`
          }}
        >
          {pieces.map(piece => (
            <PuzzlePiece
              key={`${piece.id}-${piece.currentRow}-${piece.currentCol}`}
              piece={piece}
              isSelected={selectedPieces.includes(piece.id)}
              isCorrect={piece.currentRow === piece.correctRow && piece.currentCol === piece.correctCol}
              onClick={() => !(piece.locked && piece.selectedBy !== userId) && handlePieceClick(piece.id)}
              userId={userId}
            />
          ))}
        </div>
      </div>
      
      <div className="puzzle-instructions">
        <h3>Instrucciones:</h3>
        <ul>
          <li>Selecciona una pieza para bloquearla (se marcará en amarillo)</li>
          <li>Selecciona otra pieza para intercambiarlas</li>
          <li>Haz clic en una pieza seleccionada para desbloquearla</li>
          <li>Las piezas correctas tendrán borde verde</li>
        </ul>
      </div>
    </div>
  );
};

export default React.memo(PuzzleGame);