import express from 'express';
import {
  createPayment,
  handleMomoIpn,
  handleMomoReturn,
  handleVnpayIpn,
  handleVnpayReturn,
} from '../controllers/paymentController.js';
import userAuth from '../middlewares/userAuth.js';

const router = express.Router();

router.post('/create', userAuth, createPayment);

// Thêm cả các route IPN và Return
router.post('/momo_ipn', handleMomoIpn);
router.get('/momo_return', handleMomoReturn);
router.get('/vnpay_ipn', handleVnpayIpn);
router.get('/vnpay_return', handleVnpayReturn);

export default router;
