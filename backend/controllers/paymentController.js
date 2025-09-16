import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';

class PaymentController {
  // Tạo link thanh toán VNPay (dạng cash)
  static async createPayment(req, res) {
    try {
      const { amount, orderId, orderInfo } = req.body;

      // Cấu hình VNPay
      const vnp = new VNPay({
        tmnCode: process.env.VNP_TMN_CODE, // Mã website của bạn
        secretKey: process.env.VNP_HASH_SECRET, // Key bí mật
        returnUrl: process.env.VNP_RETURN_URL, // URL VNPay redirect sau thanh toán
        locale: VnpLocale.VI,
        currency: 'VND',
      });

      // Tạo payment URL
      const paymentUrl = vnp.createPaymentUrl({
        amount: parseInt(amount) * 100, // VNPay nhận số tiền * 100
        orderId,
        orderInfo,
        command: ProductCode.PAYMENT, // Mặc định PAYMENT
        txnRef: orderId,
        createDate: dateFormat(new Date(), 'yyyyMMddHHmmss'),
      });

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
        secretKey: process.env.VNP_HASH_SECRET,
      });

      const isValid = vnp.validateReturn(req.query);

      if (isValid) {
        // Thanh toán thành công
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
