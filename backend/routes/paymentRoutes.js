import express from 'express';
import { createOrder, verifyPayment } from '../controller/paymentController.js';
import authUser from '../middleware/authUser.js';

const paymentRouter = express.Router();

paymentRouter.post('/create-order', authUser, createOrder);
paymentRouter.post('/verify', authUser, verifyPayment);

export default paymentRouter;
