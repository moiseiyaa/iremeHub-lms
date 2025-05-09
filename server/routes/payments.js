const express = require('express');
const { 
  createCheckoutSession, 
  createPaymentIntent,
  stripeWebhook, 
  getPaymentHistory, 
  verifyPayment 
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes - Webhook must be before express.json() middleware
router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhook);

// Protected routes
router.use(protect);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-payment-intent', createPaymentIntent);
router.get('/history', getPaymentHistory);
router.get('/verify/:courseId', verifyPayment);

module.exports = router;
