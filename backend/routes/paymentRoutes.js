import express from 'express';
import PaymentController from '../controllers/paymentController.js';

const router = express.Router();

// Tạo link thanh toán
router.post('/create', PaymentController.createPayment);

// VNPay callback
router.get('/return', PaymentController.paymentReturn);

export default router;
