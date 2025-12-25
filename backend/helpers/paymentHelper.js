import crypto from 'crypto';
import https from 'https';
import querystring from 'qs';
import moment from 'moment';
import mongoose from 'mongoose';
import Course from "../models/courseModel.js";


const momo_partnerCode = process.env.MOMO_PARTNER_CODE;
const momo_accessKey = process.env.MOMO_ACCESS_KEY;
const momo_secretKey = process.env.MOMO_SECRET_KEY;
const momo_apiEndpoint = process.env.MOMO_API_ENDPOINT;
const momo_redirectUrl = process.env.MOMO_REDIRECT_URL;
const momo_ipnUrl = process.env.MOMO_IPN_URL;

const vnp_TmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_HASHSECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURNURL;

export const activateCoursesForOrder = async (order) => {
  try {
    if (!order || order.status !== 'pending') {
      return false;
    }

    order.status = 'completed';
    order.expiresAt = undefined;
    await order.save();

    const courseCounts = (order.courses || []).reduce((acc, item) => {
      const courseId = item.course && item.course._id 
        ? item.course._id.toString() 
        : item.course.toString();
      
      acc[courseId] = (acc[courseId] || 0) + 1;
      return acc;
    }, {});

    const bulkOps = Object.entries(courseCounts).map(([courseId, count]) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(courseId) },
        update: { $inc: { studentsEnrolled: count } }
      }
    }));

    if (bulkOps.length > 0) {
      await Course.bulkWrite(bulkOps);
    }

    return true;
  } catch (error) {
    return false;
  }
};

const sortObject = (obj) => {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) str.push(encodeURIComponent(key));
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
};

export const createVnpayUrl = (ipAddr, amount, orderId, orderInfo) => {
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
  vnp_Params['vnp_Locale'] = 'en'; // Changed to English

  vnp_Params = sortObject(vnp_Params);
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", vnp_HashSecret);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;

  return vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });
};

export const verifyVnpaySecureHash = (vnp_Params) => {
  let secureHash = vnp_Params['vnp_SecureHash'];
  let paramsCopy = { ...vnp_Params };
  delete paramsCopy['vnp_SecureHash'];
  delete paramsCopy['vnp_SecureHashType'];

  const sortedParams = sortObject(paramsCopy);
  let signData = querystring.stringify(sortedParams, { encode: false });
  let hmac = crypto.createHmac("sha512", vnp_HashSecret);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

  return secureHash === signed;
};

export const createMomoRequest = (orderId, amount, orderInfo, requestId, extraData = "") => {
  return new Promise((resolve, reject) => {
    const requestType = "payWithMethod";
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
      lang: 'en',
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
        'Content-Length': Buffer.byteLength(requestBody),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.resultCode === 0) resolve(json);
          else reject(new Error(json.message || `MoMo Error: ${json.resultCode}`));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', e => reject(e));
    req.write(requestBody);
    req.end();
  });
};

export const verifyMomoSignature = (body) => {
  const {
    partnerCode, orderId, requestId, amount, orderInfo, orderType,
    transId, resultCode, message, payType, responseTime, extraData, signature
  } = body;

  const rawSignature = `accessKey=${momo_accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
  
  const calculatedSignature = crypto.createHmac('sha256', momo_secretKey)
    .update(rawSignature)
    .digest('hex');

  return {
    isValid: calculatedSignature === signature,
    amount: Number(amount),
    resultCode: Number(resultCode)
  };
};