
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <a 
        href="/"
        className="inline-flex items-center text-[#EAB69B] hover:text-opacity-80 mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </a>
      <h1 className="text-3xl font-['Playfair_Display'] font-medium mb-8">Privacy Policy</h1>
      
      <div className="prose max-w-none space-y-6 text-neutral-700 font-['Raleway']">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-medium mt-8 mb-4">1. Introduction</h2>
        <p>Welcome to Align with Soulitude. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we handle your personal information when you visit our website or use our services.</p>
        
        <h2 className="text-2xl font-medium mt-8 mb-4">2. Data We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Name and contact information</li>
          <li>Booking and appointment details</li>
          <li>Communication preferences</li>
          <li>Payment information (processed securely through our payment processors)</li>
        </ul>

        <h2 className="text-2xl font-medium mt-8 mb-4">3. How We Use Your Data</h2>
        <p>We use your personal data to:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Provide our services</li>
          <li>Process your bookings</li>
          <li>Send you important updates</li>
          <li>Improve our services</li>
        </ul>

        <h2 className="text-2xl font-medium mt-8 mb-4">4. Your Rights</h2>
        <p>Under UK GDPR, you have the right to:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing of your data</li>
          <li>Data portability</li>
        </ul>

        <h2 className="text-2xl font-medium mt-8 mb-4">5. Contact Us</h2>
        <p>For any privacy-related questions or concerns, please contact us at privacy@alignwithsoulitude.com</p>
      </div>
    </div>
  );
}
