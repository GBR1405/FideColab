// routes/userRoutes.js
import express from 'express';
import {generateStudentsReport} from '../controllers/adminController.js';

const router = express.Router();

router.get('/report-students', generateStudentsReport);

export default router;