// Node 24 has native fetch — no import needed

// Login
const loginRes = await fetch("http://localhost:5001/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "lacduongldg212@gmail.com", password: "Abc@12345" })
});
const cookie = loginRes.headers.get("set-cookie").split(";")[0];

// Clear cart
await fetch("http://localhost:5001/api/cart", { method: "DELETE", headers: { Cookie: cookie } });

// Add to cart
await fetch("http://localhost:5001/api/cart/items", {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ courseId: "695148e1b08e6cc6cab50062" })
});

// Create order
const orderRes = await fetch("http://localhost:5001/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ selectedCourseIds: ["695148e1b08e6cc6cab50062"], paymentMethod: "vnpay" })
});
const order = await orderRes.json();
const orderId = order.result?.orderId;
console.log("OrderId:", orderId);

// Create payment URL
const payRes = await fetch("http://localhost:5001/api/payments", {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookie },
  body: JSON.stringify({ orderId, paymentMethod: "vnpay" })
});
const pay = await payRes.json();
console.log("PayURL:", pay.result?.payUrl);
