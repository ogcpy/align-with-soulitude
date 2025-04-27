
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl relative">
      <a 
        href="/"
        className="absolute right-4 top-4 text-neutral-400 hover:text-[#EAB69B] transition-all"
      >
        <X className="h-6 w-6" />
      </a>
      
      <h1 className="text-3xl font-['Playfair_Display'] font-medium mb-8">Cookie Policy</h1>
      
      <div className="prose max-w-none space-y-6 text-neutral-700 font-['Raleway']">
        <h2 className="text-2xl font-medium mt-8 mb-4">1. What Are Cookies</h2>
        <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience and allow certain features to work.</p>

        <h2 className="text-2xl font-medium mt-8 mb-4">2. Types of Cookies We Use</h2>
        <ul className="list-disc pl-6 mt-2">
          <li>Essential cookies: Required for the website to function properly</li>
          <li>Functional cookies: Remember your preferences</li>
          <li>Analytics cookies: Help us understand how visitors use our site</li>
          <li>Marketing cookies: Used to deliver relevant advertisements</li>
        </ul>

        <h2 className="text-2xl font-medium mt-8 mb-4">3. Managing Cookies</h2>
        <p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.</p>

        <h2 className="text-2xl font-medium mt-8 mb-4">4. Your Choices</h2>
        <p>When you first visit our website, you will be presented with a cookie banner allowing you to accept or decline non-essential cookies.</p>

        <h2 className="text-2xl font-medium mt-8 mb-4">5. Contact Us</h2>
        <p>If you have any questions about our use of cookies, please contact us at privacy@alignwithsoulitude.com</p>
      </div>
    </div>
  );
}
