import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Stage, Layer, Line, Rect } from 'react-konva';
import Swal from 'sweetalert2';
import '../styles/drawingComponent.css';

const DrawingGame = ({ gameConfig, onGameComplete }) => {
  // Parámetros de la URL y contexto
  const { partidaId, equipoNumero } = useParams();
  const socket = useSocket();
  const stageRef = useRef(null);
  
  // Estados del dibujo
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('brush');
  const [lines, setLines] = useState([]);
  const [remoteLines, setRemoteLines] = useState({});
  const [tinta, setTinta] = useState(5000);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [lastColor, setLastColor] = useState('#000000');
  const [currentGameInfo, setCurrentGameInfo] = useState(null);
  const isResetting = useRef(false);

  // Referencias y constantes
  const userId = localStorage.getItem('userId');
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const animationRef = useRef(null);
  const tintaConsumida = useRef(0);
  const MAX_TINTA = 5000;
  

  // Paleta de colores
  const colorPalette = [
    '#FF0000', '#FF6600', '#FFCC00', '#FFFF00',
    '#00FF00', '#00CC33', '#006699', '#0000FF',
    '#6600FF', '#9933FF', '#FF00FF', '#FF33CC',
    '#000000', '#FFFFFF', '#888888'
];

 socket.emit('joinDrawingTeam', { partidaId, equipoNumero });

  useEffect(() => {
    if (!socket || !partidaId) return;
    socket.emit('getGameConfig', partidaId, (response) => {
      if (response.error) {
        console.error('Error al obtener configuración:', response.error);
        return;
      }
      if (response.juegos?.length > 0) {
        const initialIndex = response.currentIndex || 0;
        const currentGame = response.juegos[initialIndex];
        if (currentGame && currentGame.tema) {
          setCurrentGameInfo({ tema: currentGame.tema });
        }
      }
    });
  }, [socket, partidaId]);

  // Cargar estado inicial desde localStorage
  useEffect(() => {
  const loadSavedState = () => {
    try {
      const savedLines = localStorage.getItem(`lines-${partidaId}-${equipoNumero}-${userId}`);
      const savedTinta = localStorage.getItem(`tinta-${partidaId}-${equipoNumero}-${userId}`);
      
      if (savedLines) {
        const parsedLines = JSON.parse(savedLines);
        if (Array.isArray(parsedLines)) {
          setLines(parsedLines);
          // Emitir al servidor los trazos cargados
          socket.emit('syncSavedLines', {
            partidaId,
            equipoNumero,
            userId,
            lines: parsedLines
          });
        }
      }
      
      if (savedTinta) {
        const parsedTinta = parseInt(savedTinta);
        if (!isNaN(parsedTinta)) {
          setTinta(parsedTinta);
          tintaConsumida.current = MAX_TINTA - parsedTinta;
          
          // Emitir al servidor el estado de la tinta al cargar
          if (socket) {
            socket.emit('updateTintaState', {
              partidaId,
              equipoNumero,
              userId,
              tinta: parsedTinta
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  };

  loadSavedState();
}, [partidaId, equipoNumero, userId, socket]);


  useEffect(() => {
  if (!socket) return;

  const updateRemoteLines = (newData) => {
    setRemoteLines((prev) => {
      const merged = { ...prev };

      for (const [userId, paths] of Object.entries(newData)) {
        merged[userId] = paths;
      }

      return merged;
    });
  };

  

  const handleDrawingAction = (action) => {
    if (!action || action.userId === userId) return;

    setRemoteLines((prev) => {
      const updated = { ...prev };
      const current = updated[action.userId] || [];

      switch (action.type) {
        case 'pathStart':
          updated[action.userId] = [...current, action.path];
          break;

        case 'pathUpdate':
        case 'pathComplete': {
          const index = current.findIndex(p => p.id === action.path?.id);
          if (index !== -1) current[index] = action.path;
          else current.push(action.path);
          updated[action.userId] = [...current];
          break;
        }

        case 'clear':
          delete updated[action.userId];
          break;
      }

      return updated;
    });
  };

  const handleGameState = ({ actions, tintaState }) => {
    const grouped = {};

    if (!isResetting.current && tintaState?.[userId] !== undefined) {
      const parsed = parseInt(tintaState[userId]);
      if (!isNaN(parsed)) {
        tintaConsumida.current = MAX_TINTA - parsed;
        setTinta(parsed);
      }
    }

    actions?.forEach(({ userId, path }) => {
      if (!grouped[userId]) grouped[userId] = [];
      grouped[userId].push(path);
    });

    updateRemoteLines(grouped);

    if (tintaState?.[userId] !== undefined) {
      const parsed = parseInt(tintaState[userId]);
      if (!isNaN(parsed)) {
        tintaConsumida.current = MAX_TINTA - parsed;
        setTinta(parsed);
      }
    }
  };

  socket.on('drawingAction', handleDrawingAction);
  socket.on('drawingGameState', handleGameState);

  socket.emit('initDrawingGame', { partidaId, equipoNumero, userId });

  return () => {
    socket.off('drawingAction', handleDrawingAction);
    socket.off('drawingGameState', handleGameState);
  };
}, [socket, partidaId, equipoNumero, userId]);

useEffect(() => {
  if (!socket) return;

  const handleDrawingCleared = () => {
    console.log("🧽 Drawing cleared, limpiando canvas local");
    clearLocalDrawing();
  };

  socket.on('drawingCleared', handleDrawingCleared);

  return () => {
    socket.off('drawingCleared', handleDrawingCleared);
  };
}, [socket]);

const clearLocalDrawing = () => {
  setLines([]);
  setRemoteLines({});
  setTinta(MAX_TINTA);
  tintaConsumida.current = 0;
  lastPoint.current = null;

  // Limpiar storage
  localStorage.removeItem(`lines-${partidaId}-${equipoNumero}-${userId}`);
  localStorage.setItem(`tinta-${partidaId}-${equipoNumero}-${userId}`, MAX_TINTA.toString());
};

  // Guardar líneas en localStorage cuando cambian
  useEffect(() => {
    const saveLines = () => {
      try {
        localStorage.setItem(
          `lines-${partidaId}-${equipoNumero}-${userId}`, 
          JSON.stringify(lines)
        );
      } catch (error) {
        console.error('Error saving lines:', error);
      }
    };

    saveLines();
  }, [lines, partidaId, equipoNumero, userId]);

  // Guardar tinta en localStorage cuando cambia
  useEffect(() => {
    const saveTinta = () => {
      try {
        localStorage.setItem(
          `tinta-${partidaId}-${equipoNumero}-${userId}`, 
          tinta.toString()
        );
      } catch (error) {
        console.error('Error saving tinta:', error);
      }
    };

    saveTinta();
  }, [tinta, partidaId, equipoNumero, userId]);

  // Manejo de herramientas y colores
  const handleColorSelect = (colorHex) => {
    setColor(colorHex);
    if (tool === 'eraser') setTool('brush');
    setShowColorPicker(false);
  };

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  const handleToolSelect = (selectedTool) => {
    setTool(selectedTool);
    if (selectedTool === 'eraser') {
      setLastColor(color);
      setColor('#ffffff');
    } else {
      setColor(lastColor);
    }
  };

  // Iniciar nuevo trazo
  const startNewLine = (pos) => {
    const newLine = {
      points: [pos.x, pos.y],
      color: tool === 'eraser' ? '#ffffff' : color,
      strokeWidth: brushSize,
      userId,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setLines(prevLines => [...prevLines, newLine]);
    return newLine;
  };

  // Dibujar línea
  const drawLine = (point) => {
    if (!isDrawing.current || tinta <= 0) return;
    
    // Calcular consumo de tinta
    if (lastPoint.current) {
      const distance = Math.sqrt(
        Math.pow(point.x - lastPoint.current.x, 2) + 
        Math.pow(point.y - lastPoint.current.y, 2)
      );
      
      if (tintaConsumida.current + distance >= MAX_TINTA) {
        endDrawing();
        Swal.fire({
          title: '¡Sin tinta!',
          text: 'Debes limpiar tu dibujo para recargar.',
          icon: 'warning',
          timer: 1500,
          showConfirmButton: false
        });
        return;
      }
      
      tintaConsumida.current += distance;
      const newTinta = MAX_TINTA - tintaConsumida.current;
      setTinta(newTinta);
    }
    
    lastPoint.current = point;
    
    // Actualizar última línea
    setLines(prevLines => {
      if (prevLines.length === 0) {
        const newLine = startNewLine(point);
        emitDrawingAction('pathStart', newLine);
        return [newLine];
      }
      
      const updatedLines = [...prevLines];
      const lastLine = updatedLines[updatedLines.length - 1];
      const updatedLine = {
        ...lastLine,
        points: [...lastLine.points, point.x, point.y]
      };
      
      updatedLines[updatedLines.length - 1] = updatedLine;
      
      if (updatedLine.points.length % 3 === 0) {
        emitDrawingAction('pathUpdate', updatedLine);
      }
      
      return updatedLines;
    });
    
    // Renderizado optimizado
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(() => {});
  };

  useEffect(() => {
  if (!socket) return;

  const handleSyncResponse = ({ actions }) => {
    const syncedLines = {};
    actions?.forEach(({ userId, path }) => {
      if (userId && path) {
        syncedLines[userId] = [...(syncedLines[userId] || []), path];
      }
    });
    setRemoteLines(syncedLines);
  };

  socket.on('drawingSyncResponse', handleSyncResponse);

  return () => {
    socket.off('drawingSyncResponse', handleSyncResponse);
  };
}, [socket, partidaId, equipoNumero, userId]);

  useEffect(() => {
  if (!socket) return;

  // Función para manejar acciones remotas en tiempo real
  const handleRemoteAction = (action) => {
    if (!action || action.userId === userId) return;

    setRemoteLines(prev => {
      const newRemoteLines = {...prev};
      
      switch (action.type) {
        case 'pathStart':
          newRemoteLines[action.userId] = [...(newRemoteLines[action.userId] || []), action.path];
          break;
          
        case 'pathUpdate':
          if (newRemoteLines[action.userId]) {
            const index = newRemoteLines[action.userId].findIndex(l => l.id === action.path?.id);
            if (index >= 0 && action.path) {
              newRemoteLines[action.userId][index] = action.path;
            }
          }
          break;
          
        case 'pathComplete':
          if (newRemoteLines[action.userId]) {
            const index = newRemoteLines[action.userId].findIndex(l => l.id === action.path?.id);
            if (index >= 0 && action.path) {
              newRemoteLines[action.userId][index] = action.path;
            }
          }
          break;
          
        case 'clear':
          delete newRemoteLines[action.userId];
          socket.emit('initDrawingGame', { partidaId, equipoNumero, userId });
          break;
      }
      
      return newRemoteLines;
    });
  };

  

  // Función para sincronización inicial
  const handleSyncResponse = ({ actions }) => {
    const syncedLines = {};
    actions?.forEach(({ userId, path }) => {
      if (userId && path) {
        syncedLines[userId] = [...(syncedLines[userId] || []), path];
      }
    });
    setRemoteLines(syncedLines);
  };

  // Configurar listeners
  socket.on('drawingAction', handleRemoteAction);
  socket.on('drawingSyncResponse', handleSyncResponse);

  // Solicitar sincronización inicial
  socket.emit('requestDrawingSync', { partidaId, equipoNumero, userId });

  return () => {
    socket.off('drawingAction', handleRemoteAction);
    socket.off('drawingSyncResponse', handleSyncResponse);
  };
}, [socket, partidaId, equipoNumero, userId]);

  // Emitir acción de dibujo
  const emitDrawingAction = (type, line) => {
    if (!socket || !line) return;
    
    try {
      socket.emit('drawingAction', {
        partidaId,
        equipoNumero,
        userId,
        action: {
          type,
          path: {
            id: line.id,
            points: line.points || [],
            color: line.color || '#000000',
            strokeWidth: line.strokeWidth || 5
          }
        }
      });
    } catch (error) {
      console.error('Error emitting drawing action:', error);
    }
  };

  // Finalizar dibujo
  const endDrawing = () => {
    if (!isDrawing.current) return;
    
    isDrawing.current = false;
    lastPoint.current = null;
    
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      emitDrawingAction('pathComplete', lastLine);
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Asegurarse de que el estado de dibujo se resetea completamente
    document.body.style.cursor = 'default';
  };

  // Eventos del mouse/touch
  const handleMouseDown = (e) => {
    if (tinta <= 0) return;
    
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    
    isDrawing.current = true;
    startNewLine(pos);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;
    
    drawLine(point);
  };

  const handleMouseUp = () => {
    endDrawing();
  };

  // Limpiar dibujos
  const clearUserDrawing = async () => {
  isResetting.current = true;
  
  // 1. Limpiar estado local completamente
  setLines([]);
  setRemoteLines({});
  
  // 2. Limpiar localStorage
  localStorage.removeItem(`lines-${partidaId}-${equipoNumero}-${userId}`);
  localStorage.setItem(`tinta-${partidaId}-${equipoNumero}-${userId}`, MAX_TINTA.toString());

  // 3. Resetear contadores locales
  tintaConsumida.current = 0;
  setTinta(MAX_TINTA);

  // 4. Emitir eventos de limpieza
  socket.emit('clearDrawingPaths', { 
    partidaId, 
    equipoNumero, 
    userId,
    clearAll: true
  });

  socket.emit('updateTintaState', {
    partidaId,
    equipoNumero,
    userId,
    tinta: MAX_TINTA
  });

  // 5. Esperar un breve momento para que el servidor procese la limpieza
  await new Promise(resolve => setTimeout(resolve, 300));

  // 6. Solicitar una recarga completa de los trazos remotos
  socket.emit('requestDrawingSync', { 
    partidaId, 
    equipoNumero, 
    userId,
    forceRefresh: true 
  });

  // 7. Feedback visual
  Swal.fire({
    title: 'Dibujo borrado',
    text: 'Tu tinta ha sido recargada',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false
  });

  setTimeout(() => {
    isResetting.current = false;
  }, 1000);
};

useEffect(() => {
  if (!socket) return;

  const handleClearRemotePaths = ({ userId: clearedUserId }) => {
    if (clearedUserId !== userId) { // No es nuestro usuario
      setRemoteLines(prev => {
        const updated = { ...prev };
        delete updated[clearedUserId];
        return updated;
      });
    }
  };

  socket.on('clearRemotePaths', handleClearRemotePaths);

  return () => {
    socket.off('clearRemotePaths', handleClearRemotePaths);
  };
}, [socket, userId]);

useEffect(() => {
  if (!socket) return;

  const handleTintaUpdate = ({ userId: updatedUserId, tinta: newTinta }) => {
    if (updatedUserId === userId) { // Solo actualizar si es nuestro usuario
      setTinta(newTinta);
      tintaConsumida.current = MAX_TINTA - newTinta;
    }
  };

  socket.on('tintaUpdate', handleTintaUpdate);

  return () => {
    socket.off('tintaUpdate', handleTintaUpdate);
  };
}, [socket, userId]);

  // Configuración de Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleDrawingAction = (action) => {
      if (!action || action.userId === userId) return;

      setRemoteLines(prev => {
        const newRemoteLines = { ...prev };
        
        try {
          switch (action.type) {
            case 'pathStart':
              if (!newRemoteLines[action.userId]) {
                newRemoteLines[action.userId] = [];
              }
              if (action.path) {
                newRemoteLines[action.userId].push(action.path);
              }
              break;
              
            case 'pathUpdate':
            case 'pathComplete':
              if (Array.isArray(newRemoteLines[action.userId])) {
                const index = newRemoteLines[action.userId].findIndex(
                  line => line.id === action.path?.id
                );
                if (index >= 0 && action.path) {
                  newRemoteLines[action.userId][index] = action.path;
                }
              }
              break;
              
            case 'clear':
              if (newRemoteLines[action.userId]) {
                delete newRemoteLines[action.userId];
              }
              break;
          }
        } catch (error) {
          console.error('Error processing drawing action:', error);
        }
        
        return newRemoteLines;
      });
    };

    const handleGameState = (data) => {
  if (!data) return;

  const newRemoteLines = {};
  
  try {
    // Procesar acciones remotas
    if (Array.isArray(data.actions)) {
      data.actions.forEach(({ userId, path }) => {
        if (userId && path) {
          if (!newRemoteLines[userId]) {
            newRemoteLines[userId] = [];
          }
          newRemoteLines[userId].push(path);
        }
      });
    }
    
    setRemoteLines(newRemoteLines);
    
    // Solo actualizar tinta si no estamos dibujando actualmente
    if (!isDrawing.current && data.tintaState?.[userId]) {
      const newTinta = parseInt(data.tintaState[userId]);
      if (!isNaN(newTinta)) {
        // Mantener consistencia entre estado local y remoto
        const delta = tintaConsumida.current - (MAX_TINTA - newTinta);
        
        // Solo actualizar si la diferencia es significativa
        if (Math.abs(delta) > 10) { // Umbral de 10 unidades
          setTinta(newTinta);
          tintaConsumida.current = MAX_TINTA - newTinta;
        }
      }
    }
  } catch (error) {
    console.error('Error processing game state:', error);
  }
};

    socket.on('drawingAction', handleDrawingAction);
    socket.on('drawingGameState', handleGameState);
    
    // Solicitar estado inicial
    socket.emit('initDrawingGame', { 
      partidaId, 
      equipoNumero, 
      userId 
    });

    return () => {
      socket.off('drawingAction', handleDrawingAction);
      socket.off('drawingGameState', handleGameState);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [socket, partidaId, equipoNumero, userId]);

  

  // Renderizado
  return (
    <div className="drawing__container">
      <div className="container__canvas">
        {/* Área de dibujo */}
        <div className="canvas__drawing">
          <Stage
             width={800}
            height={600}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} 
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onTouchCancel={handleMouseUp} 
          >
            <Layer>
              {/* Fondo blanco */}
              <Rect 
                width={800} 
                height={600} 
                fill="#ffffff" 
                listening={false} 
              />

              {/* Líneas remotas */}
              {Object.entries(remoteLines).flatMap(([userId, userLines]) =>
                Array.isArray(userLines)
                  ? userLines
                      .filter(line => line?.points?.length > 1)
                      .map(line => (
                        <Line
                          key={`remote-${userId}-${line.id}`}
                          points={line.points}
                          stroke={line.color}
                          strokeWidth={line.strokeWidth}
                          tension={0.5}
                          lineCap="round"
                          lineJoin="round"
                          listening={false}
                          globalCompositeOperation={
                            line.color === '#ffffff' ? 'destination-out' : 'source-over'
                          }
                        />
                      ))
                  : []
              )}


              {/* Líneas locales */}
              {lines.map((line) => (
                line?.points?.length > 1 && (
                  <Line
                    key={`local-${line.id}`}
                    points={line.points}
                    stroke={line.color}
                    strokeWidth={line.strokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    listening={false}
                    globalCompositeOperation={
                      line.color === '#ffffff' ? 'destination-out' : 'source-over'
                    }
                  />
                )
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
      <div className="details__group">
        <p>Número de grupo</p>
        <span>{equipoNumero}</span>
      </div>      
      <div className="container__theme">                    
          <div className="container__header">
              <h3>Tema:</h3>
          </div>
          <div className="container__body">
              <span>{currentGameInfo?.tema || 'Sin tema'}</span>
          </div>
      </div>      
      {/* Barra de herramientas */}
      <div className="drawing__tools">
          {/* Sección de colores */}
          <div className="colors-section-extended">
            <div className="color-palette-wide">
              <div className="color-rows-container">
                <div className="color-row">
                  {colorPalette.map((colorHex, index) => (
                    <button
                      key={`color-${index}`}
                      className={`color-chip ${color === colorHex ? 'active' : ''}`}
                      style={{ backgroundColor: colorHex }}
                      onClick={() => handleColorSelect(colorHex)}
                      title={`Color ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="custom-color-container">                
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="custom-color-picker-large"
                  onBlur={() => setShowColorPicker(false)}
                />
              </div>
            </div>
          </div>
              
          {/* Sección de herramientas */}
          <div className="tools__section">                    
            <button 
                className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
                onClick={() => handleToolSelect('brush')}
                title="Pincel"
              >
                <i className="fas fa-paint-brush"></i>
            </button>
            <button 
                className="tool-btn"
                onClick={clearUserDrawing}
                title="Limpiar mi dibujo"
              >
                <i className="fas fa-trash-alt"></i>
            </button>              
            {/* Indicador de tinta */}
            <div className="ink__tank">
              <div
                className={`tank__fill ${
                  tinta <= 1000 ? 'tank__critical' : 
                  tinta <= 3000 ? 'tank__low' : ''
                }`}
                style={{ height: `${(tinta / MAX_TINTA) * 100}%` }}
              />
            </div>
          </div>
                  
          {/* Control de tamaño */}
          <div className="size__controls">
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="size__slider"
            />
            <span className="brush-size-label">{brushSize}px</span>
          </div>
      </div>
    </div>
  );
};

export default DrawingGame;