// app.js
import express from 'express';
import userRoutes from './routes/userRoutes.js';
import { poolPromise  } from './config/db.js';
import authRoutes from './routes/authRoutes.js'
import cors from 'cors'
import dotenv from 'dotenv';  



const app = express();
app.use(cors());
dotenv.config();  


app.use(express.json()); // Middleware to parse JSON bodies
app.use('/api/users', userRoutes); // Use user routes for API calls
app.use('/api/auth', authRoutes); // Use user routes for API calls

app.listen(3000, async () => {
  console.log('Server running on port 3000');
  try {
    // Esperar a que la conexión al pool de la base de datos se resuelva
    await poolPromise;
    console.log('Conexión a la base de datos exitosa');
    // Aquí puedes crear las tablas si es necesario
    // await createAllTable(); // Descomenta si tienes una función para crear tablas
  } catch (error) {
    console.log("Failed to initialize the database", error);
  }
});

