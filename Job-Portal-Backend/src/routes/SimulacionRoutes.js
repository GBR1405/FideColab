import express from 'express';
import {checkParticipation, checkGroup, checkActivity, getResults, getFullUserGames, obtenerResultadosProfesor,obtenerResultadoEstudiante, PeticionInternet } from '../controllers/simulatorController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get('/check-participation',authMiddleware, checkParticipation);
router.get('/checkgroup',authMiddleware, checkGroup);
router.post('/check-activity',authMiddleware, checkActivity);
router.get('/resultados/:partidaId', authMiddleware, getResults);
router.get('/get-user-games', authMiddleware,roleMiddleware(["Estudiante", "Profesor"]), getFullUserGames);
router.get('/result-teacher', authMiddleware,roleMiddleware(["Profesor"]), obtenerResultadosProfesor);
router.get('/result-student', authMiddleware,roleMiddleware(["Estudiante"]), obtenerResultadoEstudiante);

export default router;