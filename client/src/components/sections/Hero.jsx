import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export default function Hero() {
  const videoRef = useRef(null);

  useEffect(() => {
    // When a video is added later, this will ensure it's muted and plays
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(error => {
        console.log("Auto-play was prevented:", error);
      });
    }
  }, []);

  const handleNavClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Header height offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="bg-[#F1F1F1] py-12 sm:py-20 md:py-28">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold mb-4 sm:mb-6 text-neutral-800 leading-tight px-2">
            Find Balance & Inner Peace
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-neutral-800 text-opacity-90 mb-10 font-light font-['Raleway']">
            Guiding you on your journey to align mind, body, and spirit through holistic practices and mindful living.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => handleNavClick('services')}
              className="bg-[#EAB69B] text-white px-8 py-6 rounded-md hover:bg-opacity-90 transition-all font-['Raleway'] text-sm uppercase tracking-wider"
            >
              Our Services
            </Button>
            <Button 
              onClick={() => handleNavClick('about')}
              variant="outline"
              className="border border-white text-black px-8 py-6 rounded-md hover:bg-white hover:bg-opacity-10 transition-all font-['Raleway'] text-sm uppercase tracking-wider"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}