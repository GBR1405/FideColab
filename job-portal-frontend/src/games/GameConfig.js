import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';

export const games = {
  puzzle: {
    name: "Rompecabezas Colaborativo",
    component: PuzzleGame,
    configTypes: {
      rows: { type: "number", default: 5 },
      cols: { type: "number", default: 5 },
      imageUrl: { type: "string", default: "" }
    }
  }
};

function PuzzleGame({ roomId, socket, userId, config }) {
  const [pieces, setPieces] = useState([]);
  const containerRef = useRef(null);
  const SNAP_THRESHOLD = 8; // % del tamaño del contenedor

  // Función para inicializar piezas
  const initializePieces = useCallback(() => {
    if (!config) return [];
    
    const { rows, cols, imageUrl } = config;
    const pieceWidth = 100 / cols;
    const pieceHeight = 100 / rows;
    
    return Array.from({ length: rows * cols }, (_, i) => ({
      id: `piece-${Math.floor(i / cols)}-${i % cols}`,
      row: Math.floor(i / cols),
      col: i % cols,
      x: Math.random() * (100 - pieceWidth),
      y: Math.random() * (100 - pieceHeight),
      targetX: (i % cols) * pieceWidth,
      targetY: Math.floor(i / cols) * pieceHeight,
      width: pieceWidth,
      height: pieceHeight,
      imageUrl,
      imagePosition: `${-(i % cols) * pieceWidth}% ${-Math.floor(i / cols) * pieceHeight}%`,
      locked: false
    }));
  }, [config]);

  // Cargar estado inicial y configurar listeners
  useEffect(() => {
    socket.emit('RequestPuzzleState', roomId);
    
    const updateHandler = (updatedPieces) => {
      setPieces(updatedPieces.length > 0 ? updatedPieces : initializePieces());
    };

    socket.on('UpdatePieces', updateHandler);
    return () => socket.off('UpdatePieces', updateHandler);
  }, [socket, roomId, initializePieces]);

  // Mover pieza y sincronizar
  const movePiece = useCallback((id, x, y) => {
    setPieces(prevPieces => {
      const updatedPieces = prevPieces.map(piece => {
        if (piece.id === id && !piece.locked) {
          // Mantener dentro de los límites del contenedor
          x = Math.max(0, Math.min(100 - piece.width, x));
          y = Math.max(0, Math.min(100 - piece.height, y));
          
          // Verificar snap con piezas adyacentes
          const adjacentPieces = prevPieces.filter(p => 
            p.locked && isAdjacent(piece, p)
          );
          
          for (const adjPiece of adjacentPieces) {
            const dx = Math.abs(x - adjPiece.x);
            const dy = Math.abs(y - adjPiece.y);
            
            if (dx < SNAP_THRESHOLD && dy < SNAP_THRESHOLD) {
              x = adjPiece.x + (piece.col > adjPiece.col ? adjPiece.width : -piece.width);
              y = adjPiece.y + (piece.row > adjPiece.row ? adjPiece.height : -piece.height);
              socket.emit('LockPiece', { roomId, pieceId: id, x, y });
              return { ...piece, x, y, locked: true };
            }
          }
          
          return { ...piece, x, y };
        }
        return piece;
      });
      
      socket.emit('MovePiece', { roomId, pieceId: id, x, y });
      return updatedPieces;
    });
  }, [socket, roomId]);

  // Componente de Pieza optimizado
  const PuzzlePiece = React.memo(({ piece }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'PUZZLE_PIECE',
      item: { id: piece.id },
      collect: monitor => ({
        isDragging: !!monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: 'PUZZLE_PIECE',
      drop: (item, monitor) => {
        const offset = monitor.getClientOffset();
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const x = ((offset.x - rect.left) / rect.width) * 100;
        const y = ((offset.y - rect.top) / rect.height) * 100;
        movePiece(item.id, x, y);
      },
    });

    return (
      <div
        ref={node => drag(drop(node))}
        className={`puzzle-piece ${piece.locked ? 'locked' : ''}`}
        style={{
          position: 'absolute',
          left: `${piece.x}%`,
          top: `${piece.y}%`,
          width: `${piece.width}%`,
          height: `${piece.height}%`,
          backgroundImage: `url(${piece.imageUrl})`,
          backgroundPosition: piece.imagePosition,
          backgroundSize: `${100 * config.cols}% ${100 * config.rows}%`,
          transform: 'translate(-50%, -50%)',
          transition: isDragging ? 'none' : 'all 0.3s ease',
          zIndex: isDragging ? 100 : piece.locked ? 1 : 2,
          aspectRatio: '1/1' // Mantiene proporción cuadrada
        }}
      />
    );
  });

  return (
    <div 
      ref={containerRef}
      className="puzzle-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '500px' // Altura mínima para pantallas grandes
      }}
    >
      {pieces.map(piece => (
        <PuzzlePiece key={piece.id} piece={piece} />
      ))}
    </div>
  );
}

// Helper functions
function isAdjacent(p1, p2) {
  return Math.abs(p1.row - p2.row) <= 1 && Math.abs(p1.col - p2.col) <= 1;
}