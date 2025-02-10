// routes/userRoutes.js
import express from 'express';
import { getUserDetails, login, register, forgotPassword, resetPassword, updateUser, getFullUserDetails} from '../controllers/authController.js';


const router = express.Router();

router.post('/register-user', register);
router.post('/login', login);
router.get('/get-userDetails', getUserDetails);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/user-edit', updateUser);
router.get('/user-profile', getFullUserDetails);


export default router;
