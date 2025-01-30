// routes/userRoutes.js
import express from 'express';
import { getUserDetails, login, register, forgotPassword, resetPassword} from '../controllers/authController.js';


const router = express.Router();

router.post('/register-user', register);
router.post('/login', login);
router.get('/get-userDetails', getUserDetails);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


export default router;
