import Razorpay from 'razorpay';
import crypto from 'crypto';

// Instantiated lazily to avoid issues in edge runtimes
let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpayInstance;
}

export async function createRazorpayOrder(
  amountInRupees: number,
  orderNumber: string
): Promise<{ razorpay_order_id: string; amount: number; currency: string }> {
  const rp = getRazorpay();
  const order = await rp.orders.create({
    amount: Math.round(amountInRupees * 100), // paise
    currency: 'INR',
    receipt: orderNumber,
    notes: { order_number: orderNumber },
  });
  return {
    razorpay_order_id: order.id,
    amount: amountInRupees,
    currency: 'INR',
  };
}

export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('RAZORPAY_KEY_SECRET is missing during signature verification');
    return false;
  }

  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
    
  return expectedSignature === signature;
}
