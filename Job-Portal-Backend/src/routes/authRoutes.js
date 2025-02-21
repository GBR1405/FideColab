// routes/userRoutes.js
import express from 'express';
import {login, register, forgotPassword, resetPassword, updateUser, getFullUserDetails} from '../controllers/authController.js';
import { loginLimiter } from "../middleware/loginLimiter.js";


const router = express.Router();

router.post('/register-user', register);
router.post('/login',loginLimiter, login);
router.post('/forgot-password', loginLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/user-edit', updateUser);
router.get('/user-profile', getFullUserDetails);


export default router;
