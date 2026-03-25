export const metadata = {
  title: 'Privacy Policy | Waffle House',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FDF6EC] min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[#F5E6CC] animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#3B1F0A] mb-8">Privacy Policy</h1>
        
        <div className="prose prose-stone max-w-none text-[#5A3F2A]">
          <p className="lead text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <h2 className="text-[#3B1F0A]">1. Information We Collect</h2>
          <p>
            When you create an account, place an order, or interact with our services, we may collect personal information including:
            Full name, phone number, email address, delivery addresses, and payment history (we do not store actual card details).
          </p>

          <h2 className="text-[#3B1F0A]">2. How We Use Your Information</h2>
          <p>We use your information exclusively to:</p>
          <ul>
            <li>Process and fulfill your waffle orders</li>
            <li>Communicate order status via SMS or email</li>
            <li>Improve our menu and service based on customer feedback</li>
            <li>Prevent fraud and ensure secure transactions via Razorpay</li>
          </ul>

          <h2 className="text-[#3B1F0A]">3. Data Security & Storage</h2>
          <p>
            Your data is securely stored on enterprise-grade servers. We implement stringent Row Level Security (RLS) to ensure your account details are only accessible to you and authorized restaurant managers. Payment processing is handled entirely by Razorpay, a PCI-DSS compliant entity.
          </p>

          <h2 className="text-[#3B1F0A]">4. Third-Party Services</h2>
          <p>
            We may share minimal data with delivery partners strictly for the purpose of fulfilling your order. We do not sell, rent, or trade your personal information to marketing agencies.
          </p>

          <h2 className="text-[#3B1F0A]">5. Contact Us</h2>
          <p>
            If you have questions regarding this privacy policy or wish to delete your account data, please contact us at <a href="mailto:privacy@wafflehouse.in" className="text-[#C17839] hover:underline">privacy@wafflehouse.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
