import crypto from "crypto";
import qs from "qs";
import moment from "moment";
import { VNP_RETURN_URL } from "#config/payment.config.js";

const {
    VNP_TMNCODE,
    VNP_HASHSECRET,
    VNP_URL
} = process.env;

const sortObject = (obj) => {
    const sorted = {};
    Object.keys(obj)
        .sort()
        .forEach(key => {
            sorted[key] = obj[key];
        });
    return sorted;
};

export const createPayment = (ipAddr, amount, orderId, orderInfo) => {

    const createDate = moment().format("YYYYMMDDHHmmss");

    let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: VNP_TMNCODE,
        vnp_Amount: Math.round(amount * 100),
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: "other",
        vnp_ReturnUrl: VNP_RETURN_URL,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_Locale: "en"
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });

    const signed = crypto
        .createHmac("sha512", VNP_HASHSECRET)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;

    return {
        payUrl: VNP_URL + "?" + qs.stringify(vnp_Params, { encode: false }),
        paymentMethod: "vnpay"
    };
};

export const verifySignature = (query) => {

    const secureHash = query["vnp_SecureHash"];
    const paramsCopy = { ...query };

    delete paramsCopy["vnp_SecureHash"];
    delete paramsCopy["vnp_SecureHashType"];

    const sortedParams = sortObject(paramsCopy);
    const signData = qs.stringify(sortedParams, { encode: false });

    const signed = crypto
        .createHmac("sha512", VNP_HASHSECRET)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");

    return secureHash === signed;
};