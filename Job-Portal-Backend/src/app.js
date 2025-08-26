import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import userRoutes from './routes/userRoutes.js';
import bodyParser from 'body-parser';
import { poolPromise } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import PersonalizeRoutes from './routes/PersonalizeRoutes.js';
import TeacherRoutes from './routes/TeacherRoutes.js';
import AdminRouters from './routes/AdminRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authMiddleware from './middleware/authMiddleware.js';
import sql from 'mssql';
import simulationRoutes from './routes/SimulacionRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import seedrandom from 'seedrandom';
import svg2img from 'svg2img';

// Funciones auxiliares para el funcionamiento del frontend
const app = express();
app.set('trust proxy', 1);
const pool = await poolPromise;

// Configuraciones de Express
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

dotenv.config();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.post('/login', (req, res) => {

  res.cookie('authToken', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'None',
    domain: '192.168.0.4',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
  });

  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'None',
    domain: process.env.NODE_ENV === 'production' ? '.tudominio.com' : '192.168.0.4',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
  };

  res.cookie('authToken', token, cookieOptions);
  res.cookie('IFUser_Info', encryptedUser, cookieOptions);

  res.json({ success: true });
});

app.use(cors({
  origin: [
    "https://frontend-fidecolab.vercel.app"
  ],
  credentials: true,
  exposedHeaders: ['set-cookie', 'Authorization']
}));

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());

// Rutas de la aplicación
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/', PersonalizeRoutes);
app.use('/api/', AdminRouters);
app.use('/api/', TeacherRoutes);
app.use('/api/', simulationRoutes);
app.use('/api/', debugRoutes);

// Crear servidor HTTP para Express y Socket.IO
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "https://frontend-fidecolab.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Cookie', 'Authorization']
  },
  cookie: {
    name: "io",
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    secure: true
  }
});


// Constantes
const salas = {};
const partidaTeams = new Map();
const partidaRooms = new Map();

const activeGames = {};
const gameTimers = {};
const teamProgress = {};
const gameTeamProgress = {};
const gameTeamTimestamps = {};
const lockedPieces = {};

const gameProgress = {};
const gameResults = {};

const puzzleStates = {};
const puzzleGames = {};
const puzzleSelections = {};

const activeDemos = {};

const hangmanGames = {};
const hangmanVotes = {};

const memoryGames = {};

const drawingGames = {};
const teamDrawings = new Map();
const drawingDemonstration = {};
const userVotes = {};
const drawingVotes = {};
const liveDrawings = new Map();
const drawingDemoState = {};

const MAX_TINTA = 5000;
const VOTING_TIME = 5000;

//Funciones extras

// Sistema Post de Petición de Internet
app.post('/current-game-status', async (req, res) => {
  try {
    const { partidaId } = req.body;
    if (!partidaId) {
      return res.status(400).json({ error: 'Falta partidaId' });
    }

    // Aquí accedes a tu estructura donde guardas el estado de cada partida
    const partida = partidasActivas[partidaId]; // Ajusta al nombre real de tu variable
    if (!partida) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    res.json({
      currentIndex: partida.currentIndex,
      gameId: partida.currentGameId,
      timestamp: Date.now()
    });
  } catch (err) {
    console.error('Error en /current-game-status', err);
    res.status(500).json({ error: 'Error interno' });
  }
});


// Agregar esta función antes del evento nextGame
async function guardarDibujosActuales(partidaId) {
  try {
    console.log(`[SAVE] Iniciando guardado de dibujos para partida ${partidaId}`);

    const config = global.partidasConfig[partidaId];
    if (!config) {
      console.log(`[SAVE] No se encontró configuración para partida ${partidaId}`);
      return;
    }

    const currentGame = config.juegos[config.currentIndex];
    if (currentGame.tipo !== 'Dibujo') {
      console.log(`[SAVE] Juego actual no es de dibujo: ${currentGame.tipo}`);
      return;
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('partidaId', sql.Int, partidaId)
      .query('SELECT DISTINCT Equipo_Numero FROM Participantes_TB WHERE Partida_ID_FK = @partidaId');

    console.log(`[SAVE] Equipos encontrados: ${result.recordset.map(r => r.Equipo_Numero).join(', ')}`);

    for (const row of result.recordset) {
      const equipoNumero = row.Equipo_Numero;
      const gameId = `drawing-${partidaId}-${equipoNumero}`;

      console.log(`[SAVE] Procesando equipo ${equipoNumero}, gameId: ${gameId}`);

      if (!drawingGames[gameId]) {
        console.log(`[SAVE] No se encontró juego para ${gameId}, creando estructura vacía`);
        drawingGames[gameId] = { actions: {}, tintaStates: {}, imageData: null };
      }

      if (!drawingGames[gameId].imageData) {
        try {
          console.log(`[SAVE] Generando imagen para equipo ${equipoNumero}`);
          const imageData = await renderDrawingToBase64(partidaId, equipoNumero);
          drawingGames[gameId].imageData = imageData;
          console.log(`[SAVE] ✅ Dibujo guardado para partida ${partidaId}, equipo ${equipoNumero}`);
        } catch (error) {
          console.error(`[SAVE] ❌ Error guardando dibujo para equipo ${equipoNumero}:`, error);
          drawingGames[gameId].imageData = getBlankCanvasData();
        }
      } else {
        console.log(`[SAVE] Equipo ${equipoNumero} ya tiene imagen guardada`);
      }
    }

    console.log(`[SAVE] Finalizado guardado de dibujos para partida ${partidaId}`);
  } catch (error) {
    console.error('[SAVE] Error en guardarDibujosActuales:', error);
  }
}

// Función para mostrar un canvas en blanco ante un error o si no hay algun dibujo por si el equipo no dibujó nada
function getBlankCanvasData() {
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAJYCAYAAACadoJwAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVBzuIOGSoThZERRylikWwUNoKrTqYXPohNGlIUlwcBdeCgx+LVQcXZ10dXAVB8APE1cVJ0UVK/F9SaBHjwXE/3t173L0DhGaVqWbPOKBqlpFOxMVcflUMvCKIEYQxICJTT2YWM/AcX/fw8fUuyrO8z/05BpWCyQCfSDzHdMMi3iCe2bR0zvvEYVaWFOJz4nGDLkj8yHXZ5TfOJYcFnhk2Mul54jCxWOpiuYvZsqmJJ4mjqq5TvpDzWeW8xVkrV1nznvyF4YK+ssx12iNIYBFLkCBCQR0VVGEhRqtGiok07Sc8/KOOXySXTK4KGDkWUIcK2Q2D/8Hv2VqFqUkvKRQHAi+O8zEKBHaBVsNxvo/jVKsngP8ZuNI6/loTmP0kvdHRYkdA/zZwcd3R5D3gcgcYfDJkU3alIE2hWATez+ib8kD/LdC75vXW2sfpA5ClrpZugINDYKxE2ese7+7p7O3fM63+fgDFjHLGfzUsagAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+gGEwwQAJbzYYQAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';
}

// Generar piezas del rompecabezas
function generatePuzzlePieces(size, imageUrl, seed) {
  const total = size * size;
  const positions = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push({ row: r, col: c });
    }
  }

  const random = seedrandom(seed);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  return positions.map((pos, index) => {
    const correctRow = Math.floor(index / size);
    const correctCol = index % size;
    return {
      id: `piece-${correctRow}-${correctCol}`,
      correctRow,
      correctCol,
      currentRow: pos.row,
      currentCol: pos.col
    };
  });
}

// Calcular progreso del rompecabezas
function calculatePuzzleProgress(pieces) {
  const correct = pieces.filter(p => p.currentRow === p.correctRow && p.currentCol === p.correctCol).length;
  return Math.round((correct / pieces.length) * 100);
}

// Función hash simple para generar un número a partir de una cadena
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Generar pares para el juego de memoria
function generateMemoryPairs(seed, pairsCount) {
  const hash = simpleHash(seed);
  const random = () => {
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  };

  const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'];
  const usedSymbols = symbols.slice(0, pairsCount);
  const pairs = [...usedSymbols, ...usedSymbols];

  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs.map((symbol, index) => ({
    id: `${seed}-${index}`,
    symbol,
    flipped: false,
    matched: false
  }));
}

// Obtener configuración de juegos desde la base de datos
async function getGameConfig(personalizacionId) {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    const result = await request.query(`
      SELECT 
        tj.Juego AS tipo,
        cj.Orden,
        cj.Dificultad,
        CASE cj.Dificultad
          WHEN 1 THEN 'facil'
          WHEN 2 THEN 'normal'
          WHEN 3 THEN 'dificil'
        END AS dificultad,
        tem.Contenido
      FROM ConfiguracionJuego_TB cj
      JOIN Tipo_Juego_TB tj ON cj.Tipo_Juego_ID_FK = tj.Tipo_Juego_ID_PK
      JOIN Tema_Juego_TB tem ON cj.Tema_Juego_ID_FK = tem.Tema_Juego_ID_PK
      WHERE cj.Personalizacion_ID_PK = @personalizacionId
      ORDER BY cj.Orden
    `, [
      { name: 'personalizacionId', type: sql.Int, value: personalizacionId }
    ]);

    return result.recordset;
  } catch (err) {
    console.error('Error en getGameConfig:', err);
    throw err;
  }
}

// Función para iniciar el temporizador del juego
function startGameTimer(partidaId, gameType, difficulty = null) {
  if (gameTimers[partidaId]) {
    clearInterval(gameTimers[partidaId].interval);
  }

  console.log(`[TIMER-2] Iniciando temporizador para ${gameType} (${difficulty})`);

  let timeInSeconds;
  if (gameType === 'Dibujo' || gameType === 'Ahorcado') {
    console.log(gameType, difficulty);
    timeInSeconds = {
      'fácil': 7 * 60,
      'Fácil': 7 * 60,
      'normal': 5 * 60,
      'Normal': 5 * 60,
      'difícil': 3 * 60,
      'Difícil': 3 * 60
    }[difficulty];
  } else {
    timeInSeconds = 4.5 * 60;
  }

  const startTime = Date.now();
  const endTime = startTime + (timeInSeconds * 1000);

  gameTimers[partidaId] = {
    interval: null,
    startTime,
    endTime,
    remaining: timeInSeconds,
    gameType,
    difficulty
  };


  io.to(`partida_${partidaId}`).emit('timerUpdate', {
    remaining: timeInSeconds,
    total: timeInSeconds,
    gameType,
    difficulty
  });


  gameTimers[partidaId].interval = setInterval(() => {
    const now = Date.now();
    const remaining = Math.max(0, Math.round((endTime - now) / 1000));

    gameTimers[partidaId].remaining = remaining;


    io.to(`partida_${partidaId}`).emit('timerUpdate', {
      remaining,
      total: timeInSeconds,
      gameType,
      difficulty
    });

    if (remaining <= 0) {
      clearInterval(gameTimers[partidaId].interval);
      io.to(`partida_${partidaId}`).emit('timeUp', gameType);

      if (global.partidasConfig && global.partidasConfig[partidaId]) {
        const config = global.partidasConfig[partidaId];
        if (config.currentIndex < config.juegos.length - 1) {
          setTimeout(() => {
            io.to(`partida_${partidaId}`).emit('nextGame');
          }, 2000);
        }
      }
    }
  }, 1000);
}

// Lógica de Socket.IO
io.on('connection', (socket) => {

  // Unirse a una sala
  socket.on('JoinRoom', async (roomId, user) => {
    try {
      const pool = await poolPromise;

      const rolQuery = `
        SELECT Rol
        FROM Usuario_TB
        INNER JOIN Rol_TB ON Usuario_TB.Rol_ID_FK = Rol_TB.Rol_ID_PK
        WHERE Usuario_ID_PK = @usuario_id;
      `;

      const rolResult = await pool.request()
        .input('usuario_id', sql.Int, user.userId)
        .query(rolQuery);

      if (rolResult.recordset.length === 0) {
        console.log(`Usuario ${user.fullName} (ID: ${user.userId}) no encontrado en la base de datos.`);
        socket.emit('NoAutorizado', 'Usuario no encontrado.');
        return;
      }

      const rol = rolResult.recordset[0].Rol;

      let partidaId;

      if (rol === 'Profesor') {
        const partidaResult = await pool.request()
          .input('userId', sql.Int, user.userId)
          .query(`
            SELECT Partida_ID_PK 
            FROM Partida_TB 
            WHERE Profesor_ID_FK = @userId AND EstadoPartida IN ('iniciada', 'en proceso');
          `);

        if (partidaResult.recordset.length === 0) {
          console.log(`Profesor ${user.fullName} (ID: ${user.userId}) no tiene partidas iniciadas.`);
          socket.emit('NoAutorizado', 'No tienes partidas iniciadas.');
          return;
        }

        partidaId = partidaResult.recordset[0].Partida_ID_PK;
      } else {
        const participanteResult = await pool.request()
          .input('userId', sql.Int, user.userId)
          .query(`
            SELECT TOP 1 Partida_ID_FK 
            FROM Participantes_TB 
            WHERE Usuario_ID_FK = @userId 
            ORDER BY Partida_ID_FK DESC;
          `);

        if (participanteResult.recordset.length === 0) {
          console.log(`Estudiante ${user.fullName} (ID: ${user.userId}) no está en ninguna partida.`);
          socket.emit('NoAutorizado', 'No estás en ninguna partida.');
          return;
        }

        partidaId = participanteResult.recordset[0].Partida_ID_FK;

        const partidaActiva = await pool.request()
          .input('partidaId', sql.Int, partidaId)
          .query(`
            SELECT EstadoPartida 
            FROM Partida_TB 
            WHERE Partida_ID_PK = @partidaId AND EstadoPartida IN ('iniciada', 'en proceso');
          `);

        if (partidaActiva.recordset.length === 0) {
          console.log(`Estudiante ${user.fullName} (ID: ${user.userId}) no está en una partida activa.`);
          socket.emit('NoAutorizado', 'No estás en una partida activa.');
          return;
        }
      }

      if (partidaId !== parseInt(roomId)) {
        console.log(`Usuario ${user.fullName} (ID: ${user.userId}) intentó unirse a una sala no autorizada (${roomId})`);
        socket.emit('NoAutorizado', 'No tienes permiso para unirte a esta sala.');
        return;
      }

      socket.join(roomId);

      if (!salas[roomId]) {
        salas[roomId] = {
          usuarios: [],
        };
      }

      user.socketId = socket.id;

      const usuarioExistente = salas[roomId].usuarios.find(u => u.userId === user.userId);

      if (!usuarioExistente) {
        salas[roomId].usuarios.push(user);
      }

      io.to(roomId).emit('UpdateUsers', salas[roomId].usuarios);

      console.log(`Usuario ${user.fullName} (ID: ${user.userId}) se unió a la sala ${roomId}`);
    } catch (error) {
      console.error('Error al verificar la participación:', error);
      socket.emit('ErrorServidor', 'Hubo un problema al verificar tu participación.');
    }
  });

  // Obtener estructura de grupos
  socket.on('GetGroupStructure', async (partidaId, callback) => {
    try {
      if (partidaTeams.has(partidaId)) {
        return callback({ success: true, teams: partidaTeams.get(partidaId) });
      }

      const pool = await poolPromise;

      const result = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .query(`
        SELECT 
          u.Usuario_ID_PK AS userId,
          CONCAT(u.Nombre, ' ', u.Apellido1, ' ', ISNULL(u.Apellido2, '')) AS fullName,
          p.Equipo_Numero AS team
        FROM Participantes_TB p
        INNER JOIN Usuario_TB u ON u.Usuario_ID_PK = p.Usuario_ID_FK
        WHERE p.Partida_ID_FK = @partidaId
      `);

      const grouped = result.recordset.reduce((acc, user) => {
        if (!acc[user.team]) acc[user.team] = [];
        acc[user.team].push({ userId: user.userId, fullName: user.fullName });
        return acc;
      }, {});

      partidaTeams.set(partidaId, grouped);

      callback({ success: true, teams: grouped });

    } catch (error) {
      console.error('Error en GetGroupStructure:', error);
      callback({ success: false, error: 'Error al cargar los grupos' });
    }
  });

  // Finalizar partida
  socket.on('finishGame', async (partidaId, callback) => {
    try {
      console.log(`[INFO] Finalizando partida ${partidaId}`);
      const config = global.partidasConfig[partidaId];
      if (!config) {
        return callback({ error: "Partida no encontrada" });
      }

      const juegos = config.juegos;
      const currentIndex = config.currentIndex;

      gameResults[partidaId] = [];

      for (let i = 0; i <= currentIndex; i++) {
        config.currentIndex = i; 
        const resultadosParciales = await generarResultadosJuegoActual(partidaId);
        gameResults[partidaId].push(...resultadosParciales);
      }

      const finalizacionAnticipada = currentIndex < juegos.length - 1;

      if (finalizacionAnticipada) {
        const pool = await poolPromise;
        const equiposQuery = await pool.request()
          .input('partidaId', sql.Int, partidaId)
          .query(`
          SELECT DISTINCT Equipo_Numero FROM Participantes_TB 
          WHERE Partida_ID_FK = @partidaId
        `);

        const totalEquipos = equiposQuery.recordset.map(row => row.Equipo_Numero);

        for (let i = currentIndex + 1; i < juegos.length; i++) {
          const juego = juegos[i];
          for (const equipoNumero of totalEquipos) {
            gameResults[partidaId].push({
              partidaId,
              equipoNumero,
              juegoNumero: juego.Orden,
              tipoJuego: juego.tipo,
              tiempo: "N/A",
              progreso: "N/A",
              tema: juego.tema || "N/A",
              comentario: "Juego Cancelado"
            });
          }
        }

        console.log(`[INFO] Partida ${partidaId} finalizada anticipadamente.`);
      } else {
        console.log(`[INFO] Partida ${partidaId} finalizada normalmente.`);
      }

      const now = new Date();

      await poolPromise.then(pool =>
        pool.request()
          .input('partidaId', sql.Int, partidaId)
          .input('fechaFin', sql.DateTime, now)
          .query(`
          UPDATE Partida_TB
          SET EstadoPartida = 'finalizada',
              FechaFin = @fechaFin
          WHERE Partida_ID_PK = @partidaId;
        `)
      );

      partidaTeams.delete(partidaId);

      function agruparResultadosPorEquipo(resultadosArray) {
        const porEquipo = {};
        for (const resultado of resultadosArray) {
          const equipo = resultado.equipoNumero;
          if (!porEquipo[equipo]) {
            porEquipo[equipo] = {
              partidaId: resultado.partidaId,
              equipo,
              juegos: []
            };
          }
          porEquipo[equipo].juegos.push({
            juegoNumero: resultado.juegoNumero,
            tipoJuego: resultado.tipoJuego,
            tiempo: resultado.tiempo,
            progreso: resultado.progreso,
            tema: resultado.tema,
            comentario: resultado.comentario
          });
        }
        return Object.values(porEquipo);
      }

      const resultadosFinales = gameResults[partidaId] || [];
      const resultadosPorEquipo = agruparResultadosPorEquipo(resultadosFinales);

      const pool = await poolPromise;
      for (const equipo of resultadosPorEquipo) {
        const jsonResultados = JSON.stringify(equipo.juegos);

        await pool.request()
          .input('Equipo', sql.Int, equipo.equipo)
          .input('Partida_ID_FK', sql.Int, equipo.partidaId)
          .input('Resultados', sql.NVarChar(sql.MAX), jsonResultados)
          .input('Comentario', sql.VarChar(200), '')
          .query(`
          INSERT INTO Resultados_TB (Equipo, Partida_ID_FK, Resultados, Comentario)
          VALUES (@Equipo, @Partida_ID_FK, @Resultados, @Comentario)
        `);
      }

      console.log(`[BD] Resultados insertados para ${resultadosPorEquipo.length} equipos`);

      await evaluarLogrosGrupales(partidaId, resultadosPorEquipo);
      await evaluarLogrosPersonales(partidaId);

      delete gameResults[partidaId];
      delete gameTeamTimestamps[partidaId];
      delete global.partidasConfig[partidaId];

      ['hangmanGames', 'drawingGames', 'memoryGames', 'puzzleGames'].forEach(store => {
        Object.keys(global[store] || {}).forEach(key => {
          if (key.includes(`${partidaId}`)) {
            delete global[store][key];
          }
        });
      });

      io.to(`partida_${partidaId}`).emit('gameFinished', { partidaId });

      callback({ success: true });

      console.log("[RESULTADOS FINALES]");
      console.table(resultadosFinales);

    } catch (error) {
      console.error('Error al finalizar la partida:', error);
      callback({ error: error.message });
    }
  });

  // Salir de una sala
  socket.on('disconnect', () => {

    for (const roomId in salas) {
      const usuariosEnSala = salas[roomId].usuarios;
      const usuarioDesconectado = usuariosEnSala.find(u => u.socketId === socket.id);

      if (usuarioDesconectado) {
        salas[roomId].usuarios = usuariosEnSala.filter(u => u.socketId !== socket.id);

        io.to(roomId).emit('UpdateUsers', salas[roomId].usuarios);

        console.log(`Usuario ${usuarioDesconectado.fullName} (ID: ${usuarioDesconectado.userId}) salió de la sala ${roomId}`);
      }
    }
  });

  // Evento para iniciar la partida
  socket.on('StartGame', async (partidaId) => {
    try {

      io.to(partidaId).emit('StartTimer');

      const pool = await poolPromise;

      const query = `
        SELECT Usuario_ID_FK, Equipo_Numero
        FROM Participantes_TB
        WHERE Partida_ID_FK = @partidaId;
      `;

      const result = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .query(query);

      result.recordset.forEach((participante) => {
        const salaEquipo = `${partidaId}-${participante.Equipo_Numero}`;
        io.to(participante.Usuario_ID_FK).emit('JoinTeamRoom', salaEquipo);
      });

      await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .query(`
          UPDATE Partida_TB
          SET EstadoPartida = 'en proceso'
          WHERE Partida_ID_PK = @partidaId;
        `);

      console.log(`Partida ${partidaId} iniciada. Estudiantes redirigidos a sus salas de equipo.`);
    } catch (error) {
      console.error('Error al iniciar la partida:', error);
    }
  });

  // Evento para iniciar la sesión de juego
  socket.on('StartGameSession', async ({ profesorId, partidaId }) => {
    try {
      const pool = await poolPromise;
      const request = pool.request();

      const partidaResult = await request.input('partidaId', sql.Int, partidaId)
        .query(`
          SELECT Personalizacion_ID_FK 
          FROM Partida_TB 
          WHERE Partida_ID_PK = @partidaId
        `);

      if (partidaResult.recordset.length === 0) {
        throw new Error('Partida no encontrada');
      }

      const personalizacionId = partidaResult.recordset[0].Personalizacion_ID_FK;

      const games = await getGameConfig(personalizacionId);

      activeGames[partidaId] = {
        profesorId,
        currentGameIndex: 0,
        games: games.map(game => ({
          type: game.tipo,
          config: {
            dificultad: game.dificultad,
            contenido: game.Contenido,
            orden: game.Orden
          },
          estado: {} 
        })),
        teamMembers: [],
        estadoGeneral: {
          iniciada: new Date(),
          ultimaActualizacion: new Date()
        }
      };

      if (!gameTimers[partidaId] && configResult.recordset.length > 0) {
        const firstGame = configResult.recordset[0];
        startGameTimer(
          partidaId,
          firstGame.tipo,
          firstGame.dificultad.toLowerCase()
        );
      }

      io.emit('GameSessionReady', {
        partidaId,
        totalJuegos: games.length
      });

    } catch (error) {
      console.error('Error en StartGameSession:', error);
      socket.emit('GameError', {
        partidaId,
        message: error.message
      });
    }
  });

  // Unirse a la sala de equipo
  socket.on('JoinTeamRoom', async ({ partidaId, equipoNumero, userId }) => {
    try {
      if (!partidaId || !equipoNumero || !userId) {
        throw new Error('Faltan parámetros requeridos');
      }

      const verificationQuery = `
        SELECT COUNT(*) as count
        FROM Participantes_TB
        WHERE Partida_ID_FK = @partidaId 
          AND Equipo_Numero = @equipoNumero
          AND Usuario_ID_FK = @userId
      `;

      const verificationResult = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .input('equipoNumero', sql.Int, equipoNumero)
        .input('userId', sql.Int, userId)
        .query(verificationQuery);

      if (verificationResult.recordset[0].count === 0) {
        throw new Error('El usuario no pertenece a este equipo en la partida especificada');
      }

      const roomId = `team-${partidaId}-${equipoNumero}`;
      socket.join(roomId);

      if (!partidaRooms.has(partidaId)) {
        partidaRooms.set(partidaId, new Set());
      }
      partidaRooms.get(partidaId).add(equipoNumero);

      const membersQuery = `
        SELECT 
          u.Usuario_ID_PK as userId,
          CONCAT(u.Nombre, ' ', u.Apellido1, ' ', COALESCE(u.Apellido2, '')) as fullName
        FROM Participantes_TB p
        INNER JOIN Usuario_TB u ON p.Usuario_ID_FK = u.Usuario_ID_PK
        WHERE p.Partida_ID_FK = @partidaId AND p.Equipo_Numero = @equipoNumero
      `;

      const result = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .input('equipoNumero', sql.Int, equipoNumero)
        .query(membersQuery);

      io.to(roomId).emit('UpdateTeamMembers', result.recordset);

      console.log(`Usuario ${userId} unido a ${roomId}`);

    } catch (error) {
      console.error('Error en JoinTeamRoom:', error.message);
      socket.emit('error', {
        message: error.message || 'Error al unirse a la sala',
        code: 'TEAM_VALIDATION_ERROR'
      });
    }
  });

  socket.on('SendMousePosition', ({ roomId, userId, x, y }) => {

    if (typeof roomId !== 'string') {
      console.error('roomId debe ser string:', roomId);
      return;
    }

    if (roomId.includes('undefined')) {
      console.error('Sala inválida:', roomId);
      return;
    }

    socket.to(roomId).emit('BroadcastMousePosition', userId, x, y);
  });

  // Desconexión
  socket.on('disconnect', () => {
  });

  socket.on('SelectGame', (roomId, gameType) => {
    const defaultConfig = {
      rows: 5,
      cols: 5,
      imageUrl: 'https://imagen.nextn.es/wp-content/uploads/2022/08/2208-10-Splatoon-3-01.jpg?strip=all&lossy=1&sharp=1&ssl=1'
    };
    io.to(roomId).emit('LoadGame', gameType, defaultConfig);

    if (!puzzleStates[roomId]) {
      puzzleStates[roomId] = []; 
    }
  });

  // Inicializar juego
  socket.on('InitGame', (roomId, gameType, initialState) => {
    if (!activeGames[roomId]) return;
    activeGames[roomId].state = initialState;
    io.to(roomId).emit('UpdateGameState', gameType, initialState);
  });

  // Manejar movimiento de piezas del rompecabezas
  socket.on('movePiece', ({ partidaId, equipoNumero, pieceId, x, y }) => {
    const gameId = `puzzle-${partidaId}-${equipoNumero}`;
    const game = puzzleGames[gameId];
    if (!game) return;

    const piece = game.pieces.find(p => p.id === pieceId);
    if (!piece || piece.locked) return;

    piece.currentX = x;
    piece.currentY = y;

    socket.to(`team-${partidaId}-${equipoNumero}`).emit('pieceMoved', {
      pieceId,
      x,
      y,
      userId: socket.id
    });
  });


  socket.on('UpdatePieces', (roomId, pieces) => {
    puzzleStates[roomId] = pieces;
    io.to(roomId).emit('UpdatePieces', pieces);
  });

  socket.on('lockPiece', ({ partidaId, equipoNumero, pieceId, x, y }) => {
    const gameId = `puzzle-${partidaId}-${equipoNumero}`;
    const game = puzzleGames[gameId];
    if (!game) return;

    const piece = game.pieces.find(p => p.id === pieceId);
    if (!piece || piece.locked) return;

    piece.locked = true;
    piece.currentX = x;
    piece.currentY = y;

    io.to(`team-${partidaId}-${equipoNumero}`).emit('pieceLocked', {
      pieceId,
      x,
      y
    });
  });

  // Modifica el evento getGameConfig
  socket.on('getGameConfig', async (partidaId, callback) => {
    try {
      const pool = await poolPromise;
      console.log(`[DEBUG] Solicitando configuración para partida ${partidaId}`);

      if (global.partidasConfig && global.partidasConfig[partidaId]) {
        const config = global.partidasConfig[partidaId];
        return callback({
          juegos: config.juegos,
          total: config.juegos.length,
          profesorId: config.profesorId,
          currentIndex: config.currentIndex
        });
      }

      if (gameTimers[partidaId]) {
        const { remaining, total, gameType, difficulty } = gameTimers[partidaId];
        io.to(`partida_${partidaId}`).emit('timerUpdate', {
          remaining,
          total,
          gameType,
          difficulty
        });
      }

      const partidaResult = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .query(`
        SELECT p.Personalizacion_ID_FK, p.Profesor_ID_FK 
        FROM Partida_TB p
        WHERE p.Partida_ID_PK = @partidaId
      `);

      if (partidaResult.recordset.length === 0) {
        return callback({ error: 'Partida no encontrada' });
      }

      const personalizacionId = partidaResult.recordset[0].Personalizacion_ID_FK;
      const profesorId = partidaResult.recordset[0].Profesor_ID_FK;

      const configResult = await pool.request()
        .input('personalizacionId', sql.Int, personalizacionId)
        .query(`
        SELECT 
          tj.Juego AS tipo,
          cj.Orden,
          cj.Dificultad,
          CASE cj.Dificultad
            WHEN 1 THEN 'Fácil'
            WHEN 2 THEN 'Normal'
            WHEN 3 THEN 'Difícil'
          END AS dificultad,
          ISNULL(tem.Contenido, 'Sin tema específico') AS tema,
          CASE tj.Juego
            WHEN 'Rompecabezas' THEN 
              CASE cj.Dificultad
                WHEN 1 THEN '6x6'
                WHEN 2 THEN '7x7'
                WHEN 3 THEN '8x8'
              END
            WHEN 'Dibujo' THEN 
              CASE cj.Dificultad
                WHEN 1 THEN '6 minutos'
                WHEN 2 THEN '4 minutos'
                WHEN 3 THEN '3 minuto'
              END
            WHEN 'Ahorcado' THEN 
              CASE cj.Dificultad
                WHEN 1 THEN '8 intentos'
                WHEN 2 THEN '6 intentos'
                WHEN 3 THEN '4 intentos'
              END
            WHEN 'Memoria' THEN 
              CASE cj.Dificultad
                WHEN 1 THEN '8 pares'
                WHEN 2 THEN '12 pares'
                WHEN 3 THEN '16 pares'
              END
          END AS configEspecifica
        FROM ConfiguracionJuego_TB cj
        INNER JOIN Tipo_Juego_TB tj ON cj.Tipo_Juego_ID_FK = tj.Tipo_Juego_ID_PK
        LEFT JOIN Tema_Juego_TB tem ON cj.Tema_Juego_ID_FK = tem.Tema_Juego_ID_PK
        WHERE cj.Personalizacion_ID_PK = @personalizacionId
        ORDER BY cj.Orden
      `);


      console.log(`[DEBUG] Juegos encontrados:`, configResult.recordset);
      if (!global.partidasConfig) global.partidasConfig = {};

      const currentIndex = global.partidasConfig[partidaId]?.currentIndex || 0;

      const firstGame = configResult.recordset[0];

      startGameTimer(partidaId, firstGame.tipo, firstGame.dificultad);
      console.log(`[TIMER] Temporizador iniciado para ${firstGame.tipo} (${firstGame.dificultad})`);

      global.partidasConfig[partidaId] = {
        juegos: configResult.recordset,
        currentIndex: currentIndex,
        profesorId: profesorId
      };

      callback({
        juegos: configResult.recordset,
        total: configResult.recordset.length,
        profesorId: profesorId,
        currentIndex: currentIndex
      });

    } catch (error) {
      console.error('Error al obtener configuración:', error);
      callback({ error: 'Error al cargar configuración' });
    }
  });

  // Para unirse a la sala general de partida
  socket.on('joinPartidaRoom', (partidaId) => {
    socket.join(`partida_${partidaId}`);
    console.log(`Socket ${socket.id} se unió a partida_${partidaId}`);
  });

  // Para dejar la sala general de partida
  socket.on('leavePartidaRoom', (partidaId) => {
    socket.leave(`partida_${partidaId}`);
    console.log(`Socket ${socket.id} dejó partida_${partidaId}`);
  });

  // Agregar en el evento 'connection', después de los otros eventos
  socket.on('StartTimer', ({ partidaId, gameType, difficulty }) => {
    startGameTimer(partidaId, gameType, difficulty);
  });

  // Manejar solicitud de sincronización de tiempo
  socket.on('RequestTimeSync', (partidaId) => {
    if (gameTimers[partidaId]) {
      const { remaining, total, gameType, difficulty } = gameTimers[partidaId];
      socket.emit('timerUpdate', { remaining, total, gameType, difficulty });
    }
  });

  // Mejora el evento nextGame
  socket.on('nextGame', async (partidaId, callback) => {
    try {
      if (!global.partidasConfig || !global.partidasConfig[partidaId]) {
        return callback({ error: "Configuración no encontrada" });
      }

      await guardarDibujosActuales(partidaId);

      await generarResultadosJuegoActual(partidaId);

      io.to(`partida_${partidaId}`).emit('cleanPreviousGames', { partidaId });

      Object.keys(hangmanGames).forEach(key => {
        if (key.startsWith(`hangman-${partidaId}`)) {
          delete hangmanGames[key];
        }
      });

      Object.keys(puzzleGames).forEach(key => {
        if (key.startsWith(`puzzle-${partidaId}-`)) {
          delete puzzleGames[key];
        }
      });

      const config = global.partidasConfig[partidaId];

      if (config.currentIndex >= config.juegos.length - 1) {
        delete global.partidasConfig[partidaId];
        io.to(`partida_${partidaId}`).emit('allGamesCompleted');
        return callback({ completed: true });
      }

      if (drawingVotes[partidaId]) delete drawingVotes[partidaId];
      if (userVotes[partidaId]) delete userVotes[partidaId];

      io.to(`partida_${partidaId}`).emit('drawingVotesUpdated', {
        votes: {},
        topTeams: []
      });

      config.currentIndex += 1;
      const currentGame = config.juegos[config.currentIndex];

      startGameTimer(
        partidaId,
        currentGame.tipo,
        currentGame.dificultad.toLowerCase()
      );

      io.to(`partida_${partidaId}`).emit('gameChanged', {
        currentGame,
        currentIndex: config.currentIndex,
        total: config.juegos.length
      });

      if (partidaRooms.has(partidaId)) {
        const equipos = partidaRooms.get(partidaId);
        equipos.forEach(equipoNumero => {
          io.to(`team-${partidaId}-${equipoNumero}`).emit('gameChanged', {
            currentGame,
            currentIndex: config.currentIndex,
            total: config.juegos.length
          });
        });
      }

      callback({
        success: true,
        currentIndex: config.currentIndex,
        currentGame,
        total: config.juegos.length
      });

    } catch (error) {
      console.error('Error en nextGame:', error);
      callback({ error: "Error interno al cambiar de juego" });
    }
  });


  //-----------------------------------------------------------
  //----------------------- Memoria ---------------------------

  // Inicializar juego de memoria
  socket.on('initMemoryGame', async ({ partidaId, equipoNumero }) => {
    try {
      const partidaConfig = global.partidasConfig[partidaId];
      if (!partidaConfig) throw new Error('Configuración de partida no encontrada');

      const currentGame = partidaConfig.juegos[partidaConfig.currentIndex];
      if (currentGame.tipo !== 'Memoria') {
        throw new Error('El juego actual no es de memoria');
      }

      const gameId = `memory-${partidaId}-${equipoNumero}-${partidaConfig.currentIndex}`;

      if (memoryGames[gameId]) {
        socket.emit('memoryGameState', memoryGames[gameId]);
        return;
      }

      const currentIndex = global.partidasConfig[partidaId]?.currentIndex || 0;

      if (!gameTeamTimestamps[partidaId]) gameTeamTimestamps[partidaId] = {};
      if (!gameTeamTimestamps[partidaId][equipoNumero]) gameTeamTimestamps[partidaId][equipoNumero] = {};
      if (!gameTeamTimestamps[partidaId][equipoNumero][currentIndex]) {
        gameTeamTimestamps[partidaId][equipoNumero][currentIndex] = {
          startedAt: new Date(),
          completedAt: null
        };
      }

      const seed = `${partidaId}-${equipoNumero}-${partidaConfig.currentIndex}`;


      memoryGames[gameId] = {
        config: {
          pairsCount: getPairsCount(currentGame.dificultad),
          difficulty: currentGame.dificultad,
          seed 
        },
        state: {
          cards: generateMemoryPairs(seed, getPairsCount(currentGame.dificultad)),
          flippedIndices: [],
          matchedPairs: 0,
          gameCompleted: false,
          lastActivity: new Date()
        }
      };

      io.to(`team-${partidaId}-${equipoNumero}`).emit('memoryGameState', {
        ...memoryGames[gameId],
        isInitial: true
      });

    } catch (error) {
      socket.emit('memoryGameError', { message: error.message });
    }
  });

  // Obtener estado actual del juego de memoria
  socket.on('getMemoryGameState', ({ partidaId, equipoNumero }) => {
    const partidaConfig = global.partidasConfig[partidaId];
    if (!partidaConfig) return;

    const gameId = `memory-${partidaId}-${equipoNumero}-${partidaConfig.currentIndex}`;
    if (memoryGames[gameId]) {
      socket.emit('memoryGameState', memoryGames[gameId]);
    }
  });

  function getPairsCount(difficulty) {
    const dif = difficulty.toLowerCase();
    return { 'fácil': 8, 'facil': 8, 'normal': 12, 'difícil': 16, 'dificil': 16 }[dif] || 8;
  }

  // Voltear una carta
  socket.on('flipMemoryCard', ({ partidaId, equipoNumero, cardId }) => {
    try {
      const partidaConfig = global.partidasConfig[partidaId];
      if (!partidaConfig) throw new Error('Configuración de partida no encontrada');

      const gameId = `memory-${partidaId}-${equipoNumero}-${partidaConfig.currentIndex}`;
      const game = memoryGames[gameId];

      if (!game) throw new Error(`Juego no encontrado (ID: ${gameId})`);

      const cardIndex = game.state.cards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) throw new Error('Carta no encontrada');

      const card = game.state.cards[cardIndex];
      if (card.matched || card.flipped || game.state.flippedIndices.length >= 2) return;

      card.flipped = true;
      game.state.flippedIndices.push(cardIndex);
      game.state.lastActivity = new Date();


      io.to(`team-${partidaId}-${equipoNumero}`).emit('memoryGameState', {
        ...game,
        action: 'flip', 
        flippedCardId: cardId
      });

      if (game.state.flippedIndices.length === 2) {
        setTimeout(() => {
          const [firstIdx, secondIdx] = game.state.flippedIndices;
          const firstCard = game.state.cards[firstIdx];
          const secondCard = game.state.cards[secondIdx];

          if (firstCard.symbol === secondCard.symbol) {
            firstCard.matched = true;
            secondCard.matched = true;
            game.state.matchedPairs++;
            game.state.flippedIndices = [];

            const progress = Math.round((game.state.matchedPairs / game.config.pairsCount) * 100);
            updateTeamProgress(partidaId, equipoNumero, 'Memoria', progress);

            io.to(`team-${partidaId}-${equipoNumero}`).emit('memoryGameState', {
              ...game,
              action: 'match'
            });

            if (game.state.matchedPairs === game.config.pairsCount) {
              game.state.gameCompleted = true;

              const currentIndex = partidaConfig.currentIndex;

              if (!gameTeamTimestamps[partidaId]) gameTeamTimestamps[partidaId] = {};
              if (!gameTeamTimestamps[partidaId][equipoNumero]) gameTeamTimestamps[partidaId][equipoNumero] = {};
              if (!gameTeamTimestamps[partidaId][equipoNumero][currentIndex]) {
                gameTeamTimestamps[partidaId][equipoNumero][currentIndex] = {};
              }

              gameTeamTimestamps[partidaId][equipoNumero][currentIndex].completedAt = new Date();

              io.to(`team-${partidaId}-${equipoNumero}`).emit('memoryGameState', {
                ...game,
                action: 'complete'
              });
            }
          } else {
            firstCard.flipped = false;
            secondCard.flipped = false;
            game.state.flippedIndices = [];

            io.to(`team-${partidaId}-${equipoNumero}`).emit('memoryGameState', {
              ...game,
              action: 'no-match'
            });
          }
        }, 1000); 
      }
    } catch (error) {
      console.error('Error al voltear carta:', error);
      socket.emit('memoryGameError', { message: error.message });
    }
  });

  // Reiniciar juego de memoria
  socket.on('resetMemoryGame', ({ partidaId, equipoNumero }) => {
    try {
      const gameId = `memory-${partidaId}-${equipoNumero}`;

      if (!memoryGames[gameId]) {
        throw new Error('Juego no encontrado para reiniciar');
      }

      const config = memoryGames[gameId].config;
      const seed = `${partidaId}-${equipoNumero}-${new Date().getTime()}`;

      memoryGames[gameId].state = {
        cards: generateMemoryPairs(seed, config.pairsCount),
        flippedIndices: [],
        matchedPairs: 0,
        gameCompleted: false,
        lastActivity: new Date()
      };

      if (gameProgress[partidaId]?.[equipoNumero]?.['Memoria']) {
        gameProgress[partidaId][equipoNumero]['Memoria'] = {
          startedAt: new Date(),
          pairsFound: 0
        };
      }

      io.to(`team-${partidaId}-${equipoNumero}`).emit('memoryGameState', memoryGames[gameId]);

    } catch (error) {
      console.error('Error reiniciando juego de memoria:', error);
      socket.emit('memoryGameError', { message: error.message });
    }
  });

  // Sincronizar estado al reconectar
  socket.on('syncMemoryGame', ({ partidaId, equipoNumero }) => {
    const gameId = `memory-${partidaId}-${equipoNumero}`;
    if (memoryGames[gameId]) {
      socket.emit('memoryGameState', memoryGames[gameId]);
    }
  });

  // Limpiar al desconectarse
  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} desconectado`);
  });

  // Limpiar juegos anteriores al iniciar nuevo juego
  socket.on('cleanPreviousGames', ({ partidaId }) => {
    try {
      Object.keys(memoryGames).forEach(key => {
        if (key.startsWith(`memory-${partidaId}`)) {
          delete memoryGames[key];
        }
      });

      Object.keys(hangmanGames).forEach(key => {
        if (key.startsWith(`hangman-${partidaId}`)) {
          delete hangmanGames[key];
        }
      });

      Object.keys(drawingGames).forEach(key => {
        if (key.startsWith(`drawing-${partidaId}`)) {
          delete drawingGames[key];
        }
      });

      Object.keys(global.puzzleGames || {}).forEach(key => {
        if (key.startsWith(`puzzle-${partidaId}-`)) {
          delete global.puzzleGames[key];
        }
      });

      Object.keys(puzzleGames).forEach(key => {
        if (key.startsWith(`puzzle-${partidaId}-`)) {
          delete puzzleGames[key];
        }
      });

      if (gameProgress[partidaId]) {
        gameProgress[partidaId] = {};
      }

      console.log(`Juegos anteriores limpiados para partida ${partidaId}`);
    } catch (error) {
      console.error('Error limpiando juegos:', error);
    }
  });

  //Inicializar juego de ahorcado
  socket.on('initHangmanGame', ({ partidaId, equipoNumero }) => {
    try {
      const config = global.partidasConfig[partidaId];
      if (!config) throw new Error('Configuración no encontrada');

      const currentGame = config.juegos[config.currentIndex];
      if (currentGame.tipo !== 'Ahorcado') {
        throw new Error('El juego actual no es Ahorcado');
      }

      const gameId = `hangman-${partidaId}-${equipoNumero}-${config.currentIndex}`;

      if (hangmanGames[gameId]) {
        socket.emit('hangmanGameState', hangmanGames[gameId]);
        return;
      }

      const palabra = String(currentGame.tema || '') 
        .normalize("NFD") 
        .replace(/[\u0300-\u036f]/g, "") 
        .toUpperCase()
        .replace(/[^A-ZÑ]/g, ''); 

      if (!palabra || palabra.length === 0) {
        throw new Error('La palabra para el ahorcado no es válida');
      }

      const dificultad = (currentGame.dificultad || '').toLowerCase();
      let intentosMaximos = 6;
      if (dificultad === 'fácil' || dificultad === 'facil') intentosMaximos = 6;
      else if (dificultad === 'normal') intentosMaximos = 5;
      else if (dificultad === 'difícil' || dificultad === 'dificil') intentosMaximos = 4;

      hangmanGames[gameId] = {
        config: {
          palabra,
          intentosMaximos,
          dificultad: currentGame.dificultad
        },
        state: {
          letrasAdivinadas: [],
          letrasIntentadas: [],
          intentosRestantes: intentosMaximos,
          juegoTerminado: false,
          ganado: false
        }
      };

      const currentIndex = global.partidasConfig[partidaId]?.currentIndex || 0;

      if (!gameTeamTimestamps[partidaId]) gameTeamTimestamps[partidaId] = {};
      if (!gameTeamTimestamps[partidaId][equipoNumero]) gameTeamTimestamps[partidaId][equipoNumero] = {};
      if (!gameTeamTimestamps[partidaId][equipoNumero][currentIndex]) {
        gameTeamTimestamps[partidaId][equipoNumero][currentIndex] = {
          startedAt: new Date(),
          completedAt: null
        };
      }


      io.to(`team-${partidaId}-${equipoNumero}`).emit('hangmanGameState', hangmanGames[gameId]);

    } catch (error) {
      socket.emit('hangmanGameError', {
        message: error.message,
        stack: error.stack 
      });
    }
  });

  // Evento para adivinar letra
  socket.on('guessLetter', ({ partidaId, equipoNumero, letra }) => {
    try {
      const currentIndex = global.partidasConfig?.[partidaId]?.currentIndex || 0;
      const gameId = `hangman-${partidaId}-${equipoNumero}-${currentIndex}`;
      const game = hangmanGames[gameId];

      if (!game) throw new Error('Juego no encontrado');
      if (game.state.juegoTerminado) return;

      const letraNormalizada = letra.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
      if (!/^[A-ZÑ]$/.test(letraNormalizada)) return;

      if (game.state.letrasIntentadas.includes(letraNormalizada)) return;
      game.state.letrasIntentadas.push(letraNormalizada);

      const palabra = game.config.palabra;
      const ocurrencias = palabra.split('').filter(l => l === letraNormalizada).length;

      if (ocurrencias > 0) {
        for (let i = 0; i < ocurrencias; i++) {
          game.state.letrasAdivinadas.push(letraNormalizada);
        }
      } else {
        game.state.intentosRestantes--;
      }

      const totalLetras = palabra.length;
      const letrasAcertadas = game.state.letrasAdivinadas.length;
      const letrasErradas = game.state.letrasIntentadas.length - [...new Set(game.state.letrasAdivinadas)].length;

      updateTeamProgress(partidaId, equipoNumero, 'Ahorcado', {
        correctas: letrasAcertadas,
        errores: letrasErradas,
        total: totalLetras,
        progreso: Math.round((letrasAcertadas / totalLetras) * 100)
      });

      const adivinadasSet = [...new Set(game.state.letrasAdivinadas)];
      const palabraSet = [...new Set(palabra.split(''))];

      if (palabraSet.every(l => adivinadasSet.includes(l))) {
        game.state.juegoTerminado = true;
        game.state.ganado = true;
        const currentIndex = global.partidasConfig?.[partidaId]?.currentIndex || 0;
        if (!gameTeamTimestamps[partidaId]) gameTeamTimestamps[partidaId] = {};
        if (!gameTeamTimestamps[partidaId][equipoNumero]) gameTeamTimestamps[partidaId][equipoNumero] = {};
        gameTeamTimestamps[partidaId][equipoNumero][currentIndex] = {
          ...(gameTeamTimestamps[partidaId][equipoNumero][currentIndex] || {}),
          completedAt: new Date()
        };
      }

      if (game.state.intentosRestantes <= 0 && !game.state.ganado) {
        game.state.juegoTerminado = true;
        game.state.ganado = false;
        const currentIndex = global.partidasConfig?.[partidaId]?.currentIndex || 0;
        if (!gameTeamTimestamps[partidaId]) gameTeamTimestamps[partidaId] = {};
        if (!gameTeamTimestamps[partidaId][equipoNumero]) gameTeamTimestamps[partidaId][equipoNumero] = {};
        gameTeamTimestamps[partidaId][equipoNumero][currentIndex] = {
          ...(gameTeamTimestamps[partidaId][equipoNumero][currentIndex] || {}),
          completedAt: new Date()
        };
      }

      io.to(`team-${partidaId}-${equipoNumero}`).emit('hangmanGameState', {
        ...game,
        animacion: {
          tipo: ocurrencias > 0 ? 'acierto' : 'error',
          letra: letraNormalizada
        }
      });

    } catch (error) {
      console.error('Error al adivinar letra:', error);
      socket.emit('hangmanGameError', { message: error.message });
    }
  });

  // Votación para letra del ahorcado
  socket.on('startHangmanVote', ({ partidaId, equipoNumero, letra, userId }) => {
    const voteKey = `${partidaId}-${equipoNumero}`;

    if (!hangmanVotes[voteKey]) {
      hangmanVotes[voteKey] = {
        votes: {},
        timer: setTimeout(() => finalizarVotacion(partidaId, equipoNumero), VOTING_TIME)
      };

      io.to(`team-${partidaId}-${equipoNumero}`).emit('hangmanVoteStarted', {
        tiempoRestante: VOTING_TIME
      });
    }

    Object.values(hangmanVotes[voteKey].votes).forEach(userIds => {
      const index = userIds.indexOf(userId);
      if (index !== -1) userIds.splice(index, 1);
    });

    if (!hangmanVotes[voteKey].votes[letra]) {
      hangmanVotes[voteKey].votes[letra] = [];
    }
    hangmanVotes[voteKey].votes[letra].push(userId);

    io.to(`team-${partidaId}-${equipoNumero}`).emit('hangmanVoteUpdate', {
      votes: hangmanVotes[voteKey].votes
    });
  });

  // Función para finalizar la votación
  function finalizarVotacion(partidaId, equipoNumero) {
    const voteKey = `${partidaId}-${equipoNumero}`;
    const votacion = hangmanVotes[voteKey];
    if (!votacion) return;

    const votos = votacion.votes;

    const entries = Object.entries(votos).map(([letra, users]) => ({
      letra,
      cantidad: users.length
    }));

    if (entries.length === 0) {
      io.to(`team-${partidaId}-${equipoNumero}`).emit('hangmanVoteEnded', {
        letraGanadora: null,
        votos
      });
      delete hangmanVotes[voteKey];
      return;
    }

    entries.sort((a, b) => b.cantidad - a.cantidad);
    const [top1, top2] = entries;

    const letraGanadora = (!top2 || top1.cantidad > top2.cantidad) ? top1.letra : null;

    io.to(`team-${partidaId}-${equipoNumero}`).emit('hangmanVoteEnded', {
      letraGanadora,
      votos
    });

    if (letraGanadora) {
      io.to(`team-${partidaId}-${equipoNumero}`).emit('guessLetter', {
        partidaId,
        equipoNumero,
        letra: letraGanadora
      });
    }

    delete hangmanVotes[voteKey];
  }

  // Cancelar votación (si el profesor lo solicita)
  socket.on('cancelHangmanVote', ({ partidaId, equipoNumero }) => {
    const voteKey = `${partidaId}-${equipoNumero}`;
    if (hangmanVotes[voteKey]) {
      clearTimeout(hangmanVotes[voteKey].timer);
      delete hangmanVotes[voteKey];
      io.to(`team-${partidaId}-${equipoNumero}`).emit('hangmanVoteCancelled');
    }
  });

  // Inicializar juego de dibujo
  socket.on('initDrawingGame', ({ partidaId, equipoNumero, userId }) => {
    const gameId = `drawing-${partidaId}-${equipoNumero}`;

    socket.join(`team-${partidaId}-${equipoNumero}`);

    if (!drawingGames[gameId]) {
      drawingGames[gameId] = {
        actions: {},
        tintaStates: {}
      };
    }

    const currentIndex = global.partidasConfig[partidaId]?.currentIndex || 0;

    if (!gameTeamTimestamps[partidaId]) gameTeamTimestamps[partidaId] = {};
    if (!gameTeamTimestamps[partidaId][equipoNumero]) gameTeamTimestamps[partidaId][equipoNumero] = {};
    if (!gameTeamTimestamps[partidaId][equipoNumero][currentIndex]) {
      gameTeamTimestamps[partidaId][equipoNumero][currentIndex] = {
        startedAt: new Date(),
        completedAt: null
      };
    }

    if (drawingGames[gameId].tintaStates[userId] === undefined) {
      drawingGames[gameId].tintaStates[userId] = 5000; // Valor inicial
    }

    const allActions = Object.entries(drawingGames[gameId].actions)
      .flatMap(([userId, actions]) =>
        actions.map(action => ({ userId, path: action }))
      );

    socket.emit('drawingGameState', {
      actions: allActions,
      tintaState: drawingGames[gameId].tintaStates
    });
  });

  // Para que el profesor pueda resetear el dibujo de un equipo
  socket.on('resetDrawingGame', ({ partidaId, equipoNumero }) => {
    const gameId = `drawing-${partidaId}-${equipoNumero}`;
    delete drawingGames[gameId];
    io.to(`team-${partidaId}-${equipoNumero}`).emit('drawingCleared', { all: true });
  });


  // Para que un estudiante pueda borrar su dibujo y resetear su tinta
  socket.on('clearMyDrawing', ({ partidaId, equipoNumero, userId }) => {
    const gameId = `drawing-${partidaId}-${equipoNumero}`;

    if (drawingGames[gameId]?.actions?.[userId]) {
      delete drawingGames[gameId].actions[userId];
    }


    if (drawingGames[gameId]?.tintaStates) {
      drawingGames[gameId].tintaStates[userId] = 5000;

      socket.emit('drawingAction', {
        type: 'tintaUpdate',
        userId,
        tinta: 5000
      });
    }

    socket.to(`team-${partidaId}-${equipoNumero}`).emit('drawingAction', {
      type: 'clear',
      userId
    });
  });

  // Para que un estudiante pueda ver el dibujo en vivo de su equipo
  socket.on('getTeamDrawingLive', ({ partidaId, equipoNumero }, callback) => {
    try {
      if (!liveDrawings.has(partidaId)) {
        return callback({ success: false, error: 'Partida no encontrada' });
      }

      const partidaData = liveDrawings.get(partidaId);
      const teamDrawing = partidaData[equipoNumero] || {};

      callback({
        success: true,
        drawing: teamDrawing,
        equipoNumero,
        partidaId
      });
    } catch (error) {
      console.error('Error en getTeamDrawingLive:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Para que el profesor pueda ver el dibujo de cualquier equipo
  socket.on('professorGetTeamDrawing', ({ partidaId, equipoNumero }, callback) => {
    try {
      const gameId = `drawing-${partidaId}-${equipoNumero}`;
      const game = drawingGames[gameId];

      if (!game || !game.actions) {
        return callback({ success: false, error: 'Dibujo no encontrado' });
      }

      const drawingByUser = {};
      for (const [userId, actions] of Object.entries(game.actions)) {
        drawingByUser[userId] = actions;
      }

      return callback({
        success: true,
        drawing: drawingByUser
      });
    } catch (error) {
      console.error('Error en professorGetTeamDrawing:', error);
      callback({ success: false, error: error.message });
    }
  });

  socket.on('getDemoDrawing', ({ partidaId, equipoNumero }, callback) => {
    try {
      const gameId = `drawing-${partidaId}-${equipoNumero}`;
      const game = drawingGames[gameId];

      if (!game || !game.actions) {
        return callback({ success: false, error: 'Dibujo no encontrado' });
      }

      const drawingByUser = {};
      for (const [userId, actions] of Object.entries(game.actions)) {
        drawingByUser[userId] = actions;
      }

      return callback({
        success: true,
        drawing: drawingByUser
      });
    } catch (error) {
      console.error('Error en getDemoDrawing:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Demostración
  socket.on('activarDemostracion', (partidaId) => {
    demostracionesActivas[partidaId] = true;
    io.to(`partida-${partidaId}`).emit('estadoDemostracion', true);
  });

  socket.on('desactivarDemostracion', (partidaId) => {
    delete demostracionesActivas[partidaId];
    io.to(`partida-${partidaId}`).emit('estadoDemostracion', false);
  });

  socket.on('getEstadoDemostracion', (partidaId, callback) => {
    callback(!!demostracionesActivas[partidaId]);
  });

  socket.on('setEstadoDemostracion', ({ partidaId, estado, userId }) => {
    if (!userId.startsWith('prof-')) return; // solo profesor puede cambiar

    estadoDemostracionMap[partidaId] = estado;
    io.to(`partida-${partidaId}`).emit('estadoDemostracion', estado);
  });

  // Acciones de dibujo
  socket.on('drawingAction', ({ partidaId, equipoNumero, userId, action }) => {
    const gameId = `drawing-${partidaId}-${equipoNumero}`;

    if (!drawingGames[gameId]) {
      drawingGames[gameId] = {
        actions: {},
        tintaStates: {}
      };
    }

    if (!drawingGames[gameId].actions[userId]) {
      drawingGames[gameId].actions[userId] = [];
    }

    switch (action.type) {
      case 'pathStart':
        drawingGames[gameId].actions[userId].push(action.path);
        break;

      case 'pathUpdate':
      case 'pathComplete': {
        const userActions = drawingGames[gameId].actions[userId];
        const existingActionIndex = userActions.findIndex(a => a.id === action.path.id);

        if (existingActionIndex >= 0) {
          userActions[existingActionIndex] = action.path;
        } else {
          userActions.push(action.path);
        }
        break;
      }

      case 'clear':
        if (action.isLocalReset) {

          drawingGames[gameId].tintaStates[userId] = MAX_TINTA;
          delete drawingGames[gameId].actions[userId];


          io.to(socket.id).emit('tintaUpdate', {
            userId,
            tinta: MAX_TINTA
          });
        } else {

          delete drawingGames[gameId].actions[userId];
          drawingGames[gameId].tintaStates[userId] = 5000;
          socket.to(`team-${partidaId}-${equipoNumero}`).emit('drawingAction', {
            type: 'clear',
            userId
          });
        }
        return; 
    }

    io.to(`team-${partidaId}-${equipoNumero}`).emit('drawingAction', {
      userId,
      ...action
    });
  });


  // Nuevo evento para limpiar solo los trazos visuales
  socket.on('clearDrawingPaths', ({ partidaId, equipoNumero, userId }) => {
    const gameId = `drawing-${partidaId}-${equipoNumero}`;

    if (drawingGames[gameId]?.actions?.[userId]) {
      delete drawingGames[gameId].actions[userId];
    }

    socket.to(`team-${partidaId}-${equipoNumero}`).emit('clearRemotePaths', { userId });
  });

  // Mantén el existente para actualizar tinta
  socket.on('updateTintaState', ({ partidaId, equipoNumero, userId, tinta }) => {
    const gameId = `drawing-${partidaId}-${equipoNumero}`;

    if (!drawingGames[gameId]) {
      drawingGames[gameId] = { actions: {}, tintaStates: {} };
    }

    drawingGames[gameId].tintaStates[userId] = tinta;

    io.to(socket.id).emit('tintaUpdate', { userId, tinta });
  });

  // Limpiar datos cuando finaliza la partida
  socket.on('cleanDrawingData', (partidaId) => {
    console.log(`[Backend] Limpiando datos de dibujo para partida ${partidaId}`);
    if (teamDrawings[partidaId]) {
      delete teamDrawings[partidaId];
    }
  });

  // Registrar dibujo de equipo para profesor
  socket.on('registerTeamDrawing', ({ partidaId, equipoNumero, userId, action }) => {
    try {
      // Inicializar estructuras si no existen
      if (!teamDrawings.has(partidaId)) {
        teamDrawings.set(partidaId, new Map());
      }
      const partidaData = teamDrawings.get(partidaId);

      if (!partidaData.has(equipoNumero)) {
        partidaData.set(equipoNumero, {});
      }
      const teamDrawing = partidaData.get(equipoNumero);

      if (!teamDrawing[userId]) {
        teamDrawing[userId] = [];
      }

      switch (action.type) {
        case 'pathStart':
          teamDrawing[userId].push(action.path);
          break;

        case 'pathUpdate':
        case 'pathComplete':
          const existingIndex = teamDrawing[userId].findIndex(p => p.id === action.path.id);
          if (existingIndex >= 0) {
            teamDrawing[userId][existingIndex] = action.path;
          } else {
            teamDrawing[userId].push(action.path);
          }
          break;

        case 'clear':
          delete teamDrawing[userId];
          break;
      }
    } catch (error) {
      console.error('Error en registerTeamDrawing:', error);
    }
  });

  // Sincronizar estado al reconectar
  socket.on('requestDrawingSync', ({ partidaId, equipoNumero }) => {
    const gameId = `drawing-${partidaId}-${equipoNumero}`;
    if (drawingGames[gameId]) {
      const allActions = Object.entries(drawingGames[gameId].actions)
        .flatMap(([userId, actions]) =>
          actions.map(action => ({ userId, path: action }))
        );

      socket.emit('drawingSyncResponse', {
        actions: allActions,
        tintaState: drawingGames[gameId].tintaStates
      });
    }
  });

  // Obtener dibujos de un equipo específico para el profesor
  socket.on('getTeamDrawingsForProfessor', ({ partidaId, equipoNumero }, callback) => {
    try {
      if (!teamDrawings.has(partidaId)) {
        return callback({ success: false, error: 'Partida no encontrada' });
      }

      const partidaData = teamDrawings.get(partidaId);
      if (!partidaData.has(equipoNumero)) {
        return callback({ success: false, error: 'Equipo no encontrado' });
      }

      const drawings = partidaData.get(equipoNumero);
      callback({
        success: true,
        linesByUser: drawings,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener dibujos:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Limpiar dibujos de un usuario
  socket.on('clearMyDrawing', ({ partidaId, equipoNumero, userId }) => {
    const gameId = `drawing-${partidaId}-${equipoNumero}`;

    if (drawingGames[gameId]?.actions?.[userId]) {
      delete drawingGames[gameId].actions[userId];
    }

    if (drawingGames[gameId]?.tintaStates) {
      drawingGames[gameId].tintaStates[userId] = 5000;
    }

    socket.to(`team-${partidaId}-${equipoNumero}`).emit('drawingAction', {
      type: 'clear',
      userId
    });
  });

  // Obtener estado actual del dibujo
  socket.on('getDrawingState', ({ partidaId, equipoNumero }, callback) => {
    const gameId = `drawing-${partidaId}-${equipoNumero}`;
    if (drawingGames[gameId]) {
      callback(drawingGames[gameId].canvasState);
    } else {
      callback([]);
    }
  });

  // Guardar imagen final del dibujo
  socket.on('saveDrawing', async ({ partidaId, equipoNumero, imageData }) => {
    const gameId = `drawing-${partidaId}-${equipoNumero}`;

    console.log(`[MANUAL_SAVE] Guardado manual solicitado para ${gameId}`);

    if (!drawingGames[gameId]) {
      drawingGames[gameId] = { actions: {}, tintaStates: {}, imageData: null };
    }

    if (imageData && imageData.startsWith('data:image')) {
      drawingGames[gameId].imageData = imageData;
      console.log(`[MANUAL_SAVE] Imagen guardada directamente para partida ${partidaId}, equipo ${equipoNumero}`);
    } else {

      try {
        console.log(`[MANUAL_SAVE] Generando imagen desde trazos para partida ${partidaId}, equipo ${equipoNumero}`);
        const generatedImageData = await renderDrawingToBase64(partidaId, equipoNumero);
        drawingGames[gameId].imageData = generatedImageData;
        console.log(`[MANUAL_SAVE]  Imagen generada para partida ${partidaId}, equipo ${equipoNumero}`);
      } catch (error) {
        console.error(`[MANUAL_SAVE]  Error al generar imagen para partida ${partidaId}, equipo ${equipoNumero}:`, error);
        drawingGames[gameId].imageData = getBlankCanvasData();
      }
    }

    if (drawingDemoState[partidaId]?.active) {
      console.log(`[MANUAL_SAVE] Actualizando demostración para partida ${partidaId}`);
      io.to(`partida_${partidaId}`).emit('drawingUpdated', { equipoNumero });
    }

    socket.emit('drawingSaved', {
      partidaId,
      equipoNumero,
      success: true,
      hasImage: !!drawingGames[gameId].imageData
    });
  });

  // Obtener dibujos de un equipo específico
  socket.on('getTeamDrawings', ({ partidaId, equipoNumero }, callback) => {
    try {
      const partidaData = teamDrawings.get(partidaId);
      if (!partidaData) return callback({ success: false });

      const teamData = partidaData.get(equipoNumero);
      if (!teamData) return callback({ success: false });

      callback({
        success: true,
        linesByUser: teamData
      });
    } catch (error) {
      console.error('Error getting team drawings:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Obtener todos los dibujos para el profesor
  socket.on('getAllDrawingsForProfessor', (partidaId, callback) => {
    try {
      const result = {};
      const partidaData = teamDrawings.get(partidaId);

      if (partidaData) {
        for (const [equipoNumero, drawings] of partidaData) {
          result[equipoNumero] = drawings;
        }
      }

      callback({ success: true, drawingsByTeam: result });
    } catch (error) {
      console.error('Error getting all drawings:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Evento para iniciar demostración - Versión mejorada
  socket.on('startDrawingDemo', async (partidaId, callback) => {
    try {
      const pool = await poolPromise;
      const query = `
      SELECT DISTINCT Equipo_Numero
      FROM Participantes_TB
      WHERE Partida_ID_FK = @partidaId;
    `;
      const result = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .query(query);

      const equipos = result.recordset.map(r => r.Equipo_Numero).sort((a, b) => a - b);

      if (!equipos.length) {
        if (callback) callback({ error: 'No hay equipos en esta partida' });
        return;
      }

      const primerEquipo = equipos[0];

      drawingDemoState[partidaId] = {
        active: true,
        currentTeam: primerEquipo,
      };

      io.to(`partida_${partidaId}`).emit('drawingDemoStarted', {
        currentTeam: primerEquipo,
      });

      if (callback) callback({ success: true });

    } catch (error) {
      console.error('Error al iniciar modo demostración:', error);
      if (callback) callback({ error: 'Error al iniciar modo demostración' });
    }
  });

  // Evento para detener demostración
  socket.on('changeDrawingDemoTeam', ({ partidaId, equipoNumero }) => {
    if (!drawingDemoState[partidaId]) return;

    drawingDemoState[partidaId].currentTeam = equipoNumero;

    io.to(`partida_${partidaId}`).emit('drawingDemoTeamChanged', {
      currentTeam: equipoNumero,
    });
  });

  // Verificar si la demostración está activa
  socket.on('checkDrawingDemo', (partidaId, callback) => {
    const state = drawingDemoState[partidaId];
    if (state && state.active) {
      callback({ active: true, currentTeam: state.currentTeam });
    } else {
      callback({ active: false });
    }
  });

  // Votar por el mejor dibujo
  socket.on('voteForDrawing', ({ partidaId, equipoNumero, userId }, callback) => {
    try {
      if (!drawingVotes[partidaId]) {
        drawingVotes[partidaId] = {};
      }

      if (!drawingVotes[partidaId][equipoNumero]) {
        drawingVotes[partidaId][equipoNumero] = 0;
      }

      if (!userVotes[partidaId]) userVotes[partidaId] = {};
      if (!userVotes[partidaId][userId]) userVotes[partidaId][userId] = new Set();

      if (userVotes[partidaId][userId].has(equipoNumero)) {
        return callback({ error: 'Ya votaste por este equipo' });
      }

      userVotes[partidaId][userId].add(equipoNumero);
      drawingVotes[partidaId][equipoNumero] += 1;

      io.to(`partida_${partidaId}`).emit('drawingVotesUpdated', {
        partidaId,
        votes: drawingVotes[partidaId],
        topTeams: getTopTeams(drawingVotes[partidaId])
      });

      callback({ success: true });
    } catch (error) {
      console.error('Error al votar:', error);
      callback({ error: 'Error al registrar voto' });
    }
  });

  // Obtener votos actuales y equipos más votados
  socket.on('getDrawingVotes', (partidaId, callback) => {
    const votes = drawingVotes[partidaId] || {};
    callback({
      votes,
      topTeams: getTopTeams(votes)
    });
  });

  // Verificar si un usuario ya votó por un equipo específico
  socket.on('checkUserVote', ({ partidaId, userId, equipoNumero }, callback) => {
    try {
      const hasVoted = userVotes[partidaId]?.[userId]?.has(equipoNumero) || false;
      callback({ hasVoted });
    } catch (error) {
      console.error('Error al verificar voto:', error);
      callback({ error: 'Error al verificar voto' });
    }
  });

  // Función auxiliar para obtener los equipos más votados
  function getTopTeams(votes) {
    if (!votes) return [];

    const entries = Object.entries(votes);
    if (entries.length === 0) return [];

    entries.sort((a, b) => b[1] - a[1]);

    const maxVotes = entries[0][1];
    if (maxVotes === 0) return [];

    return entries
      .filter(([_, count]) => count === maxVotes)
      .map(([team]) => parseInt(team));
  }

  // Cargar dibujos guardados para demostración
  socket.on('drawingDemoStarted', (teams) => {
    setShowDemo(true);
    setCurrentDemoTeam(Math.min(...teams.map(Number))); // Error aquí
    loadDemoDrawings(teams);
  });

  // Obtener dibujo específico para demostración
  socket.on('getDrawingForDemo', ({ partidaId, equipoNumero }, callback) => {
    if (drawingDemonstration[partidaId]?.[equipoNumero]) {
      callback(drawingDemonstration[partidaId][equipoNumero]);
    } else {
      callback(null);
    }
  });

  // Modificar el evento saveDrawing
  socket.on('saveDrawing', ({ partidaId, equipoNumero, imageData }) => {
    if (!drawingDemonstration[partidaId]) {
      drawingDemonstration[partidaId] = {};
    }

    drawingDemonstration[partidaId][equipoNumero] = imageData || getBlankCanvasData();

    io.to(`partida_${partidaId}`).emit('drawingUpdated', {
      partidaId,
      equipoNumero
    });
  });

  // Obtener todos los dibujos guardados para una partida
  socket.on('getAllDrawings', (partidaId, callback) => {
    callback(drawingDemonstration[partidaId] || {});
  });

  // Evento para cambiar de equipo en la demostración
  socket.on('changeDemoTeam', (partidaId, newTeam, callback) => {
    try {
      // Verificar demo activa
      if (!activeDemos[partidaId]) {
        return callback({ error: 'No hay demo activa' });
      }

      const gameKey = `drawing-${partidaId}-${newTeam}`;
      if (!drawingGames[gameKey]?.imageData) {
        return callback({ error: 'Este equipo no tiene dibujo' });
      }

      activeDemos[partidaId] = newTeam;

      io.to(`partida_${partidaId}`).emit('demoTeamChanged', {
        currentTeam: newTeam
      });

      callback({ success: true });

    } catch (error) {
      console.error('Error:', error);
      callback({ error: 'Error al cambiar equipo' });
    }
  });

  // Evento para finalizar demo
  socket.on('endDrawingDemo', (partidaId, callback) => {
    delete drawingDemoState[partidaId];

    io.to(`partida_${partidaId}`).emit('drawingDemoEnded');

    if (callback) callback({ success: true });
  });



  // Al conectar/reconectar
  socket.on('connection', (socket) => {
    socket.on('joinPartida', (partidaId) => {
      socket.join(`partida_${partidaId}`);

      if (activeDemos[partidaId]) {
        const equipos = Object.keys(drawingDemonstration[partidaId] || {})
          .map(Number)
          .sort((a, b) => a - b);

        socket.emit('demoStatus', {
          active: true,
          currentTeam: activeDemos[partidaId].currentTeam,
          totalTeams: equipos.length
        });
      }
    });
  });

  // Obtener lista de equipos en una partida
  socket.on('getTeamsForPartida', async (partidaId, callback) => {
    try {
      const pool = await poolPromise;
      const query = `
      SELECT DISTINCT Equipo_Numero
      FROM Participantes_TB
      WHERE Partida_ID_FK = @partidaId;
    `;
      const result = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .query(query);

      const equipos = result.recordset.map(r => r.Equipo_Numero).sort((a, b) => a - b);
      callback({ success: true, equipos });
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      callback({ success: false, error: 'Error al obtener equipos' });
    }
  });

  // Obtener dibujo actual en demo
  socket.on('getCurrentDrawing', (partidaId, callback) => {
    const currentTeam = activeDemos[partidaId];
    if (!currentTeam) {
      return callback({ error: 'No hay demo activa' });
    }

    const gameKey = `drawing-${partidaId}-${currentTeam}`;
    const drawing = drawingGames[gameKey]?.imageData || null;

    callback({
      currentTeam,
      imageData: drawing
    });
  });

  // Evento para iniciar demo
  socket.on('endDemo', (partidaId) => {
    if (activeDemos[partidaId]) {
      delete activeDemos[partidaId];
      io.to(`partida_${partidaId}`).emit('demoEnded');
    }
  });


  socket.on('checkActiveDemo', (partidaId, callback) => {
    callback({
      active: !!activeDemos[partidaId],
      currentTeam: activeDemos[partidaId]?.currentTeam,
      totalTeams: activeDemos[partidaId]?.totalTeams,
      teams: activeDemos[partidaId]?.teams || []
    });
  });

  // Función para actualizar el progreso de un equipo
  function updateTeamProgress(partidaId, equipoNumero, juegoType, progress) {
    if (!teamProgress[partidaId]) {
      teamProgress[partidaId] = {};
    }
    if (!teamProgress[partidaId][equipoNumero]) {
      teamProgress[partidaId][equipoNumero] = {};
    }

    teamProgress[partidaId][equipoNumero][juegoType] = progress;

    io.to(`partida_${partidaId}`).emit('teamProgressUpdate', {
      partidaId,
      equipoNumero,
      juegoType,
      progress
    });
  }

  // Función para obtener el progreso de todos los equipos en una partida
  function getAllTeamProgress(partidaId) {
    if (!teamProgress[partidaId]) {
      const connectedTeams = new Set();
      const roomPrefix = `team-${partidaId}-`;

      for (const room of io.sockets.adapter.rooms.keys()) {
        if (room.startsWith(roomPrefix)) {
          const teamNumber = room.split('-')[2];
          connectedTeams.add(teamNumber);
        }
      }

      const result = {};
      connectedTeams.forEach(team => {
        result[team] = { connected: true };
      });
      return result;
    }

    const result = { ...teamProgress[partidaId] };
    const roomPrefix = `team-${partidaId}-`;

    for (const room of io.sockets.adapter.rooms.keys()) {
      if (room.startsWith(roomPrefix)) {
        const teamNumber = room.split('-')[2];
        if (!result[teamNumber]) {
          result[teamNumber] = { connected: true };
        }
      }
    }

    return result;
  }

  //----------------------------------------------------------
  //----------------------- Rompecabezas ---------------------
  //-------------Nueva Version AntiPop o parpadeo------------- 

  // Modificar el evento initPuzzleGame en app.js
  socket.on('initPuzzleGame', ({ partidaId, equipoNumero, difficulty, imageUrl }) => {
    const normalized = difficulty
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const sizeMap = {
      facil: 6,
      normal: 7,
      dificil: 8
    };

    const size = sizeMap[normalized] || 6;
    const totalPieces = size * size;
    const maxSwaps = totalPieces + 20;
    const key = `puzzle-${partidaId}-${equipoNumero}`;

  
    const shouldRegenerate = !puzzleGames[key] ||
      puzzleGames[key].config.rows !== size ||
      puzzleGames[key].config.imageUrl !== imageUrl;

    if (shouldRegenerate) {

      delete puzzleGames[key];

      const currentIndex = global.partidasConfig[partidaId]?.currentIndex || 0;

      if (!gameTeamTimestamps[partidaId]) gameTeamTimestamps[partidaId] = {};
      if (!gameTeamTimestamps[partidaId][equipoNumero]) gameTeamTimestamps[partidaId][equipoNumero] = {};
      if (!gameTeamTimestamps[partidaId][equipoNumero][currentIndex]) {
        gameTeamTimestamps[partidaId][equipoNumero][currentIndex] = {
          startedAt: new Date(),
          completedAt: null
        };
      }

      const seed = `${partidaId}-${equipoNumero}-${Date.now()}`; 
      const pieces = generatePuzzlePieces(size, imageUrl, seed);

      puzzleGames[key] = {
        config: {
          rows: size,
          cols: size,
          swapsLeft: maxSwaps,
          imageUrl,
          difficulty: normalized 
        },
        state: {
          pieces,
          selected: [],
          progress: calculatePuzzleProgress(pieces)
        }
      };
    }

    io.to(`team-${partidaId}-${equipoNumero}`).emit('puzzleGameState', puzzleGames[key]);
  });

  // Manejar sincronización de estado
  socket.on('syncPuzzleGame', ({ partidaId, equipoNumero }) => {
    const key = `puzzle-${partidaId}-${equipoNumero}`;
    if (puzzleGames[key]) {
      socket.emit('puzzleGameState', puzzleGames[key]);
    }
  });

  socket.on('selectPuzzlePiece', ({ partidaId, equipoNumero, pieceId, userId }) => {
    const key = `${partidaId}-${equipoNumero}`;
    const gameId = `puzzle-${partidaId}-${equipoNumero}`;
    const game = puzzleGames[gameId];
    if (!game || !game.state || !game.state.pieces) return;

    if (!puzzleSelections[key]) puzzleSelections[key] = {};
    if (!lockedPieces[key]) lockedPieces[key] = new Set();

    const userSelection = puzzleSelections[key][userId] || [];

    if (game.config.swapsLeft <= 0) {
      return socket.emit('noSwapsLeft');
    }

    if (lockedPieces[key].has(pieceId) && !userSelection.includes(pieceId)) {
      return socket.emit('pieceBlocked', pieceId);
    }

    if (userSelection.includes(pieceId)) {
      puzzleSelections[key][userId] = userSelection.filter(p => p !== pieceId);
      lockedPieces[key].delete(pieceId);
    } else {
      if (userSelection.length >= 2) return; // ya seleccionó 2
      puzzleSelections[key][userId] = [...userSelection, pieceId];
      lockedPieces[key].add(pieceId);
    }

    io.to(`team-${partidaId}-${equipoNumero}`).emit('updateSelections', {
      userId,
      selected: puzzleSelections[key][userId]
    });

    if (puzzleSelections[key][userId].length === 2) {
      const [id1, id2] = puzzleSelections[key][userId];
      const p1 = game.state.pieces.find(p => p.id === id1);
      const p2 = game.state.pieces.find(p => p.id === id2);
      if (!p1 || !p2) return;

      [p1.currentRow, p2.currentRow] = [p2.currentRow, p1.currentRow];
      [p1.currentCol, p2.currentCol] = [p2.currentCol, p1.currentCol];

      game.config.swapsLeft = Math.max(0, game.config.swapsLeft - 1);

      game.state.progress = calculatePuzzleProgress(game.state.pieces);

      updateTeamProgress(partidaId, equipoNumero, 'Rompecabezas', game.state.progress);

      const currentIndex = global.partidasConfig?.[partidaId]?.currentIndex || 0;
      if (!gameTeamProgress[partidaId]) gameTeamProgress[partidaId] = {};
      if (!gameTeamProgress[partidaId][equipoNumero]) gameTeamProgress[partidaId][equipoNumero] = {};
      gameTeamProgress[partidaId][equipoNumero][currentIndex] = game.state.progress;

      if (game.state.progress === 100 || game.config.swapsLeft <= 0) {
        if (!gameTeamTimestamps[partidaId]) gameTeamTimestamps[partidaId] = {};
        if (!gameTeamTimestamps[partidaId][equipoNumero]) gameTeamTimestamps[partidaId][equipoNumero] = {};
        if (!gameTeamTimestamps[partidaId][equipoNumero][currentIndex]) {
          gameTeamTimestamps[partidaId][equipoNumero][currentIndex] = {};
        }

        if (!gameTeamTimestamps[partidaId][equipoNumero][currentIndex].completedAt) {
          gameTeamTimestamps[partidaId][equipoNumero][currentIndex].completedAt = new Date();
        }
      }

      io.to(`team-${partidaId}-${equipoNumero}`).emit('puzzleUpdate', {
        pieces: game.state.pieces,
        selected: [],
        swapsLeft: game.config.swapsLeft,
        progress: game.state.progress
      });

      puzzleSelections[key][userId] = [];
      lockedPieces[key].delete(id1);
      lockedPieces[key].delete(id2);
    }
  });


  socket.on('requestPuzzleState', ({ partidaId, equipoNumero }) => {
    const key = `puzzle-${partidaId}-${equipoNumero}`;
    const game = puzzleGames[key];
    if (game) {
      socket.emit('puzzleGameState', game);
    }
  });

  socket.on('getTeamProgress', (partidaId, callback) => {
    callback(getAllTeamProgress(partidaId));
  });

});

//-----------------------------------------------------------
//----------------------- Resultados ------------------------
//-------------Funciones para obtener resultados-------------

async function renderDrawingToBase64(partidaId, equipoNumero) {
  const gameId = `drawing-${partidaId}-${equipoNumero}`;
  const game = drawingGames[gameId];

  console.log(`[DEBUG] Intentando generar imagen para ${gameId}`);
  console.log(`[DEBUG] Game exists:`, !!game);
  console.log(`[DEBUG] Actions exists:`, !!game?.actions);
  console.log(`[DEBUG] Actions keys:`, Object.keys(game?.actions || {}));

  if (!game || !game.actions || Object.keys(game.actions).length === 0) {
    console.log(`[DEBUG] No hay trazos para partida ${partidaId}, equipo ${equipoNumero}, devolviendo canvas en blanco`);
    return getBlankCanvasData();
  }

  const width = 800;
  const height = 600;

  let pathsSVG = '';
  let totalPaths = 0;

  for (const [userId, paths] of Object.entries(game.actions)) {
    if (!paths || !Array.isArray(paths)) {
      console.log(`[DEBUG] Paths inválidos para usuario ${userId}`);
      continue;
    }

    console.log(`[DEBUG] Usuario ${userId} tiene ${paths.length} trazos`);

    for (const path of paths) {
      if (!path.points || !Array.isArray(path.points) || path.points.length === 0) {
        console.log(`[DEBUG] Path sin puntos válidos:`, path);
        continue;
      }

      const d = path.points.map((p, i) => {
        if (typeof p.x !== 'number' || typeof p.y !== 'number') {
          console.log(`[DEBUG] Punto inválido:`, p);
          return '';
        }
        return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`;
      }).filter(segment => segment !== '').join(' ');

      if (d.length > 0) {
        pathsSVG += `
          <path d="${d}"
            stroke="${path.color || '#000000'}"
            stroke-width="${path.strokeWidth || 2}"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        `;
        totalPaths++;
      }
    }
  }

  console.log(`[DEBUG] Total de paths generados: ${totalPaths}`);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="white"/>
      ${pathsSVG}
    </svg>
  `;

  console.log(`[DEBUG] SVG generado (${svg.length} caracteres)`);

  return new Promise((resolve, reject) => {
    try {
      svg2img(svg, { format: 'png', width, height }, (error, buffer) => {
        if (error) {
          console.error('[ERROR] Error al convertir SVG a PNG:', error);
          resolve(getBlankCanvasData()); 
          return;
        }

        if (!buffer || buffer.length === 0) {
          console.error('[ERROR] Buffer vacío al convertir SVG');
          resolve(getBlankCanvasData());
          return;
        }

        const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
        console.log(`[SUCCESS] Base64 generado correctamente para partida ${partidaId}, equipo ${equipoNumero} (${base64.length} caracteres)`);
        resolve(base64);
      });
    } catch (error) {
      console.error('[ERROR] Error al usar svg2img:', error);
      resolve(getBlankCanvasData()); 
    }
  });
}

// Función para evaluar logros grupales
async function evaluarLogrosGrupales(partidaId, resultadosPorEquipo) {
  try {
    console.log(`[LOGROS] Evaluando logros grupales para partida ${partidaId}`);
    const pool = await poolPromise;

    const logrosGrupoPorJuego = {
      'Dibujo': 'Artista',
      'Ahorcado': 'Adivinador (Grupo)',
      'Memoria': 'Buena vista',
      'Rompecabezas': 'Gran talento'
    };

    const promesasEquipos = resultadosPorEquipo.map(async (equipo) => {
      const equipoNumero = equipo.equipo;
      const tiposJuegosJugados = new Set();

      const participantesResult = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .input('equipoNumero', sql.Int, equipoNumero)
        .query(`
          SELECT Usuario_ID_FK 
          FROM Participantes_TB 
          WHERE Partida_ID_FK = @partidaId AND Equipo_Numero = @equipoNumero
        `);

      const participantes = participantesResult.recordset.map(p => p.Usuario_ID_FK);

      for (const juego of equipo.juegos) {
        if (!juego.comentario || !juego.comentario.includes('Juego No Participado')) {
          tiposJuegosJugados.add(juego.tipoJuego);
        }
      }

      const promesasLogros = [];

      for (const tipoJuego of tiposJuegosJugados) {
        if (logrosGrupoPorJuego[tipoJuego]) {
          const nombreLogro = logrosGrupoPorJuego[tipoJuego];

          for (const usuarioId of participantes) {
            promesasLogros.push(
              asignarLogro(usuarioId, nombreLogro, 'grupo', partidaId)
            );
          }

          console.log(`[LOGRO] Equipo ${equipoNumero} obtuvo "${nombreLogro}" por jugar ${tipoJuego}`);
        }
      }

      if (tiposJuegosJugados.size > 0) {
        for (const usuarioId of participantes) {
          promesasLogros.push(
            asignarLogro(usuarioId, 'Trabajo en equipo', 'grupo', partidaId)
          );
        }
        console.log(`[LOGRO] Equipo ${equipoNumero} obtuvo "Trabajo en equipo"`);
      }

      await Promise.all(promesasLogros);
    });

    await Promise.all(promesasEquipos);

    return true;
  } catch (error) {
    console.error('Error al evaluar logros grupales:', error);
    return false;
  }
}

// Función para evaluar logros personales
async function evaluarLogrosPersonales(partidaId) {
  try {
    console.log(`[LOGROS] Evaluando logros personales para partida ${partidaId}`);
    const pool = await poolPromise;

    const participantesResult = await pool.request()
      .input('partidaId', sql.Int, partidaId)
      .query(`
        SELECT p.Usuario_ID_FK, p.Equipo_Numero,
               r.Resultados
        FROM Participantes_TB p
        LEFT JOIN Resultados_TB r ON r.Partida_ID_FK = p.Partida_ID_FK AND r.Equipo = p.Equipo_Numero
        WHERE p.Partida_ID_FK = @partidaId
      `);

    const logrosPersonalesPorJuego = {
      'Dibujo': 'Diseñador',
      'Memoria': 'Localizador de parejas',
      'Rompecabezas': 'Localizador de detalles pequeños',
      'Ahorcado': 'Adivinador'
    };

    const BATCH_SIZE = 20;
    const usuarios = participantesResult.recordset;

    for (let i = 0; i < usuarios.length; i += BATCH_SIZE) {
      const lote = usuarios.slice(i, i + BATCH_SIZE);

      const promesasLote = lote.map(async (participante) => {
        const usuarioId = participante.Usuario_ID_FK;
        const promesasUsuario = [];

        promesasUsuario.push(
          asignarLogro(usuarioId, 'Jugador de partidas', 'usuario', partidaId)
        );

        const primeraVezResult = await pool.request()
          .input('usuarioId', sql.Int, usuarioId)
          .input('partidaId', sql.Int, partidaId)
          .query(`
            SELECT COUNT(*) AS total
            FROM Participantes_TB
            WHERE Usuario_ID_FK = @usuarioId AND Partida_ID_FK != @partidaId
          `);

        if (primeraVezResult.recordset[0].total === 0) {
          promesasUsuario.push(
            asignarLogro(usuarioId, 'Gracias por jugar', 'usuario', partidaId)
          );
        }

        if (participante.Resultados) {
          const resultados = JSON.parse(participante.Resultados);
          const tiposJugados = new Set();

          for (const juego of resultados) {
            if (!juego.comentario || !juego.comentario.includes('Juego No Participado')) {
              tiposJugados.add(juego.tipoJuego);
            }
          }

          for (const tipoJuego of tiposJugados) {
            if (logrosPersonalesPorJuego[tipoJuego]) {
              promesasUsuario.push(
                asignarLogro(usuarioId, logrosPersonalesPorJuego[tipoJuego], 'usuario', partidaId)
              );
            }
          }
        }

        promesasUsuario.push(verificarLogrosNivelOptimizado(usuarioId, partidaId));
        promesasUsuario.push(verificarLogroCazadorDeLogros(usuarioId, partidaId));

        return Promise.all(promesasUsuario);
      });

      await Promise.all(promesasLote);
    }

    return true;
  } catch (error) {
    console.error('Error al evaluar logros personales:', error);
    return false;
  }
}

// Función optimizada para verificar logros de nivel
async function verificarLogrosNivelOptimizado(usuarioId, partidaId) {
  try {
    const pool = await poolPromise;

    const conteosResult = await pool.request()
      .input('usuarioId', sql.Int, usuarioId)
      .query(`
        SELECT l.Nombre, COUNT(*) AS total
        FROM Usuario_Logros_TB ul
        JOIN Logros_TB l ON ul.Logro_ID_FK = l.Logro_ID_PK
        WHERE ul.Usuario_ID_FK = @usuarioId 
        AND l.Nombre IN ('Diseñador', 'Localizador de parejas', 'Localizador de detalles pequeños', 'Adivinador', 'Jugador de partidas')
        GROUP BY l.Nombre
      `);

    const conteos = {};
    conteosResult.recordset.forEach(row => {
      conteos[row.Nombre] = row.total;
    });

    const logrosNivel = [
      { base: 'Diseñador', prefijo: 'Diseñador - Nivel' },
      { base: 'Localizador de parejas', prefijo: 'Localizador de parejas - Nivel' },
      { base: 'Localizador de detalles pequeños', prefijo: 'Localizador de detalles pequeños - Nivel' },
      { base: 'Adivinador', prefijo: 'Adivinador - Nivel' },
      { base: 'Jugador de partidas', prefijo: 'Jugador de partidas - Nivel' }
    ];

    const promesasNivel = [];

    for (const tipoLogro of logrosNivel) {
      const total = conteos[tipoLogro.base] || 0;

      for (let nivel = 2; nivel <= 4; nivel++) {
        if (total >= nivel) {
          const nombreLogro = `${tipoLogro.prefijo} ${nivel}`;
          promesasNivel.push(
            asignarLogro(usuarioId, nombreLogro, 'usuario', partidaId)
          );
        }
      }
    }

    await Promise.all(promesasNivel);
    return true;
  } catch (error) {
    console.error('Error al verificar logros de nivel:', error);
    return false;
  }
}

async function asignarLogro(usuarioId, nombreLogro, tipoLogro, partidaId) {
  try {
    const pool = await poolPromise;

    if (!global.logrosCache) {
      global.logrosCache = {};
    }

    const cacheKey = `${nombreLogro}-${tipoLogro}`;
    
    let logroInfo = global.logrosCache[cacheKey];
    if (!logroInfo) {
      const logroResult = await pool.request()
        .input('nombreLogro', sql.VarChar(100), nombreLogro)
        .input('tipoLogro', sql.VarChar(50), tipoLogro)
        .query(`
          SELECT Logro_ID_PK, Repetible
          FROM Logros_TB
          WHERE Nombre = @nombreLogro AND Tipo = @tipoLogro
        `);

      if (logroResult.recordset.length === 0) {
        console.error(`[ERROR] Logro no encontrado: ${nombreLogro} (${tipoLogro})`);
        return false;
      }

      logroInfo = {
        id: logroResult.recordset[0].Logro_ID_PK,
        repetible: logroResult.recordset[0].Repetible === 1
      };

      global.logrosCache[cacheKey] = logroInfo;
    }

    if (!logroInfo.repetible) {
      const existeResult = await pool.request()
        .input('usuarioId', sql.Int, usuarioId)
        .input('logroId', sql.Int, logroInfo.id)
        .query(`
          SELECT COUNT(*) AS total
          FROM Usuario_Logros_TB
          WHERE Usuario_ID_FK = @usuarioId AND Logro_ID_FK = @logroId
        `);

      if (existeResult.recordset[0].total > 0) {
        return false; 
      }
    }

    await pool.request()
      .input('usuarioId', sql.Int, usuarioId)
      .input('logroId', sql.Int, logroInfo.id)
      .input('fechaObtencion', sql.DateTime, new Date())
      .input('partidaId', sql.Int, partidaId)
      .query(`
        INSERT INTO Usuario_Logros_TB (Usuario_ID_FK, Logro_ID_FK, FechaObtenido, Partida_ID_FK)
        VALUES (@usuarioId, @logroId, @fechaObtencion, @partidaId)
      `);

    console.log(`[LOGRO] Usuario ${usuarioId} obtuvo "${nombreLogro}"`);
    return true;
  } catch (error) {
    console.error(`Error al asignar logro ${nombreLogro} a usuario ${usuarioId}:`, error);
    return false;
  }
}


// Función para verificar logro "Cazador de logros"
async function verificarLogroCazadorDeLogros(usuarioId, partidaId) {
  try {
    const pool = await poolPromise;

    const logrosResult = await pool.request()
      .input('usuarioId', sql.Int, usuarioId)
      .query(`
        SELECT COUNT(*) AS total
        FROM Usuario_Logros_TB
        WHERE Usuario_ID_FK = @usuarioId
      `);

    const totalLogros = logrosResult.recordset[0].total;

    if (totalLogros >= 20) {
      await asignarLogro(usuarioId, 'Cazador de logros', 'usuario', partidaId);
    }

    return true;
  } catch (error) {
    console.error('Error al verificar logro Cazador de logros:', error);
    return false;
  }
}

// Función para generar resultados del juego actual
async function generarResultadosJuegoActual(partidaId) {
  try {
    const config = global.partidasConfig[partidaId];
    if (!config) throw new Error("Configuración no encontrada");

    const currentIndex = config.currentIndex;
    const juegoActual = config.juegos[currentIndex];

    const pool = await poolPromise;
    const equiposQuery = await pool.request()
      .input('partidaId', sql.Int, partidaId)
      .query(`
        SELECT DISTINCT Equipo_Numero FROM Participantes_TB 
        WHERE Partida_ID_FK = @partidaId
      `);

    const equipos = equiposQuery.recordset.map(row => row.Equipo_Numero);
    const resultados = [];

    for (const equipoNumero of equipos) {
      const timestamp = gameTeamTimestamps[partidaId]?.[equipoNumero]?.[currentIndex];
      let tiempoJugado = "N/A";
      let comentario = "Juego No Participado";
      let progreso = "N/A";

      if (timestamp && timestamp.startedAt) {
        const finishTime = timestamp.completedAt || new Date();
        const tiempoMs = finishTime - timestamp.startedAt;
        tiempoJugado = Math.round(tiempoMs / 1000); 
        comentario = ""; 

        if (juegoActual.tipo === "Memoria") {
          const gameId = `memory-${partidaId}-${equipoNumero}-${currentIndex}`;
          const game = memoryGames[gameId];
          if (game) {
            const { matchedPairs, gameCompleted } = game.state;
            const { pairsCount } = game.config;
            progreso = `${matchedPairs}/${pairsCount}`;
          }
        } else if (juegoActual.tipo === "Rompecabezas") {
          const gameId = `puzzle-${partidaId}-${equipoNumero}-${currentIndex}`;
          const game = puzzleGames[gameId];
          if (game && game.state && game.state.pieces) {
            const currentProgress = calculatePuzzleProgress(game.state.pieces);
            progreso = `${currentProgress}%`;

            game.state.progress = currentProgress;

            if (currentProgress === 100 && timestamp && !timestamp.completedAt) {
              timestamp.completedAt = new Date();
            }
          } else {
            progreso = "0%";
          }
        } else if (juegoActual.tipo === "Ahorcado") {
          const gameId = `hangman-${partidaId}-${equipoNumero}-${currentIndex}`;
          const game = hangmanGames[gameId];
          if (game) {
            const letrasAdivinadas = game.state.letrasAdivinadas.length;
            const intentosUsados = game.config.intentosMaximos - game.state.intentosRestantes;
            progreso = `${letrasAdivinadas}/${intentosUsados}`;
          }
        } if (juegoActual.tipo === "Dibujo") {
          try {
            const gameId = `drawing-${partidaId}-${equipoNumero}`;
            const game = drawingGames[gameId];

            console.log(`[RESULTS] Procesando dibujo para equipo ${equipoNumero}`);
            console.log(`[RESULTS] Game exists:`, !!game);
            console.log(`[RESULTS] Has imageData:`, !!game?.imageData);

            if (game && game.imageData) {
              comentario = game.imageData;
              console.log(`[RESULTS] Usando imagen existente para equipo ${equipoNumero}`);
            } else {
              console.log(`[RESULTS] No hay imagen guardada, generando nueva para equipo ${equipoNumero}`);
              const generatedImage = await renderDrawingToBase64(partidaId, equipoNumero);

              if (!drawingGames[gameId]) {
                drawingGames[gameId] = { actions: {}, tintaStates: {}, imageData: null };
              }
              drawingGames[gameId].imageData = generatedImage;

              comentario = generatedImage;
              console.log(`[RESULTS] Imagen generada y guardada para equipo ${equipoNumero}`);
            }

            progreso = "Dibujo completado";
          } catch (error) {
            console.error('[RESULTS] Error al procesar imagen de dibujo:', error);
            comentario = getBlankCanvasData();
            progreso = "Error al procesar dibujo";
          }
        }
      }

      resultados.push({
        partidaId,
        equipoNumero,
        juegoNumero: juegoActual.Orden,
        tipoJuego: juegoActual.tipo,
        tiempo: tiempoJugado,
        progreso,
        tema: juegoActual.tema || "Sin tema específico",
        comentario
      });
    }

    return resultados;
  } catch (error) {
    console.error('Error al generar resultados:', error);
    return [];
  }
}

//-----------------------------------------------------------

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
  try {
    await poolPromise;
    console.log('Conexión a la base de datos exitosa');
  } catch (error) {
    console.log("Error al conectar con la base de datos:", error);
  }
});

export { io };

export default app;