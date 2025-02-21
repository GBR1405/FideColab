import express from 'express';
import userRoutes from './routes/userRoutes.js';
import bodyParser from 'body-parser';
import { poolPromise } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import PersonalizeRoutes from './routes/PersonalizeRoutes.js';
import AdminRouters from './routes/AdminRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authMiddleware from './middleware/authMiddleware.js';  


const app = express();

app.use(bodyParser.json({ limit: '50mb' }));  
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

dotenv.config();

app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json()); // Middleware para procesar cuerpos JSON

// Usa el middleware de autenticación en las rutas que requieren estar autenticado
app.use('/api/users', authMiddleware, userRoutes); 
app.use('/api/auth', authRoutes); 
app.use('/api/', PersonalizeRoutes)
app.use('/api/', AdminRouters)


app.listen(3000, async () => {
  console.log('Server running on port 3000');
  try {
    // Esperar a que la conexión al pool de la base de datos se resuelva
    await poolPromise;
    console.log('Conexión a la base de datos exitosa');
  } catch (error) {
    console.log("Failed to initialize the database", error);
  }
});
