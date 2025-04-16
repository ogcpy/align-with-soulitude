import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";

export default function Contact() {
  // Replace this with your actual WhatsApp number
  const whatsappNumber = "+1234567890";
  const whatsappMessage = encodeURIComponent("Hello, I'd like to learn more about Align with Soulitude services.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-24 bg-[#F1F1F1] bg-opacity-50">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-medium mb-6 text-neutral-800">
            Connect <span className="text-[#EAB69B]">With Us</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto leading-relaxed font-['Raleway']">
            Have questions about our services or want to learn more about your spiritual journey? 
            Reach out to us directly through WhatsApp for the quickest response.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-center justify-center">
          <div className="w-full md:w-1/2">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-white p-4 rounded-full mr-5 shadow-sm">
                  <MessageCircle className="h-8 w-8 text-[#EAB69B]" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800 text-xl mb-2 font-['Raleway']">WhatsApp Us</h3>
                  <p className="text-neutral-600 font-['Raleway'] mb-4">
                    Our preferred method of contact. Get quick responses and personal guidance.
                  </p>
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button 
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-6 rounded-md transition-all font-medium font-['Raleway'] flex items-center gap-2"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white p-4 rounded-full mr-5 shadow-sm">
                  <Mail className="h-8 w-8 text-[#EAB69B]" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800 text-xl mb-2 font-['Raleway']">Email Support</h3>
                  <p className="text-neutral-600 font-['Raleway'] mb-1">For payment or signup assistance only:</p>
                  <p className="text-neutral-700 font-['Raleway'] font-medium">support@alignwithsoulitude.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-['Playfair_Display'] font-medium mb-6 text-neutral-800 text-center">Why Connect on WhatsApp?</h3>

              <div className="space-y-6">
                <div className="border-b border-neutral-100 pb-4">
                  <h4 className="font-medium text-[#EAB69B] mb-2 font-['Raleway']">Instant Responses</h4>
                  <p className="text-neutral-600 font-['Raleway']">
                    Get answers to your questions right away, without waiting for emails.
                  </p>
                </div>

                <div className="border-b border-neutral-100 pb-4">
                  <h4 className="font-medium text-[#EAB69B] mb-2 font-['Raleway']">Personal Connection</h4>
                  <p className="text-neutral-600 font-['Raleway']">
                    Chat directly with our spiritual guides for a more personal experience.
                  </p>
                </div>

                <div className="border-b border-neutral-100 pb-4">
                  <h4 className="font-medium text-[#EAB69B] mb-2 font-['Raleway']">Easy Scheduling</h4>
                  <p className="text-neutral-600 font-['Raleway']">
                    Book sessions and consultations with ease through direct messaging.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-[#EAB69B] mb-2 font-['Raleway']">Share Multimedia</h4>
                  <p className="text-neutral-600 font-['Raleway']">
                    Share images and voice messages to better express your needs.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button 
                    className="bg-[#EAB69B] text-white px-8 py-6 rounded-md hover:bg-[#D49B80] transition-all font-medium font-['Raleway']"
                  >
                    Start Your Journey Today
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}