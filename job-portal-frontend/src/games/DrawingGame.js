import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Swal from 'sweetalert2';
import '../styles/games.css';

const DrawingGame = ({ gameConfig, onGameComplete }) => {
  const { partidaId, equipoNumero } = useParams();
  const socket = useSocket();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('brush');
  const [showDemo, setShowDemo] = useState(false);
  const [currentDemoTeam, setCurrentDemoTeam] = useState(1);
  const [demoDrawings, setDemoDrawings] = useState({});
  const [shape, setShape] = useState(null);
  const [startPos, setStartPos] = useState(null);

  const [lastColor, setLastColor] = useState('#000000');
  const [demoMode, setDemoMode] = useState(false);
  const [demoProgress, setDemoProgress] = useState('');

  const [drawingDemonstration, setDrawingDemonstration] = useState({});

  const [totalTeams, setTotalTeams] = useState(0);

  let tempCanvasState = null;

  // Inicializar canvas y cargar estado
  useEffect(() => {
    if (!socket || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Configurar canvas
    canvas.width = 800;
    canvas.height = 600;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Inicializar juego
    socket.emit('initDrawingGame', { partidaId, equipoNumero });

    // Escuchar acciones de dibujo
    socket.on('drawingAction', (action) => {
      handleRemoteAction(action);
    });

    // Escuchar inicio de demostración
    socket.on('drawingDemoStarted', (teams) => {
      setShowDemo(true);
      setCurrentDemoTeam(Math.min(...teams.map(Number)));
      loadDemoDrawings(teams);
    });

    return () => {
      socket.off('drawingAction');
      socket.off('drawingDemoStarted');
    };
  }, [socket, partidaId, equipoNumero]);

  const generateGradientColors = () => {
    const gradients = [];
    // Degradado rojo a amarillo
    for (let i = 0; i < 4; i++) {
      gradients.push(`rgb(255, ${Math.floor(255 * i/3)}, 0)`);
    }
    // Degradado verde a cyan
    for (let i = 0; i < 4; i++) {
      gradients.push(`rgb(0, 255, ${Math.floor(255 * i/3)})`);
    }
    // Degradado azul a morado
    for (let i = 0; i < 4; i++) {
      gradients.push(`rgb(${Math.floor(255 * i/3)}, 0, 255)`);
    }
    // Colores adicionales
    return [...gradients, '#000000', '#FFFFFF', '#888888'];
  };
  
  // Lógica de relleno mejorada
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'fill') {
      floodFill(ctx, Math.round(x), Math.round(y), color);
      
      // Enviar el cambio al servidor
      const imageData = canvas.toDataURL();
      socket.emit('drawingAction', {
        partidaId,
        equipoNumero,
        action: {
          type: 'fill',
          x: x / canvas.width,
          y: y / canvas.height,
          color,
          imageData
        }
      });
    }
  };

  useEffect(() => {
    if (!socket) return;
  
    const handleDemoStarted = ({ currentTeam, totalTeams }) => {
      setDemoMode(true);
      setCurrentDemoTeam(currentTeam);
      setDemoProgress(`1/${totalTeams}`);
    };
  
    const handleTeamChanged = ({ currentTeam, teamIndex, totalTeams }) => {
      setCurrentDemoTeam(currentTeam);
      setDemoProgress(`${teamIndex}/${totalTeams}`);
    };
  
    socket.on('demoStarted', handleDemoStarted);
    socket.on('demoTeamChanged', handleTeamChanged);
  
    return () => {
      socket.off('demoStarted', handleDemoStarted);
      socket.off('demoTeamChanged', handleTeamChanged);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
  
    const handleDemoStarted = (response) => {
      if (response.status === 'error') {
        return Swal.fire('Info', response.message, 'info');
      }
  
      // Validar que teams sea un array
      const teams = Array.isArray(response.teams) ? 
        response.teams.map(Number).filter(n => !isNaN(n)) : [];
  
      if (teams.length === 0) {
        return Swal.fire('Info', 'No hay dibujos para mostrar', 'info');
      }
  
      setShowDemo(true);
      setCurrentDemoTeam(response.currentTeam);
      loadDemoDrawings(teams);
    };
  
    socket.on('drawingDemoStarted', handleDemoStarted);
  
    return () => {
      socket.off('drawingDemoStarted', handleDemoStarted);
    };
  }, [socket, partidaId]);
  
  // Funciones auxiliares para el relleno
  const getPixelColor = (imageData, x, y) => {
    const pos = (y * imageData.width + x) * 4;
    return [
      imageData.data[pos],
      imageData.data[pos+1],
      imageData.data[pos+2],
      imageData.data[pos+3]
    ];
  };

  

  const colorsMatch = (color1, color2) => {
    return (
      color1[0] === color2[0] &&
      color1[1] === color2[1] &&
      color1[2] === color2[2] &&
      color1[3] === color2[3]
    );
  };

  
  
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 255];
  };
  
  // Algoritmo básico de flood fill
  const floodFill = (ctx, x, y, fillColor) => {
    const canvas = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelStack = [[x, y]];
    const targetColor = getPixelColor(imageData, x, y);
    
    if (colorsMatch(targetColor, hexToRgb(fillColor))) return;
  
    while (pixelStack.length) {
      const [cx, cy] = pixelStack.pop();
      const pos = (cy * canvas.width + cx) * 4;
      
      // Verificar límites y coincidencia de color
      if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;
      if (!colorsMatch(getPixelColor(imageData, cx, cy), targetColor)) continue;
      
      // Pintar el pixel
      imageData.data[pos] = parseInt(fillColor.substr(1, 2), 16);   // R
      imageData.data[pos+1] = parseInt(fillColor.substr(3, 2), 16); // G
      imageData.data[pos+2] = parseInt(fillColor.substr(5, 7), 16); // B
      imageData.data[pos+3] = 255; // Alpha
      
      // Agregar vecinos
      pixelStack.push(
        [cx + 1, cy], [cx - 1, cy],
        [cx, cy + 1], [cx, cy - 1]
      );
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  // Inicializar canvas y cargar estado
  useEffect(() => {
    if (!socket || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Configurar canvas
    canvas.width = 800;
    canvas.height = 600;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Eventos de demostración
    const handleDemoStarted = ({ currentTeam, totalTeams, teams }) => {
      setShowDemo(true);
      setCurrentDemoTeam(currentTeam);
      setTotalTeams(totalTeams);
      
      // Cargar todos los dibujos
      teams.forEach(team => {
        socket.emit('getDrawingForDemo', { partidaId, equipoNumero: team }, (imageData) => {
          if (imageData) {
            setDemoDrawings(prev => ({
              ...prev,
              [team]: imageData
            }));
          }
        });
      });
    };

    const handleTeamChanged = ({ currentTeam }) => {
      setCurrentDemoTeam(currentTeam);
    };

    const handleDemoEnded = () => {
      setShowDemo(false);
      setCurrentDemoTeam(null);
      setDemoDrawings({});
    };

    socket.on('demoStarted', handleDemoStarted);
    socket.on('demoTeamChanged', handleTeamChanged);
    socket.on('demoEnded', handleDemoEnded);

    return () => {
      socket.off('demoStarted', handleDemoStarted);
      socket.off('demoTeamChanged', handleTeamChanged);
      socket.off('demoEnded', handleDemoEnded);
    };
  }, [socket, partidaId]);
  
  useEffect(() => {
    if (!socket) return;
  
    const handleInitialState = ({ actions, isInitial }) => {
      if (isInitial) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Limpiar canvas primero
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Replay todas las acciones
        actions.forEach(action => {
          handleRemoteAction(action);
        });
      }
    };
  
    socket.on('drawingGameState', handleInitialState);
  
    return () => {
      socket.off('drawingGameState', handleInitialState);
    };
  }, [socket]);

  const handleRemoteAction = (action) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    switch(action.type) {
      case 'start':
        ctx.beginPath();
        ctx.moveTo(action.x * canvas.width, action.y * canvas.height);
        break;
      case 'draw':
        ctx.lineTo(action.x * canvas.width, action.y * canvas.height);
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.size;
        ctx.stroke();
        break;
      case 'fill':
        ctx.fillStyle = action.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;
      case 'clear':
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!socket) return;
  
    const handleShape = (action) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = action.color;
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.size;
      
      const startX = action.startX * canvas.width;
      const startY = action.startY * canvas.height;
      const endX = action.endX * canvas.width;
      const endY = action.endY * canvas.height;
      
      if (action.type === 'rectangle') {
        const width = endX - startX;
        const height = endY - startY;
        ctx.strokeRect(startX, startY, width, height);
      } else if (action.type === 'circle') {
        const radius = Math.sqrt(
          Math.pow(endX - startX, 2) + 
          Math.pow(endY - startY, 2)
        );
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };
  
    socket.on('drawShape', handleShape);
  
    return () => {
      socket.off('drawShape', handleShape);
    };
  }, [socket]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    
    setIsDrawing(true);
    
    // Emitir acción
    const action = {
      type: 'start',
      x,
      y,
      color,
      size: brushSize
    };
    
    socket.emit('drawingAction', { partidaId, equipoNumero, action });
    handleRemoteAction(action);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    
    // Emitir acción
    const action = {
      type: 'draw',
      x,
      y,
      color: tool === 'eraser' ? '#FFFFFF' : color, // Usar blanco para borrar
      size: brushSize
    };
    
    socket.emit('drawingAction', { partidaId, equipoNumero, action });
    handleRemoteAction(action);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    autoSaveDrawing();
  };

  const autoSaveDrawing = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    socket.emit('saveDrawing', { partidaId, equipoNumero, imageData });
  };

  const changeTool = (newTool) => {
    setTool(newTool);
    setShape(null);
    // Cambiar el color según la herramienta
    if (newTool === 'eraser') {
      setColor('#FFFFFF'); // Fondo blanco para borrar
    }
  };

  const startDrawingShape = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    
    setStartPos({ x, y });
  };
  
  const drawShape = (e) => {
    if (!startPos) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    
    // Guardar el estado actual del canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Limpiar temporalmente solo para la vista previa
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redibujar todas las acciones existentes
    socket.emit('getDrawingState', { partidaId, equipoNumero }, (actions) => {
      actions.forEach(a => handleRemoteAction(a));
      
      // Dibujar la forma temporal
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      
      const startX = startPos.x * canvas.width;
      const startY = startPos.y * canvas.height;
      const width = (x - startPos.x) * canvas.width;
      const height = (y - startPos.y) * canvas.height;
      
      if (tool === 'rectangle') {
        ctx.strokeRect(startX, startY, width, height);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(width * width + height * height);
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Guardar el estado temporal para poder restaurarlo
      tempCanvasState = {
        imageData,
        shapePreview: { tool, startPos, currentPos: { x, y }, color, size: brushSize }
      };
    });
  };

  const restoreCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (tempCanvasState?.imageData) {
      ctx.putImageData(tempCanvasState.imageData, 0, 0);
    }
    
    if (tempCanvasState?.shapePreview) {
      const { tool, startPos, currentPos, color, size } = tempCanvasState.shapePreview;
      const startX = startPos.x * canvas.width;
      const startY = startPos.y * canvas.height;
      const width = (currentPos.x - startPos.x) * canvas.width;
      const height = (currentPos.y - startPos.y) * canvas.height;
      
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      
      if (tool === 'rectangle') {
        ctx.strokeRect(startX, startY, width, height);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(width * width + height * height);
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };
  
  const endDrawingShape = (e) => {
    if (!startPos) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    
    // Emitir acción de forma
    const action = {
      type: tool, // 'rectangle' o 'circle'
      startX: startPos.x,
      startY: startPos.y,
      endX: x,
      endY: y,
      color,
      size: brushSize
    };
    
    socket.emit('drawingAction', { partidaId, equipoNumero, action });
    
    // Limpiar estado
    setStartPos(null);
  };

  const clearCanvas = () => {
    const action = { type: 'clear' };
    socket.emit('drawingAction', { partidaId, equipoNumero, action });
    handleRemoteAction(action);
  };

  const fillCanvas = () => {
    const action = { type: 'fill', color };
    socket.emit('drawingAction', { partidaId, equipoNumero, action });
    handleRemoteAction(action);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    socket.emit('saveDrawing', { partidaId, equipoNumero, imageData });
  };

  const loadDemoDrawings = (teams) => {
    // Asegurarse que teams es un array
    const validTeams = Array.isArray(teams) ? teams : [];
    
    validTeams.forEach(team => {
      // Validar que team sea un número válido
      const teamNumber = Number(team);
      if (isNaN(teamNumber)) return;
  
      socket.emit('getDrawingForDemo', { 
        partidaId, 
        equipoNumero: teamNumber 
      }, (imageData) => {
        if (imageData) {
          setDemoDrawings(prev => ({
            ...prev,
            [teamNumber]: imageData
          }));
        }
      });
    });
  };

  const nextDemoDrawing = () => {
    const nextTeam = currentDemoTeam + 1;
    if (nextTeam <= totalTeams) {
      socket.emit('changeDemoTeam', { partidaId, equipoNumero: nextTeam });
    }
  };

  const prevDemoDrawing = () => {
    const prevTeam = currentDemoTeam - 1;
    if (prevTeam >= 1) {
      socket.emit('changeDemoTeam', { partidaId, equipoNumero: prevTeam });
    }
  };

  const downloadDrawing = () => {
    const link = document.createElement('a');
    link.download = `dibujo-equipo-${currentDemoTeam}.png`;
    link.href = demoDrawings[currentDemoTeam];
    link.click();
  };

  const handleColorSelect = (colorHex) => {
    setColor(colorHex);
    if (tool === 'eraser') setTool('brush');
    setLastColor(colorHex);
  };

  const endDemonstration = () => {
    setShowDemo(false);
    // Emitir evento para continuar al siguiente juego
    socket.emit('nextGame', partidaId);
  };

  if (showDemo && currentDemoTeam) {
    return (
      <div className="demo-container">
        <h2>Demostración de Dibujos</h2>
        <div className="demo-info">
          Mostrando dibujo del Equipo {currentDemoTeam} de {totalTeams}
        </div>
        
        <div className="demo-image-container">
          {demoDrawings[currentDemoTeam] ? (
            <img 
              src={demoDrawings[currentDemoTeam]} 
              alt={`Dibujo del Equipo ${currentDemoTeam}`}
              className="demo-image"
            />
          ) : (
            <div className="no-drawing">Dibujo no disponible</div>
          )}
        </div>

        <div className="demo-controls">
          <button 
            onClick={prevDemoDrawing} 
            disabled={currentDemoTeam <= 1}
          >
            Anterior
          </button>
          <button 
            onClick={nextDemoDrawing} 
            disabled={currentDemoTeam >= totalTeams}
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="drawing-game-container">
      <h2 className="drawing-title">Tema: {gameConfig.tema}</h2>
      <div className="drawing-tools-horizontal-extended">
        {/* Sección de colores - Más ancha */}
        <div className="colors-section-extended">
            <div className="color-palette-wide">
        {/* Fila de colores */}
        <div className="color-rows-container">
        <div className="color-row">
            {[
                '#FF0000', '#FF3300', '#FF6600', '#FF9900', '#FFCC00', '#FFFF00',
                '#00FF00', '#00CC33', '#009966', '#006699', '#0033CC', '#0000FF',
                '#6600FF', '#9933FF', '#CC66FF', '#FF00FF', '#FF33CC', '#FF6699'
                ].map((colorHex, index) => (
                    <button
                        key={`color-${index}`}
                        className={`color-chip ${color === colorHex ? 'active' : ''}`}
                        style={{ backgroundColor: colorHex }}
                        onClick={() => handleColorSelect(colorHex)}
                    />
                ))}
             </div>
        </div>

  {/* Selector de color grande */}
  <div className="custom-color-container">
    <input
      type="color"
      value={color}
      onChange={(e) => handleColorSelect(e.target.value)}
      className="custom-color-picker-large"
    />
  </div>
</div>
  </div>

  {/* Sección de herramientas - Compacta */}
  <div className="tools-section-extended">
        
        <div className="tool-row">
          <button 
            className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
            onClick={() => setTool('brush')}
            title="Pincel"
          >
            <i className="fas fa-paint-brush"></i>
          </button>
          
          <button 
            className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => {
              setTool('eraser');
              setLastColor(color);
            }}
            title="Borrador"
          >
            <i className="fas fa-eraser"></i>
          </button>
          
          <button 
            className="tool-btn"
            onClick={clearCanvas}
            title="Limpiar todo"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>


        {/* Herramientas */}
        <div className="size-section">
    <br/>
    <div className="size-controls-horizontal">
      <input
        type="range"
        min="1"
        max="30"
        value={brushSize}
        onChange={(e) => setBrushSize(e.target.value)}
        className="size-slider-horizontal"
      />
      <div className="size-indicator">
        <span>{brushSize}px</span>
        <div 
          className="brush-preview-horizontal"
          style={{
            width: `${brushSize}px`,
            height: `${brushSize}px`,
            background: tool === 'eraser' ? '#FFFFFF' : color
          }}
        />
      </div>
    </div>
  </div>
        </div >
        <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas-enhanced"
        onMouseDown={(e) => {
            if (['rectangle', 'circle'].includes(tool)) {
            startDrawingShape(e);
            } else {
            startDrawing(e);
            }
        }}
        onMouseMove={(e) => {
            if (['rectangle', 'circle'].includes(tool)) {
            drawShape(e);
            } else if (isDrawing) {
            draw(e);
            }
        }}
        onMouseUp={(e) => {
            if (['rectangle', 'circle'].includes(tool)) {
            endDrawingShape(e);
            } else {
            endDrawing();
            }
        }}
        onMouseLeave={(e) => {
            if (['rectangle', 'circle'].includes(tool)) {
            endDrawingShape(e);
            } else {
            endDrawing();
            }
        }}
        />
        </div>
    </div>
  );
};

export default DrawingGame;