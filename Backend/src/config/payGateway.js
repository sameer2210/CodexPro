import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || 'dummy_key',
  key_secret: process.env.RAZORPAY_SECRET || 'dummy_secret',
});

export default razorpay;