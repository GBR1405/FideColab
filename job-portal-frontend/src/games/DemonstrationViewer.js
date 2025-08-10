import React, { useEffect, useRef, useState } from 'react';

const DemonstrationViewer = ({ socket, partidaId, equipoNumero, isProfessor }) => {
  const canvasRef = useRef(null);
  const [currentTeam, setCurrentTeam] = useState(equipoNumero);
  const [totalTeams, setTotalTeams] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  const numericPartidaId = Number(partidaId);

  // Obtener cantidad de equipos al montar (solo profesor)
  useEffect(() => {
    if (!isProfessor) return;

    socket.emit('getTeamsForPartida', numericPartidaId, (response) => {
      if (response.success) {
        setTotalTeams(response.equipos.length);
      } else {
        console.error('[DemoViewer] Error al obtener equipos:', response.error);
      }
    });
  }, [isProfessor, numericPartidaId]);

  // Solicitar dibujo actual
  const fetchDrawing = () => {
    if (!socket || currentTeam == null) return;

    socket.emit(
      'getDemoDrawing',
      { partidaId: numericPartidaId, equipoNumero: currentTeam },
      (response) => {
        if (response.success) {
          drawCanvas(response.drawing);
          setLastUpdate(new Date());
        } else {
          setError(response.error || 'No se pudo cargar dibujo');
          clearCanvas();
        }
      }
    );
  };

  // Redibujo periódico
  useEffect(() => {
    if (!currentTeam) return;
    fetchDrawing(); // primer fetch

    const interval = setInterval(() => {
      fetchDrawing();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTeam]);

  // Navegación profesor
  const handlePrev = () => {
    if (currentTeam > 1) setCurrentTeam((prev) => prev - 1);
  };
  const handleNext = () => {
    if (currentTeam < totalTeams) setCurrentTeam((prev) => prev + 1);
  };

  // Canvas fixed 800x600
  const drawCanvas = (drawingData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / 1280;
    const scaleY = canvas.height / 720;

    Object.values(drawingData).forEach((userPaths) => {
      userPaths.forEach((path) => {
        if (!Array.isArray(path.points) || path.points.length < 4) return;

        ctx.beginPath();
        ctx.strokeStyle = path.color || '#000000';
        ctx.lineWidth = path.strokeWidth || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < path.points.length; i += 2) {
          const x = path.points[i] * scaleX;
          const y = path.points[i + 1] * scaleY;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      });
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div>
      <h3>Modo Demostración - Equipo {currentTeam}</h3>

      {isProfessor && (
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={handlePrev} disabled={currentTeam <= 1}>← Anterior</button>
          <button onClick={handleNext} disabled={currentTeam >= totalTeams}>Siguiente →</button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
      />

      {lastUpdate && (
        <p style={{ fontSize: '0.8rem' }}>
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default DemonstrationViewer;
