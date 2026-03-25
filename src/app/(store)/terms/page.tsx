export const metadata = {
  title: 'Terms & Conditions | Waffle House',
};

export default function TermsPage() {
  return (
    <div className="bg-[#FDF6EC] min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[#F5E6CC] animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#3B1F0A] mb-8">Terms of Service</h1>
        
        <div className="prose prose-stone max-w-none text-[#5A3F2A]">
          <p className="lead text-lg">
            Welcome to Waffle House. By using our website and placing orders, you agree to these Terms and Conditions.
          </p>
          
          <h2 className="text-[#3B1F0A]">1. Store Operations</h2>
          <p>
            Our core delivery hours are 10:00 AM to 11:00 PM. Orders placed outside this window will not be processed. Delivery zones are strictly limited by PIN code serviceability as defined in our checkout system.
          </p>

          <h2 className="text-[#3B1F0A]">2. Product Depiction & Allergen Warning</h2>
          <p>
            Menu images are for illustrative purposes. We strive to maintain uniformity, but artisanal baking creates natural variations. 
            <strong>Allergen Warning:</strong> Our kitchen handles dairy, gluten, nuts, and soy. We cannot guarantee a completely allergen-free environment.
          </p>

          <h2 className="text-[#3B1F0A]">3. Pricing and Taxes</h2>
          <p>
            Prices displayed on the menu are subject to change without prior notice. Final order totals during checkout include all applicable GST and delivery fees.
          </p>

          <h2 className="text-[#3B1F0A]">4. Delivery Logistics</h2>
          <p>
            Estimated delivery times are indicative. We are not liable for delays caused by extreme weather, traffic congestion, or incorrect address details provided by the user.
          </p>
          
          <h2 className="text-[#3B1F0A]">5. Intellectual Property</h2>
          <p>
            All content on this website, including logos, images, and text, is the property of Waffle House and protected by copyright laws.
          </p>

          <h2 className="text-[#3B1F0A]">6. Contact</h2>
          <p>
            For legal inquiries, contact us at <a href="mailto:legal@wafflehouse.in" className="text-[#C17839] hover:underline">legal@wafflehouse.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
