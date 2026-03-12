import crypto from "crypto";
import https from "https";
import { MOMO_IPN_URL, MOMO_REDIRECT_URL } from "#config/payment.config.js";

const {
    MOMO_PARTNER_CODE,
    MOMO_ACCESS_KEY,
    MOMO_SECRET_KEY,
    MOMO_API_ENDPOINT
} = process.env;

export const createPayment = (orderId, amount, orderInfo) => {
    return new Promise((resolve, reject) => {

        const requestId = `${orderId}-${Date.now()}`;
        const requestType = "payWithMethod";
        const extraData = "";

        const rawSignature =
            `accessKey=${MOMO_ACCESS_KEY}` +
            `&amount=${amount}` +
            `&extraData=${extraData}` +
            `&ipnUrl=${MOMO_IPN_URL}` +
            `&orderId=${orderId}` +
            `&orderInfo=${orderInfo}` +
            `&partnerCode=${MOMO_PARTNER_CODE}` +
            `&redirectUrl=${MOMO_REDIRECT_URL}` +
            `&requestId=${requestId}` +
            `&requestType=${requestType}`;

        const signature = crypto
            .createHmac("sha256", MOMO_SECRET_KEY)
            .update(rawSignature)
            .digest("hex");

        const requestBody = JSON.stringify({
            partnerCode: MOMO_PARTNER_CODE,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl: MOMO_REDIRECT_URL,
            ipnUrl: MOMO_IPN_URL,
            requestType,
            extraData,
            signature,
            lang: "en"
        });

        const url = new URL(MOMO_API_ENDPOINT);

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(requestBody)
            }
        };

        const req = https.request(options, res => {

            let data = "";

            res.on("data", chunk => data += chunk);

            res.on("end", () => {
                try {
                    const json = JSON.parse(data);

                    if (json.resultCode === 0) {
                        resolve({
                            payUrl: json.payUrl,
                            deeplink: json.deepLink,
                            paymentMethod: "momo"
                        });
                    } else {
                        reject(new Error(json.message || "MoMo error"));
                    }

                } catch (err) {
                    reject(err);
                }
            });
        });

        req.on("error", reject);
        req.write(requestBody);
        req.end();
    });
};

export const verifySignature = (body) => {

    const {
        partnerCode, orderId, requestId, amount, orderInfo, orderType,
        transId, resultCode, message, payType, responseTime, extraData, signature
    } = body;

    const rawSignature =
        `accessKey=${MOMO_ACCESS_KEY}` +
        `&amount=${amount}` +
        `&extraData=${extraData || ""}` +
        `&message=${message || ""}` +
        `&orderId=${orderId}` +
        `&orderInfo=${orderInfo}` +
        `&orderType=${orderType}` +
        `&partnerCode=${partnerCode}` +
        `&payType=${payType}` +
        `&requestId=${requestId}` +
        `&responseTime=${responseTime}` +
        `&resultCode=${resultCode}` +
        `&transId=${transId}`;

    const calculated = crypto
        .createHmac("sha256", MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest("hex");

    return {
        isValid: calculated === signature,
        amount: Number(amount),
        resultCode: Number(resultCode)
    };
};