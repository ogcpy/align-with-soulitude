
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <a 
        href="/"
        className="inline-flex items-center text-[#EAB69B] hover:text-opacity-80 mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </a>
      <h1 className="text-3xl font-['Playfair_Display'] font-medium mb-8">Terms of Service</h1>
      
      <div className="prose max-w-none space-y-6 text-neutral-700 font-['Raleway']">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-medium mt-8 mb-4">1. Agreement to Terms</h2>
        <p>By accessing our website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

        <h2 className="text-2xl font-medium mt-8 mb-4">2. Services</h2>
        <p>We provide spiritual wellness and consulting services. Our services are not a substitute for professional medical advice, diagnosis, or treatment.</p>

        <h2 className="text-2xl font-medium mt-8 mb-4">3. Booking and Cancellation</h2>
        <p>Appointments must be cancelled at least 24 hours in advance. Late cancellations may be subject to a cancellation fee.</p>

        <h2 className="text-2xl font-medium mt-8 mb-4">4. Payment Terms</h2>
        <p>Payment is required at the time of booking. We accept major credit cards and process payments securely through our payment processors.</p>

        <h2 className="text-2xl font-medium mt-8 mb-4">5. Intellectual Property</h2>
        <p>All content on this website is the property of Align with Soulitude and is protected by copyright laws.</p>

        <h2 className="text-2xl font-medium mt-8 mb-4">6. Limitation of Liability</h2>
        <p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>

        <h2 className="text-2xl font-medium mt-8 mb-4">7. Governing Law</h2>
        <p>These terms shall be governed by and construed in accordance with the laws of the United Kingdom.</p>
      </div>
    </div>
  );
}
