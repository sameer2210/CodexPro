import express from 'express';
import { createOrder, verifyOrder } from '../controllers/paymentController.js';
import { userMiddleware } from '../middlewares/userMiddleware.js';

const payRoute = express.Router();

payRoute.post('/create-order', userMiddleware, createOrder);
payRoute.post('/verify', userMiddleware, verifyOrder);

export default payRoute;