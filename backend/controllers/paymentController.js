import mongoose from 'mongoose';
import crypto from 'crypto';
import https from 'https';
import querystring from 'qs';
import moment from 'moment';

import Order from "../models/orderModel.js";

// --- Config chung ---
const frontendUrl = process.env.FRONTEND_URL;

// --- Config MoMo ---
const momo_partnerCode = process.env.MOMO_PARTNER_CODE;
const momo_accessKey = process.env.MOMO_ACCESS_KEY;
const momo_secretKey = process.env.MOMO_SECRET_KEY;
const momo_apiEndpoint = process.env.MOMO_API_ENDPOINT;
const momo_redirectUrl = process.env.MOMO_REDIRECT_URL;
const momo_ipnUrl = process.env.MOMO_IPN_URL;

// --- Config VNPAY ---
const vnp_TmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_HASHSECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURNURL;

/**
 * Sắp xếp các thuộc tính của object theo alphabet
 */
const sortObject = (obj) => {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
};

/**
 * Tạo yêu cầu thanh toán MoMo
 */
const createMomoPaymentRequest = (orderId, amount, orderInfo, requestId, extraData) => {
    return new Promise((resolve, reject) => {
        const requestType = "payWithMethod";
        const lang = 'vi';
        const rawSignature = `accessKey=${momo_accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${momo_ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momo_partnerCode}&redirectUrl=${momo_redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', momo_secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = JSON.stringify({
            partnerCode: momo_partnerCode,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: momo_redirectUrl,
            ipnUrl: momo_ipnUrl,
            lang: lang,
            requestType: requestType,
            extraData: extraData,
            signature: signature,
        });

        const options = {
            hostname: new URL(momo_apiEndpoint).hostname,
            port: 443,
            path: new URL(momo_apiEndpoint).pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        const req = https.request(options, res => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const responseData = JSON.parse(body);
                    if (responseData.resultCode === 0) {
                        resolve(responseData);
                    } else {
                        console.error("MoMo API Error:", responseData);
                        reject(new Error(responseData.message || `MoMo Error Code: ${responseData.resultCode}`));
                    }
                } catch (parseError) {
                    console.error("Error parsing MoMo response:", body);
                    reject(new Error("Không thể phân tích phản hồi từ MoMo."));
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Problem with MoMo request: ${e.message}`);
            reject(new Error(`Lỗi khi gọi MoMo API: ${e.message}`));
        });

        req.write(requestBody);
        req.end();
    });
};

/**
 * Xử lý MoMo IPN
 */
const processMomoIpn = async (body) => {
    const {
        partnerCode: resPartnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature: receivedSignature
    } = body;

    const rawSignature = `accessKey=${momo_accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${resPartnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const calculatedSignature = crypto.createHmac('sha256', momo_secretKey)
        .update(rawSignature)
        .digest('hex');

    if (calculatedSignature !== receivedSignature) {
        console.error("MoMo IPN - Invalid Signature");
        return { resultCode: 99, message: "Invalid signature" };
    }

    if (resPartnerCode !== momo_partnerCode) {
        console.error("MoMo IPN - Invalid PartnerCode");
        return { resultCode: 99, message: "Invalid partner code" };
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            console.warn(`MoMo IPN - Order not found: ${orderId}`);
            return { resultCode: 1, message: "Order not found" };
        }

        if (order.totalAmount !== amount) {
            console.warn(`MoMo IPN - Amount invalid for order ${orderId}: Expected ${order.totalAmount}, Got ${amount}`);
            return { resultCode: 99, message: "Invalid amount" };
        }

        if (order.status !== 'pending') {
            console.log(`MoMo IPN - Order ${orderId} already processed. Status: ${order.status}`);
            return { resultCode: 0, message: "Order already confirmed" };
        }

        if (resultCode === 0) {
            order.status = 'completed';
            order.expiresAt = undefined;
            await order.save();

            console.log(`MoMo IPN - Order ${orderId} confirmed successfully.`);
        } else {
            console.log(`MoMo IPN - Order ${orderId} failed. ResultCode: ${resultCode}, Message: ${message}`);
            order.status = 'cancelled';
            order.expiresAt = undefined;
            await order.save();
        }
        return { resultCode: 0, message: "Success" };
    } catch (error) {
        console.error(`MoMo IPN - Error processing order ${orderId}:`, error);
        return { resultCode: 99, message: "System error" };
    }
};

/**
 * Xác thực MoMo Redirect URL
 */
const verifyMomoReturnUrl = (queryParams) => {
    const {
        partnerCode: resPartnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature: receivedSignature
    } = queryParams;

    const rawSignature = `accessKey=${momo_accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${resPartnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const calculatedSignature = crypto.createHmac('sha256', momo_secretKey)
        .update(rawSignature)
        .digest('hex');

    const isValid = calculatedSignature === receivedSignature;
    if (!isValid) {
        console.warn("MoMo Return URL - Invalid Signature");
    }
    return { isValid, params: queryParams };
};

/**
 * Tạo URL thanh toán VNPAY
 */
const createVnpayPaymentUrl = (ipAddr, amount, orderId, orderInfo) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let createDate = moment(new Date()).format('YYYYMMDDHHmmss');
    let vnp_Params = {};

    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Amount'] = Math.round(amount * 100);
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_Locale'] = 'vn';

    vnp_Params = sortObject(vnp_Params);
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    return vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });
};

/**
 * Xử lý VNPAY IPN
 */
const processVnpayIpn = async (vnp_Params) => {
    let secureHash = vnp_Params['vnp_SecureHash'];
    const paramsCopy = { ...vnp_Params };
    delete paramsCopy['vnp_SecureHash'];
    delete paramsCopy['vnp_SecureHashType'];

    const sorted_params = sortObject(paramsCopy);
    let signData = querystring.stringify(sorted_params, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        const orderId = vnp_Params['vnp_TxnRef'];
        const amount = Number(vnp_Params['vnp_Amount']) / 100;
        const rspCode = vnp_Params['vnp_ResponseCode'];

        try {
            const order = await Order.findById(orderId);
            if (!order) {
                return { RspCode: '01', Message: 'Order not found' };
            }
            if (order.totalAmount !== amount) {
                return { RspCode: '04', Message: 'Amount invalid' };
            }
            if (order.status !== 'pending') {
                return { RspCode: '02', Message: 'Order already confirmed' };
            }

            if (rspCode === '00') {
                order.status = 'completed';
                order.expiresAt = undefined;
                await order.save();

            } else {
                order.status = 'cancelled';
                order.expiresAt = undefined;
                await order.save();
            }
            return { RspCode: '00', Message: 'Success' };
        } catch (error) {
            console.error("Lỗi khi xử lý VNPAY IPN:", error);
            return { RspCode: '99', Message: 'Unknown error' };
        }
    } else {
        return { RspCode: '97', Message: 'Checksum failed' };
    }
};

/**
 * Xử lý VNPAY Redirect URL
 */
const processVnpayReturnUrl = (vnp_Params) => {
    let secureHash = vnp_Params['vnp_SecureHash'];
    const paramsCopy = { ...vnp_Params };
    delete paramsCopy['vnp_SecureHash'];
    delete paramsCopy['vnp_SecureHashType'];

    const sortedParams = sortObject(paramsCopy);
    let signData = querystring.stringify(sortedParams, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    return { isValid: secureHash === signed, params: vnp_Params };
};


// --- Các hàm Route Handler (controllers) ---

/**
 * @desc  Tạo link thanh toán cho một đơn hàng (đã "pending")
 * @route  POST /api/payments/create
 * @access Private
 */
export const createPayment = async (req, res) => {
    try {
        const { orderId, paymentMethod } = req.body;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
        }

        const order = await Order.findById(orderId);

        // 1. Xác thực đơn hàng
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        if (order.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Không có quyền thanh toán đơn hàng này' });
        }
        if (order.status !== 'pending') {
            return res.status(400).json({ message: `Đơn hàng đã ở trạng thái ${order.status}` });
        }
        if (order.expiresAt && order.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Đơn hàng đã hết hạn' });
        }

        const amount = order.totalAmount;
        const orderInfo = `Thanh toan don hang ${orderId}`;
        const orderIdString = order._id.toString();

        let responseData = {};

        // 2. Tạo URL thanh toán dựa trên phương thức
        if (paymentMethod === 'momo') {
            const requestId = `${orderIdString}-${Date.now()}`;
            const extraData = ""; // Base64 encoded string (nếu cần)

            // Gọi hàm helper
            const momoResponse = await createMomoPaymentRequest(
                orderIdString,
                amount,
                orderInfo,
                requestId,
                extraData
            );

            responseData = {
                payUrl: momoResponse.payUrl,
                deeplink: momoResponse.deepLink,
                paymentMethod: 'momo',
            };
        } else if (paymentMethod === 'vnpay') {
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection?.remoteAddress ||
                req.socket?.remoteAddress ||
                req.connection?.socket?.remoteAddress ||
                '127.0.0.1';

            // Gọi hàm helper
            const vnpayUrl = createVnpayPaymentUrl(
                ipAddr,
                amount,
                orderIdString,
                orderInfo
            );

            responseData = {
                payUrl: vnpayUrl,
                paymentMethod: 'vnpay',
            };
        } else {
            return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
        }

        // 3. Trả về URL cho client
        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Lỗi khi tạo thanh toán:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

/**
 * @desc  Xử lý MoMo IPN
 * @route  POST /api/payments/momo_ipn
 * @access Public
 */
export const handleMomoIpn = async (req, res) => {
    try {
        const result = await processMomoIpn(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Lỗi xử lý MoMo IPN:', error);
        return res.status(500).json({ resultCode: 99, message: 'Internal Server Error' });
    }
};

/**
 * @desc  Xử lý MoMo Redirect URL
 * @route  GET /api/payments/momo_return
 * @access Public
 */
export const handleMomoReturn = async (req, res) => { // 1. Thêm async
    try {
        const { isValid, params } = verifyMomoReturnUrl(req.query);

        const orderId = params.orderId;
        const resultCode = params.resultCode;
        const amount = Number(params.amount);
        const success = isValid && (resultCode === 0 || resultCode === '0');

        // 2. Thêm logic cập nhật DB
        if (isValid) {
            try {
                const order = await Order.findById(orderId);
                if (order && order.status === 'pending') {
                    if (order.totalAmount !== amount) {
                        console.warn(`[MOMO Return] Cảnh báo: Sai số tiền cho đơn ${orderId}. DB: ${order.totalAmount}, MOMO: ${amount}`);
                        // Vẫn coi là thất bại nếu sai số tiền
                        order.status = 'cancelled';
                        await order.save();
                    } else if (success) {
                        order.status = 'completed';
                        order.expiresAt = undefined;
                        await order.save();
                        console.log(`[MOMO Return] Cập nhật đơn hàng ${orderId} -> completed`);
                    } else {
                        order.status = 'cancelled';
                        order.expiresAt = undefined;
                        await order.save();
                        console.log(`[MOMO Return] Cập nhật đơn hàng ${orderId} -> cancelled (do code ${resultCode})`);
                    }
                } else if (order) {
                    console.log(`[MOMO Return] Đơn hàng ${orderId} đã được xử lý (trạng thái: ${order.status})`);
                }
            } catch (dbError) {
                console.error("[MOMO Return] Lỗi khi cập nhật database:", dbError);
            }
        } else {
            console.warn(`[MOMO Return] Chữ ký không hợp lệ cho đơn hàng ${orderId}. Bỏ qua cập nhật DB.`);
        }

        // 3. Redirect về frontend
        // const redirectUrl = `${frontendUrl}/payment-result?orderId=${orderId}&success=${success}&code=${resultCode}&gateway=momo`;
        let redirectUrl;
        if (success) {
            redirectUrl = `${frontendUrl}/student/payment-success?orderId=${orderId}&code=${resultCode}&gateway=momo`;
        } else {
            redirectUrl = `${frontendUrl}/student/payment-failed?orderId=${orderId}&code=${resultCode}&gateway=momo`;
        }
        return res.redirect(redirectUrl);

    } catch (error) {
        console.error('Lỗi xử lý MoMo Return:', error);
        return res.redirect(`${frontendUrl}/student/payment-failed?code=99&gateway=momo`);
    }
};

/**
 * @desc  Xử lý VNPAY IPN
 * @route  GET /api/payments/vnpay_ipn
 * @access Public
 */
export const handleVnpayIpn = async (req, res) => {
    console.log('--- VNPAY IPN ĐÃ ĐƯỢC GỌI ---');
    console.log('IPN Params:', req.query);
    try {
        const result = await processVnpayIpn(req.query);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Lỗi xử lý VNPAY IPN:', error);
        return res.status(500).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

/**
 * @desc  Xử lý VNPAY Redirect URL
 * @route  GET /api/payments/vnpay_return
 * @access Public
 */
export const handleVnpayReturn = async (req, res) => {
    try {
        const { isValid, params } = processVnpayReturnUrl(req.query);

        const orderId = params.vnp_TxnRef;
        const vnp_ResponseCode = params.vnp_ResponseCode;
        const amount = Number(params.vnp_Amount) / 100;
        const success = isValid && vnp_ResponseCode === '00';

        if (isValid) {
            try {
                const order = await Order.findById(orderId);
                if (order && order.status === 'pending') {

                    if (order.totalAmount !== amount) {
                        console.warn(`[VNPAY Return] Cảnh báo: Sai số tiền cho đơn ${orderId}. DB: ${order.totalAmount}, VNPAY: ${amount}`);
                        order.status = 'cancelled';
                        await order.save();
                    } else if (vnp_ResponseCode === '00') {
                        order.status = 'completed';
                        order.expiresAt = undefined;
                        await order.save();
                        console.log(`[VNPAY Return] Cap nhat don hang ${orderId} -> completed`);
                    } else {
                        order.status = 'cancelled';
                        order.expiresAt = undefined;
                        await order.save();
                        console.log(`[VNPAY Return] Cap nhat don hang ${orderId} -> cancelled (do code ${vnp_ResponseCode})`);
                    }
                } else if (order) {
                    console.log(`[VNPAY Return] Đơn hàng ${orderId} đã được xử lý (trạng thái: ${order.status})`);
                }
            } catch (dbError) {
                console.error("[VNPAY Return] Lỗi cap nhat DB tu Return URL:", dbError);
            }
        } else {
            console.warn(`[VNPAY Return] Chữ ký không hợp lệ cho đơn hàng ${orderId}. Bỏ qua cập nhật DB.`);
        }

        // const redirectUrl = `${frontendUrl}/payment-result?orderId=${orderId}&success=${success}&code=${vnp_ResponseCode}&gateway=vnpay`;
        let redirectUrl;
        if (success) {
            redirectUrl = `${frontendUrl}/student/payment-success?orderId=${orderId}&code=${vnp_ResponseCode}&gateway=vnpay`;
        } else {
            redirectUrl = `${frontendUrl}/student/payment-failed?orderId=${orderId}&code=${vnp_ResponseCode}&gateway=vnpay`;
        }
        return res.redirect(redirectUrl);

    } catch (error) {
        console.error('Lỗi xử lý VNPAY Return:', error);
        return res.redirect(`${frontendUrl}/student/payment-failed?code=99&gateway=vnpay`);
    }
};
