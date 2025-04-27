import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Header() {
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (id) => {
    setIsMobileMenuOpen(false);
    
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Header height offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 bg-white bg-opacity-95 shadow-sm z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <a href="#" className="text-xl md:text-2xl font-['Playfair_Display'] font-medium text-neutral-800">
            Align with Soulitude
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center">
          <button 
            onClick={() => handleNavClick('about')} 
            className="text-neutral-600 hover:text-[#EAB69B] transition-all font-['Raleway'] text-sm uppercase tracking-wider"
          >
            About
          </button>
          <button 
            onClick={() => handleNavClick('services')} 
            className="text-neutral-600 hover:text-[#EAB69B] transition-all font-['Raleway'] text-sm uppercase tracking-wider"
          >
            Services
          </button>
          <button 
            onClick={() => handleNavClick('contact')} 
            className="text-neutral-600 hover:text-[#EAB69B] transition-all font-['Raleway'] text-sm uppercase tracking-wider"
          >
            Contact
          </button>
          <Button 
            onClick={() => navigate('/booking')}
            className="bg-[#EAB69B] hover:bg-[#D49B80] text-white transition-all font-['Raleway'] text-sm uppercase tracking-wider"
          >
            Book Consultation
          </Button>
        </nav>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={toggleMobileMenu} 
            className="text-neutral-600 hover:text-[#EAB69B] transition-all"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <button 
              onClick={() => handleNavClick('about')} 
              className="text-neutral-600 hover:text-[#EAB69B] transition-all font-['Raleway'] text-sm uppercase tracking-wider"
            >
              About
            </button>
            <button 
              onClick={() => handleNavClick('services')} 
              className="text-neutral-600 hover:text-[#EAB69B] transition-all font-['Raleway'] text-sm uppercase tracking-wider"
            >
              Services
            </button>
            <button 
              onClick={() => handleNavClick('contact')} 
              className="text-neutral-600 hover:text-[#EAB69B] transition-all font-['Raleway'] text-sm uppercase tracking-wider"
            >
              Contact
            </button>
            <Button 
              onClick={() => navigate('/booking')}
              className="bg-[#EAB69B] hover:bg-[#D49B80] text-white transition-all font-['Raleway'] text-sm uppercase tracking-wider text-center"
            >
              Book Consultation
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}