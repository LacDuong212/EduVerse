
export const paymentLabel = (method) => {
  if (method === "momo") return "MoMo";
  if (method === "vnpay") return "VNPAY";
  if (method === "free") return "Free";
  return method || "N/A";
};

export const statusLabel = (status) => {
  if (status === "pending") return "Pending";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  if (status === "refunded") return "Refunded";
  return status || "N/A";
};

export const statusVariant = (status) => {
  if (status === "completed") return "success";
  if (status === "pending") return "warning";
  if (status === "cancelled") return "secondary";
  if (status === "refunded") return "info";
  return "dark";
};
