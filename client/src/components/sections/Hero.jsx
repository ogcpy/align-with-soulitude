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
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        {/* Video will be added later - placeholder for now */}
        <video
          ref={videoRef}
          className="absolute object-cover w-full h-full"
          autoPlay
          loop
          muted
          playsInline
        >
          {/* Video source will be added later */}
          {/* <source src="/path-to-video.mp4" type="video/mp4" /> */}
        </video>
        
        {/* Overlay to ensure text is readable */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold mb-6 text-white leading-tight">
            Find Balance & Inner Peace
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white text-opacity-90 mb-10 font-light font-['Raleway']">
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
              className="border border-white text-white px-8 py-6 rounded-md hover:bg-white hover:bg-opacity-10 transition-all font-['Raleway'] text-sm uppercase tracking-wider"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}