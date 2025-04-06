import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; // Importar Socket.IO
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

const app = express();
const pool = await poolPromise;

// Configuraciones de Express
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

dotenv.config();

app.use(
  cors({
    origin: ["http://localhost:3001", "http://192.168.0.6:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());

// Rutas de la aplicación
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/', PersonalizeRoutes);
app.use('/api/', AdminRouters);
app.use('/api/', TeacherRoutes);
app.use('/api/', simulationRoutes);

// Crear servidor HTTP para Express y Socket.IO
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001", "http://192.168.0.6:3001"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Estado global por sala
const salas = {};
const activeGames = {};
const puzzleStates = {};
const partidasConfig = new Map();
const partidaRooms = new Map();

//Obtener juegos

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

// Lógica de Socket.IO
io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado:', socket.id);

  // Unirse a una sala
  socket.on('JoinRoom', async (roomId, user) => {
    try {
      const pool = await poolPromise; // Obtener la conexión a la base de datos

      // Paso 1: Obtener el rol del usuario
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

      // Paso 2: Verificar el rol y aplicar la lógica correspondiente
      let partidaId;

      if (rol === 'Profesor') {
        // Buscar si el profesor tiene una partida activa
        const partidaResult = await pool.request()
          .input('userId', sql.Int, user.userId)
          .query(`
            SELECT Partida_ID_PK 
            FROM Partida_TB 
            WHERE Profesor_ID_FK = @userId AND EstadoPartida = 'iniciada';
          `);

        if (partidaResult.recordset.length === 0) {
          console.log(`Profesor ${user.fullName} (ID: ${user.userId}) no tiene partidas iniciadas.`);
          socket.emit('NoAutorizado', 'No tienes partidas iniciadas.');
          return;
        }

        partidaId = partidaResult.recordset[0].Partida_ID_PK;
      } else {
        // Verificar si el estudiante está en una partida activa
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

        // Verificar si la partida está activa
        const partidaActiva = await pool.request()
          .input('partidaId', sql.Int, partidaId)
          .query(`
            SELECT EstadoPartida 
            FROM Partida_TB 
            WHERE Partida_ID_PK = @partidaId AND EstadoPartida = 'iniciada';
          `);

        if (partidaActiva.recordset.length === 0) {
          console.log(`Estudiante ${user.fullName} (ID: ${user.userId}) no está en una partida activa.`);
          socket.emit('NoAutorizado', 'No estás en una partida activa.');
          return;
        }
      }

      // Paso 3: Verificar si la sala a la que intenta unirse coincide con la partida activa
      if (partidaId !== parseInt(roomId)) {
        console.log(`Usuario ${user.fullName} (ID: ${user.userId}) intentó unirse a una sala no autorizada (${roomId})`);
        socket.emit('NoAutorizado', 'No tienes permiso para unirte a esta sala.');
        return;
      }

      // Si está autorizado, unirse a la sala
      socket.join(roomId);

      // Inicializar la sala si no existe
      if (!salas[roomId]) {
        salas[roomId] = {
          usuarios: [],
        };
      }

      // Asignar un socketId al usuario
      user.socketId = socket.id;

      // Verificar si el usuario ya está en la sala
      const usuarioExistente = salas[roomId].usuarios.find(u => u.userId === user.userId);

      if (!usuarioExistente) {
        // Agregar el usuario a la sala
        salas[roomId].usuarios.push(user);
      }

      // Notificar a todos los usuarios en la sala
      io.to(roomId).emit('UpdateUsers', salas[roomId].usuarios);

      console.log(`Usuario ${user.fullName} (ID: ${user.userId}) se unió a la sala ${roomId}`);
    } catch (error) {
      console.error('Error al verificar la participación:', error);
      socket.emit('ErrorServidor', 'Hubo un problema al verificar tu participación.');
    }
  });

  // Salir de una sala
  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado:', socket.id);
  
    // Buscar y eliminar al usuario de todas las salas
    for (const roomId in salas) {
      const usuariosEnSala = salas[roomId].usuarios;
      const usuarioDesconectado = usuariosEnSala.find(u => u.socketId === socket.id);
  
      if (usuarioDesconectado) {
        // Eliminar al usuario de la sala
        salas[roomId].usuarios = usuariosEnSala.filter(u => u.socketId !== socket.id);
  
        // Notificar a todos los usuarios en la sala
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

      // Obtener la lista de participantes y sus equipos
      const query = `
        SELECT Usuario_ID_FK, Equipo_Numero
        FROM Participantes_TB
        WHERE Partida_ID_FK = @partidaId;
      `;

      const result = await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .query(query);

      // Notificar a cada estudiante a qué sala unirse
      result.recordset.forEach((participante) => {
        const salaEquipo = `${partidaId}-${participante.Equipo_Numero}`;
        io.to(participante.Usuario_ID_FK).emit('JoinTeamRoom', salaEquipo);
      });

      // Actualizar el estado de la partida a "iniciada"
      await pool.request()
        .input('partidaId', sql.Int, partidaId)
        .query(`
          UPDATE Partida_TB
          SET EstadoPartida = 'iniciada'
          WHERE Partida_ID_PK = @partidaId;
        `);

      console.log(`Partida ${partidaId} iniciada. Estudiantes redirigidos a sus salas de equipo.`);
    } catch (error) {
      console.error('Error al iniciar la partida:', error);
    }
  });

  socket.on('StartGameSession', async ({ profesorId, partidaId }) => {
    try {
      const pool = await poolPromise;
      const request = pool.request();
  
      // 1. Obtener personalización de la partida
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
  
      // 2. Obtener configuración de juegos
      const games = await getGameConfig(personalizacionId);
  
      // 3. Crear estructura de la sesión
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
          estado: {} // Para guardar estado específico del juego
        })),
        teamMembers: [],
        estadoGeneral: {
          iniciada: new Date(),
          ultimaActualizacion: new Date()
        }
      };
  
      // 4. Notificar que la partida está lista
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
      // 1. Validar parámetros
      if (!partidaId || !equipoNumero) {
        throw new Error('Faltan partidaId o equipoNumero');
      }
  
      // 2. Crear ID de sala (consistente con frontend)
      const roomId = `team-${partidaId}-${equipoNumero}`;
      socket.join(roomId);

      // Registrar la sala en nuestro mapa
      if (!partidaRooms.has(partidaId)) {
        partidaRooms.set(partidaId, new Set());
      }
      partidaRooms.get(partidaId).add(equipoNumero);
  
      // 3. Obtener miembros del equipo (ejemplo con SQL Server)
      const query = `
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
        .query(query);
  
      // 4. Emitir miembros actualizados
      io.to(roomId).emit('UpdateTeamMembers', result.recordset);
  
      console.log(`Usuario ${userId} unido a ${roomId}`);
  
    } catch (error) {
      console.error('Error en JoinTeamRoom:', error.message);
      socket.emit('error', { message: 'Error al unirse a la sala' });
    }
  });

  // Movimiento del mouse
  socket.on('SendMousePosition', ({ roomId, userId, x, y }) => {
    // Validar que roomId sea string
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

  // Click y arrastrar (rompecabezas)
  socket.on('DragPiece', (roomId, userId, pieceId, x, y) => {
    console.log(`Usuario ${userId} arrastró la pieza ${pieceId} a (${x}, ${y}) en la sala ${roomId}`);
    // Transmitir a todos en la sala excepto al remitente original
    socket.to(roomId).emit('BroadcastDragPiece', userId, pieceId, x, y);
  });
  // Click (memoria y ahorcado)
  socket.on('Click', (roomId, userId, targetId) => {
    console.log(`Usuario ${userId} hizo click en ${targetId} en la sala ${roomId}`);
    io.to(roomId).emit('BroadcastClick', userId, targetId);
  });

  // Dibujo
  socket.on('StartDrawing', (roomId, userId, x, y) => {
    console.log(`Usuario ${userId} comenzó a dibujar en (${x}, ${y}) en la sala ${roomId}`);
    io.to(roomId).emit('BroadcastStartDrawing', userId, x, y);
  });

  socket.on('Draw', (roomId, userId, x, y) => {
    console.log(`Usuario ${userId} dibujó en (${x}, ${y}) en la sala ${roomId}`);
    io.to(roomId).emit('BroadcastDraw', userId, x, y);
  });

  socket.on('StopDrawing', (roomId, userId) => {
    console.log(`Usuario ${userId} dejó de dibujar en la sala ${roomId}`);
    io.to(roomId).emit('BroadcastStopDrawing', userId);
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado:', socket.id);
  });


  //Prueba -----------------------------------------------------------------------
// Cuando un cliente selecciona un juego
socket.on('SelectGame', (roomId, gameType) => {
  const defaultConfig = {
    rows: 5,
    cols: 5,
    imageUrl: 'https://imagen.nextn.es/wp-content/uploads/2022/08/2208-10-Splatoon-3-01.jpg?strip=all&lossy=1&sharp=1&ssl=1'
  };
  io.to(roomId).emit('LoadGame', gameType, defaultConfig);
  
  if (!puzzleStates[roomId]) {
    puzzleStates[roomId] = []; // Inicializar estado vacío
  }
});

// Inicializar juego
socket.on('InitGame', (roomId, gameType, initialState) => {
  if (!activeGames[roomId]) return;
  activeGames[roomId].state = initialState;
  io.to(roomId).emit('UpdateGameState', gameType, initialState);
});

socket.on('RequestPuzzleState', (roomId) => {
  socket.emit('LoadPuzzleState', puzzleStates[roomId] || null);
});

socket.on('MovePiece', ({ roomId, pieceId, x, y }) => {
  if (!puzzleStates[roomId]) return;
  
  puzzleStates[roomId] = puzzleStates[roomId].map(piece => 
    piece.id === pieceId ? { ...piece, x, y } : piece
  );
  
  socket.to(roomId).emit('UpdatePieces', puzzleStates[roomId]);
});

socket.on('InitPuzzle', (roomId, pieces) => {
  puzzleStates[roomId] = pieces;
  io.to(roomId).emit('UpdatePieces', pieces);
});

socket.on('UpdatePieces', (roomId, pieces) => {
  puzzleStates[roomId] = pieces;
  io.to(roomId).emit('UpdatePieces', pieces);
});

socket.on('LockPiece', ({ roomId, pieceId, x, y }) => {
  if (!puzzleStates[roomId]) return;
  
  puzzleStates[roomId] = puzzleStates[roomId].map(piece => 
    piece.id === pieceId ? { ...piece, x, y, locked: true } : piece
  );
  
  io.to(roomId).emit('UpdatePieces', puzzleStates[roomId]);
});

// Modifica el evento getGameConfig
socket.on('getGameConfig', async (partidaId, callback) => {
  try {
    const pool = await poolPromise;

    // Verificar si ya tenemos la configuración en la variable global
    if (global.partidasConfig && global.partidasConfig[partidaId]) {
      const config = global.partidasConfig[partidaId];
      return callback({
        juegos: config.juegos,
        total: config.juegos.length,
        profesorId: config.profesorId,
        currentIndex: config.currentIndex
      });
    }
    
    // 1. Obtener partida con profesorId
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
    
    // 2. Obtener configuración de juegos
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
                WHEN 1 THEN '3x3'
                WHEN 2 THEN '4x4'
                WHEN 3 THEN '5x5'
              END
            WHEN 'Dibujo' THEN 
              CASE cj.Dificultad
                WHEN 1 THEN '3 minutos'
                WHEN 2 THEN '2 minutos'
                WHEN 3 THEN '1 minuto'
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

    // Inicializar la configuración global SIEMPRE
    if (!global.partidasConfig) global.partidasConfig = {};
    
    // Usar el índice actual si existe, de lo contrario empezar en 0
    const currentIndex = global.partidasConfig[partidaId]?.currentIndex || 0;
    
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

socket.on('joinPartidaRoom', (partidaId) => {
  socket.join(`partida_${partidaId}`);
  console.log(`Socket ${socket.id} se unió a partida_${partidaId}`);
});

// Para dejar la sala general de partida
socket.on('leavePartidaRoom', (partidaId) => {
  socket.leave(`partida_${partidaId}`);
  console.log(`Socket ${socket.id} dejó partida_${partidaId}`);
});

// Mejora el evento nextGame
socket.on('nextGame', (partidaId, callback) => {
  try {
    if (!global.partidasConfig || !global.partidasConfig[partidaId]) {
      return callback({ error: "Configuración no encontrada" });
    }

    const config = global.partidasConfig[partidaId];
    
    // Verificar si ya se completaron todos los juegos
    if (config.currentIndex >= config.juegos.length - 1) {
      delete global.partidasConfig[partidaId];
      io.to(`partida_${partidaId}`).emit('allGamesCompleted');
      return callback({ completed: true });
    }

    // Incrementar el índice
    config.currentIndex += 1;
    const currentGame = config.juegos[config.currentIndex];
    
    // Opción 1: Emitir a TODA la partida (incluye profesor y estudiantes)
    io.to(`partida_${partidaId}`).emit('gameChanged', {
      currentGame,
      currentIndex: config.currentIndex,
      total: config.juegos.length
    });

    // Opción 2: Emitir solo a las salas de equipo (si necesitas diferenciar)
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

});



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