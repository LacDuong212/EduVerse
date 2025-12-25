import mongoose from 'mongoose';
import Order from "../models/orderModel.js";
import * as PaymentHelper from "../helpers/paymentHelper.js";

const clientUrl = process.env.CLIENT_URL;

export const createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== userId.toString()) return res.status(403).json({ message: 'Access denied' });
    if (order.status !== 'pending') return res.status(400).json({ message: `Order is already ${order.status}` });

    if (order.expiresAt && order.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Order has expired' });
    }

    const amount = order.totalAmount;
    const orderInfo = `Payment for order ${orderId}`;
    const orderIdString = order._id.toString();

    let responseData = {};

    if (paymentMethod === 'momo') {
      const requestId = `${orderIdString}-${Date.now()}`;
      const momoRes = await PaymentHelper.createMomoRequest(orderIdString, amount, orderInfo, requestId);
      responseData = { payUrl: momoRes.payUrl, deeplink: momoRes.deepLink, paymentMethod: 'momo' };
    } 
    else if (paymentMethod === 'vnpay') {
      const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const vnpUrl = PaymentHelper.createVnpayUrl(ipAddr, amount, orderIdString, orderInfo);
      responseData = { payUrl: vnpUrl, paymentMethod: 'vnpay' };
    } 
    else {
      return res.status(400).json({ message: 'Payment method not supported' });
    }

    return res.status(200).json(responseData);

  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const handleMomoIpn = async (req, res) => {
  try {
    const { isValid, amount, resultCode } = PaymentHelper.verifyMomoSignature(req.body);
    if (!isValid) return res.status(400).json({ message: "Invalid signature" });

    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.totalAmount !== amount) return res.status(400).json({ message: "Invalid amount" });

    if (resultCode === 0) {
      await PaymentHelper.activateCoursesForOrder(order);
    } else {
      if (order.status === 'pending') {
        order.status = 'cancelled';
        order.expiresAt = undefined;
        await order.save();
      }
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleMomoReturn = async (req, res) => {
  try {
    const { isValid, resultCode } = PaymentHelper.verifyMomoSignature(req.query);
    const orderId = req.query.orderId;
    const success = isValid && resultCode === 0;

    if (isValid) {
      const order = await Order.findById(orderId);
      if (order) {
        if (success) {
          await PaymentHelper.activateCoursesForOrder(order);
        } else if (order.status === 'pending') {
          order.status = 'cancelled';
          order.expiresAt = undefined;
          await order.save();
        }
      }
    }

    const redirectUrl = success 
      ? `${clientUrl}/student/payment-success?orderId=${orderId}&code=${resultCode}&gateway=momo`
      : `${clientUrl}/student/payment-failed?orderId=${orderId}&code=${resultCode}&gateway=momo`;
    
    return res.redirect(redirectUrl);
  } catch (error) {
    return res.redirect(`${clientUrl}/student/payment-failed?code=99&gateway=momo`);
  }
};

export const handleVnpayIpn = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const isValid = PaymentHelper.verifyVnpaySecureHash(vnp_Params);
    if (!isValid) return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });

    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const amount = Number(vnp_Params['vnp_Amount']) / 100;

    const order = await Order.findById(orderId);
    if (!order) return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    if (order.totalAmount !== amount) return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });

    if (rspCode === '00') {
      await PaymentHelper.activateCoursesForOrder(order);
    } else {
      if (order.status === 'pending') {
        order.status = 'cancelled';
        order.expiresAt = undefined;
        await order.save();
      }
    }

    return res.status(200).json({ RspCode: '00', Message: 'Success' });
  } catch (error) {
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

export const handleVnpayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const isValid = PaymentHelper.verifyVnpaySecureHash(vnp_Params);
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const success = isValid && rspCode === '00';

    if (isValid) {
      const order = await Order.findById(orderId);
      if (order) {
        if (success) {
          await PaymentHelper.activateCoursesForOrder(order);
        } else if (order.status === 'pending') {
          order.status = 'cancelled';
          order.expiresAt = undefined;
          await order.save();
        }
      }
    }

    const redirectUrl = success 
      ? `${clientUrl}/student/payment-success?orderId=${orderId}&code=${rspCode}&gateway=vnpay`
      : `${clientUrl}/student/payment-failed?orderId=${orderId}&code=${rspCode}&gateway=vnpay`;

    return res.redirect(redirectUrl);
  } catch (error) {
    return res.redirect(`${clientUrl}/student/payment-failed?code=99&gateway=vnpay`);
  }
};