export const metadata = {
  title: 'Refund & Cancellation Policy | Waffle House',
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#FDF6EC] min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[#F5E6CC] animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#3B1F0A] mb-8">Refund & Cancellation</h1>
        
        <div className="prose prose-stone max-w-none text-[#5A3F2A]">
          <p className="lead text-lg">
            Because our waffles are baked fresh to order, our cancellation and refund policies are necessarily strict to prevent food waste.
          </p>
          
          <h2 className="text-[#3B1F0A]">1. Order Cancellations</h2>
          <p>
            You may cancel your order for a full refund <strong>only if the kitchen has not yet started preparing it</strong> (Status: Pending or Confirmed). Once the status shifts to "Preparing", cancellations are no longer permitted via the app.
          </p>
          <p>
            To request an emergency cancellation after preparation has begun, please contact our store directly via the WhatsApp Support button. Approval is at the sole discretion of the store manager.
          </p>

          <h2 className="text-[#3B1F0A]">2. Refunds for Failed Deliveries</h2>
          <p>
            Refunds are generally processed within 5-7 business days for:
          </p>
          <ul>
            <li>Items missing from an order</li>
            <li>Incorrect items delivered</li>
            <li>Severe delays (exceeding 90 minutes) solely due to our logistics</li>
          </ul>

          <h2 className="text-[#3B1F0A]">3. Store-Initiated Cancellations</h2>
          <p>
            In rare events of ingredient shortages or unexpected store closures, we reserve the right to cancel your order. You will be notified immediately and a full refund will be automatically triggered to your original payment method.
          </p>

          <h2 className="text-[#3B1F0A]">4. Payment Gateway Failures</h2>
          <p>
            If funds are deducted from your account but the order shows as "Failed" on our app, the amount will automatically be reversed by Razorpay within 72 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
