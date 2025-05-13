import express from 'express';
import { sendOtp, verifyOtp, adminLogin } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/send-otp', sendOtp);
userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/admin', adminLogin);

export default userRouter;