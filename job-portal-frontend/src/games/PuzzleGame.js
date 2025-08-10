import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import '../styles/games_puzzle.css';

const PuzzleGame = ({ gameConfig }) => {
  const { partidaId, equipoNumero } = useParams();
  const socket = useSocket();
  const userId = localStorage.getItem('userId');

  const [pieces, setPieces] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [blockedPieces, setBlockedPieces] = useState(new Set());
  const [swapsLeft, setSwapsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(false);

  const [imageCrop, setImageCrop] = useState({
    size: 1, xOffset: 0, yOffset: 0
  });

  const difficulty = gameConfig.dificultad.toLowerCase();
  const imageUrl = gameConfig.tema;

  const gridSize = {
    fácil: 6,
    facil: 6,
    normal: 7,
    difícil: 8,
    dificil: 8
  }[difficulty] || 6;

  const pieceSize = 600 / gridSize;

  // 🎉 Puzzle completo
  useEffect(() => {
    if (progress === 100) {
      setInteractionLocked(true);

      import('canvas-confetti').then(confetti => {
        confetti.default({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
      });

      import('sweetalert2').then(Swal => {
        Swal.default.fire({
          title: '¡Felicidades!',
          text: '¡Puzzle completado!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      });
    }
  }, [progress]);

  // 🔄 Cargar imagen e iniciar juego
  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const squareSize = Math.min(width, height);
      const xOffset = (width - squareSize) / 2;
      const yOffset = (height - squareSize) / 2;

      setImageCrop({ size: squareSize, xOffset, yOffset });
      setImageLoaded(true);

      socket.emit('initPuzzleGame', {
        partidaId,
        equipoNumero,
        difficulty,
        imageUrl
      });
    };
  }, [imageUrl, socket]);

  // 📥 Estado inicial
  useEffect(() => {
    if (!socket) return;

    const handleInit = (game) => {
      setPieces(game.state.pieces);
      setSwapsLeft(game.config.swapsLeft);
      setProgress(game.state.progress);
      setSelectedIds([]);
      setInteractionLocked(false);
      setBlockedPieces(new Set());
    };

    socket.on('puzzleGameState', handleInit);
    socket.emit('requestPuzzleState', { partidaId, equipoNumero });

    return () => {
      socket.off('puzzleGameState', handleInit);
    };
  }, [socket, partidaId, equipoNumero]);

  // 🧩 Después de cada swap
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = ({ pieces, selected, swapsLeft, progress }) => {
      setPieces(pieces);
      setSelectedIds(selected);
      setSwapsLeft(swapsLeft);
      setProgress(progress);

      if (progress === 100 || swapsLeft <= 0) {
        setInteractionLocked(true);
      }
    };

    socket.on('puzzleUpdate', handleUpdate);
    return () => socket.off('puzzleUpdate', handleUpdate);
  }, [socket]);

  // 🔁 Eventos de bloqueo y swaps agotados
  useEffect(() => {
    if (!socket) return;

    const handleUpdateSelections = ({ userId: senderId, selected }) => {
      if (senderId === userId) {
        setSelectedIds(selected);
      } else {
        setBlockedPieces(prev => {
          const updated = new Set([...prev]);
          selected.forEach(id => updated.add(id));
          return updated;
        });

        setTimeout(() => {
          setBlockedPieces(prev => {
            const updated = new Set([...prev]);
            selected.forEach(id => updated.delete(id));
            return updated;
          });
        }, 5000);
      }
    };

    const handleBlockedPiece = (pieceId) => {
      console.log(`Pieza ${pieceId} está bloqueada`);
    };

    const handleNoSwapsLeft = () => {
      setInteractionLocked(true);
      alert('¡Ya no quedan movimientos!');
    };

    socket.on('updateSelections', handleUpdateSelections);
    socket.on('pieceBlocked', handleBlockedPiece);
    socket.on('noSwapsLeft', handleNoSwapsLeft);

    return () => {
      socket.off('updateSelections', handleUpdateSelections);
      socket.off('pieceBlocked', handleBlockedPiece);
      socket.off('noSwapsLeft', handleNoSwapsLeft);
    };
  }, [socket, userId]);

  // 📌 Al hacer clic en una pieza
  const handlePieceClick = useCallback((pieceId) => {
    if (interactionLocked || blockedPieces.has(pieceId)) return;

    socket.emit('selectPuzzlePiece', {
      partidaId,
      equipoNumero,
      pieceId,
      userId
    });
  }, [socket, partidaId, equipoNumero, userId, interactionLocked, blockedPieces]);

  // 🧱 Renderizar una pieza
  const renderPiece = (piece) => {
    const isSelected = selectedIds.includes(piece.id);
    const isCorrect = piece.currentRow === piece.correctRow && piece.currentCol === piece.correctCol;
    const isBlocked = blockedPieces.has(piece.id);

    return (
      <div
        key={piece.id}
        className={`puzzle-piece 
          ${isSelected ? 'selected' : ''} 
          ${isCorrect ? 'correct' : ''} 
          ${isBlocked ? 'blocked' : ''}`}
        style={{
          width: `${pieceSize}px`,
          height: `${pieceSize}px`,
          position: 'absolute',
          top: `${piece.currentRow * pieceSize}px`,
          left: `${piece.currentCol * pieceSize}px`,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${gridSize * 100}%`,
          backgroundPosition: `${(piece.correctCol / (gridSize - 1)) * 100}% ${(piece.correctRow / (gridSize - 1)) * 100}%`,
          cursor: interactionLocked || isBlocked ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={() => handlePieceClick(piece.id)}
      />
    );
  };

  return (    
    <div className="container__puzzle">
      <div className="details__group group--first">
        <p>Número de grupo</p>
        <span>{equipoNumero}</span>
      </div>
      <div className="details__group group--second">
        <p>Progreso</p>
        <span>{progress}%</span>
      </div>
      <div className="details__container container--first">                    
          <div className="container__header">
              <h3>Referencia</h3>
          </div>
          <div className="container__body">
              <img src={imageUrl} alt="Referencia" className="view__image" />
          </div>
      </div>      
      <div className="details__container container--second">                    
          <div className="container__header">
              <h3>Movimientos</h3>
          </div>
          <div className="container__body">
            <span>{swapsLeft}</span>
          </div>
      </div>          
      <div className="game__puzzle">
        <div className="puzzle__canvas"
          style={{
              width: `${pieceSize * gridSize}px`,
              height: `${pieceSize * gridSize}px`
            }}>
          {pieces.map(renderPiece)}
        </div>
      </div>                       
    </div>
  );
};

export default PuzzleGame;
