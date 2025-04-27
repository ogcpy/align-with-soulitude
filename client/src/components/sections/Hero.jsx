import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
// Using dynamic import for the video to improve initial page load
const heroVideo = () => import("@/assets/videos/heroVideo.mp4");

export default function Hero() {
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the video asynchronously after components mount
    let isMounted = true;
    
    const loadVideo = async () => {
      try {
        // Dynamically import the video
        const videoModule = await heroVideo();
        if (isMounted) {
          setVideoSrc(videoModule.default);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load video:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadVideo();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Play video after it's loaded
    if (videoRef.current && videoSrc) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(error => {
        console.log("Auto-play was prevented:", error);
      });
    }
  }, [videoSrc]);

  const handleNavClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Header height offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <Loader2 className="h-10 w-10 animate-spin text-[#EAB69B]" />
          </div>
        )}
        
        {videoSrc && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
            poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // Tiny transparent placeholder
            loading="lazy"
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        
        {/* Overlay to improve text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold mb-4 sm:mb-6 text-white leading-tight px-2">
              Find Balance & Inner Peace
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-white text-opacity-90 mb-10 font-light font-['Raleway']">
              Guiding you on your journey to align mind, body, and spirit through holistic practices and mindful living.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => handleNavClick('services')}
                className="bg-[#EAB69B] hover:bg-[#D49B80] text-white px-8 py-6 rounded-md transition-all font-['Raleway'] text-sm uppercase tracking-wider"
              >
                Our Services
              </Button>
              <Button 
                onClick={() => handleNavClick('about')}
                variant="outline"
                className="border bg- border-white text-[#EAB69B] px-8 py-6 rounded-md hover:bg-white hover:bg-opacity-10 transition-all font-['Raleway'] text-sm uppercase tracking-wider"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}