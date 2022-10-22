import express from 'express';
const router = express.Router();

//importing controllers
import {
   registerUser,
   loginUser,
   logoutUser,
   verifyUserEmail,
   refreshToken,
   forgotPassword,
   resetPassword,
   verifyResetToken,
   requestVerification,
} from '../controllers/authControllers';

import { isResetTokenValid } from '../middlewares/resetTokenValidator';

//auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgotpassword', forgotPassword);
router.post('/reset-password', isResetTokenValid, resetPassword);
router.post('/verify-email', verifyUserEmail);
router.get('/auth-refresh', refreshToken);
router.get('/reset-link-verification', isResetTokenValid, verifyResetToken);
router.post('/resend-verification', requestVerification);

export default router;
