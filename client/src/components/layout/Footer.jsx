import { Facebook, Instagram, Twitter, Youtube, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Subscribed!",
      description: "Thank you for subscribing to our newsletter.",
    });

    setEmail("");
  };

  const handleNavClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Header height offset
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-['Playfair_Display'] font-medium mb-4">
              Align with Soulitude
            </h3>
            <p className="text-neutral-400 mb-6 font-['Raleway']">
              Your journey to balance, clarity, and inner peace begins with us.
              We're here to guide you every step of the way.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/@alignwithsoulitude"
                className="text-neutral-400 hover:text-[#EAB69B] transition-all"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/mydharmahealing"
                className="text-neutral-400 hover:text-[#EAB69B] transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.x.com/h4serenity"
                className="text-neutral-400 hover:text-[#EAB69B] transition-all"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@alignwithsoulitude"
                className="text-neutral-400 hover:text-[#EAB69B] transition-all"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4 font-['Raleway']">
              Quick Links
            </h3>
            <ul className="space-y-2 font-['Raleway']">
              <li>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="text-neutral-400 hover:text-[#EAB69B] transition-all"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("about")}
                  className="text-neutral-400 hover:text-[#EAB69B] transition-all"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("services")}
                  className="text-neutral-400 hover:text-[#EAB69B] transition-all"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("testimonials")}
                  className="text-neutral-400 hover:text-[#EAB69B] transition-all"
                >
                  Testimonials
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("contact")}
                  className="text-neutral-400 hover:text-[#EAB69B] transition-all"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4 font-['Raleway']">
              Newsletter
            </h3>
            <p className="text-neutral-400 mb-4 font-['Raleway']">
              Subscribe to our newsletter for mindfulness tips, event updates,
              and special offers.
            </p>
            <form className="flex" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 rounded-l-md w-full outline-none text-neutral-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                className="bg-[#EAB69B] text-white px-4 py-2 rounded-r-md hover:bg-opacity-90 transition-all"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-neutral-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0 font-['Raleway']">
            &copy; {new Date().getFullYear()} Align with Soulitude. All rights
            reserved.
          </p>
          <div className="flex space-x-6 font-['Raleway']">
            <a
              href="/privacy-policy"
              className="text-neutral-400 hover:text-[#EAB69B] transition-all text-sm"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-of-service"
              className="text-neutral-400 hover:text-[#EAB69B] transition-all text-sm"
            >
              Terms of Service
            </a>
            <a
              href="/cookie-policy"
              className="text-neutral-400 hover:text-[#EAB69B] transition-all text-sm"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
