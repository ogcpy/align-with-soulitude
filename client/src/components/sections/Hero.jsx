import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import heroVideo from "@/docs/heroVideo.mp4"

export default function Hero() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch((error) => {
        console.log("Auto-play was prevented:", error);
      });
    }
  }, []);

  const handleNavClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={heroVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />

      {/* Hero content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-['Playfair_Display'] font-bold mb-4 sm:mb-6 text-white leading-tight">
          Find Balance & Inner Peace
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-white text-opacity-90 mb-10 font-light font-['Raleway']">
          Guiding you on your journey to align mind, body, and spirit through holistic practices and mindful living.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => handleNavClick("services")}
            className="bg-[#EAB69B] text-white px-8 py-6 rounded-md hover:bg-opacity-90 transition-all font-['Raleway'] text-sm uppercase tracking-wider"
          >
            Our Services
          </Button>
          <Button
            onClick={() => handleNavClick("about")}
            variant="outline"
            className="border border-white bg-gray text-white px-8 py-6 rounded-md hover:bg-white hover:bg-opacity-10 hover:text-white transition-all font-['Raleway'] text-sm uppercase tracking-wider"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
