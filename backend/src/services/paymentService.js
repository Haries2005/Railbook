// Fake payment service (can integrate Razorpay/Stripe)
exports.processPayment = async (amount, method, userId) => {
  console.log(`Processing ${amount} payment via ${method} for user ${userId}`);
  return { success: true, transactionId: "TXN" + Date.now() };
};
