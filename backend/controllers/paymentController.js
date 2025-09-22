import { VNPay, ignoreLogger } from 'vnpay';

class PaymentController {
  static async createPayment(req, res) {
    try {
      const { amount, orderId, orderInfo } = req.body;

      // Cấu hình VNPay
      const vnpay = new VNPay({
        tmnCode: 'KXLFWPCG',
        secureSecret: 'GK1YZKCZHULE8UCVZDMJ2XJ2M6AKY6U9',
        vnpayHost: 'https://sandbox.vnpayment.vn',

        testMode: true,
        hashAlgorithm: 'SHA512',
        enableLog: true,
        loggerFn: ignoreLogger,
      });

      // Tạo payment URL
      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: parseInt(amount),
        vnp_IpAddr: '127.0.0.1',
        vnp_ReturnUrl: process.env.VNP_RETURN_URL,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
      });

      const bankList = await vnpay.getBankList();
      console.log(bankList);

      res.json({ success: true, paymentUrl });
    } catch (error) {
      console.error('VNPay create payment error:', error);
      res.status(500).json({ success: false, message: 'Tạo link thanh toán thất bại' });
    }
  }

  // Callback VNPay sau khi thanh toán xong
  static async paymentReturn(req, res) {
    try {
      const vnp = new VNPay({
        tmnCode: process.env.VNP_TMN_CODE,
        secureSecret: process.env.VNP_HASH_SECRET,
      });

      const isValid = vnp.verifyReturnUrl(req.query);

      if (isValid) {
        return res.json({ success: true, message: 'Thanh toán thành công', data: req.query });
      } else {
        return res.json({ success: false, message: 'Thanh toán không hợp lệ' });
      }
    } catch (error) {
      console.error('VNPay return error:', error);
      res.status(500).json({ success: false, message: 'Lỗi xử lý callback VNPay' });
    }
  }
}

export default PaymentController;
