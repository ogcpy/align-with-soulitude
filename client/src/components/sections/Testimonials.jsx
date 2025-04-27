import { Quote } from "lucide-react";
import { useEffect, useRef, memo } from "react";
import { LazyImage } from "@/components/ui/lazy-image";

// Optimize the TestimonialCard with memoization to prevent unnecessary re-renders
const TestimonialCard = memo(function TestimonialCard({ quote, name, title, image }) {
  // Make sure all quotes look consistent length-wise
  const truncateText = (text, maxLength = 350) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  return (
    <div className="bg-[#F1F1F1] p-8 rounded-lg relative w-[500px] flex-shrink-0 mx-4 h-[350px] flex flex-col justify-between shadow-sm">
      <div className="absolute -top-6 left-6 text-[#EAB69B]">
        <Quote className="h-12 w-12" />
      </div>
      <div className="mt-8">
        <p
          className="text-neutral-600 leading-relaxed italic font-['Raleway'] text-lg"
          style={{ wordWrap: "break-word", whiteSpace: "normal" }}
        >
          {truncateText(quote)}
        </p>
      </div>
      <div className="flex items-center mt-8">
        <div className="mr-5">
          <LazyImage
            src={image}
            alt={`${name} portrait`}
            className="w-16 h-16 rounded-full object-cover shadow-sm"
            placeholderColor="#EAB69B20"
          />
        </div>
        <div>
          <h4 className="font-medium text-neutral-800 font-['Raleway'] text-base mb-1">
            {name}
          </h4>
          <p className="text-neutral-500 text-sm font-['Raleway']">{title}</p>
        </div>
      </div>
    </div>
  );
});

export default function Testimonials() {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scrollSpeed = 1.5; // Adjust scrolling speed for larger cards
    let animationFrameId = null;
    let isPaused = false;
    
    // Using requestAnimationFrame for smoother scrolling
    const autoScroll = () => {
      if (!scrollContainer || isPaused) {
        animationFrameId = requestAnimationFrame(autoScroll);
        return;
      }

      // Get the current max scroll width
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

      // Only scroll if we have content wider than the container
      if (maxScroll > 0) {
        scrollAmount += scrollSpeed;
        
        // Reset when we reach the end
        if (scrollAmount >= maxScroll) {
          scrollAmount = 0;
        }
        
        scrollContainer.scrollLeft = scrollAmount;
      }
      
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Start the scroll animation using requestAnimationFrame
    animationFrameId = requestAnimationFrame(autoScroll);

    // Handle hover pause
    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    // Using passive event listeners for better performance
    scrollContainer.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    scrollContainer.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    // Clean up on component unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      if (scrollContainer) {
        scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
        scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  const testimonials = [
    {
      quote:
        "I very much enjoyed my reading and I've even been doing some shadow work :) although I have a lot more to work on, I found your reading very easy to follow and very insightful and reassuring.",
      name: "Angela M.",
      title: "Oracle Reading Client",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      quote:
        "This is so wonderful, thank you so much! This reading was not was I was expecting but it's was so lovely! You mentioned so many things that resonated, and the spiritual gifts awakening is very exciting. Thank you so much🥰❤️🥰 I do hope to book a reading again soon",
      name: "Sara B.",
      title: "Oracle Reading Client",
      image:
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      quote:
        "Thank you so so much for the reading it was exactly what I needed to hear so much right now ❤️❤️",
      name: "Martin K.",
      title: "Oracle Reading Client",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      quote:
        "I am still so thankful for the reading I got, it really touched me.",
      name: "Olivia F.",
      title: "Oracle Reading Client",
      image:
        "https://images.unsplash.com/photo-1491349174775-aaafddd81942?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      quote:
        "It was UNREAL I highly recommend this beautiful powerful soul who gave me so many codes and keys to enter the next chapter of my journey. She gave me so many powerful insights around an initation I am currently moving through as a priestess leading big spaces.",
      name: "Yas K.",
      title: "Oracle Reading Client",
      image:
        "https://images.unsplash.com/photo-1557296387-5358ad7997bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      quote:
        "Oh Darling you are a true beacon of hope and healing. Whenever I hear your voice I weep from the instant healing my soul receives. I appreciate you on every level of being 💖",
      name: "Tara G.",
      title: "Oracle Reading Client",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
    {
      quote:
        "Thank you for that finance reading, It definitely encouraged me to step into my Power.",
      name: "Cindy C.",
      title: "Oracle Reading Client",
      image:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    },
  ];

  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-medium mb-6 text-neutral-800">
            What Our <span className="text-[#EAB69B]">Clients Say</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto font-['Raleway']">
            Read how Align with Soulitude has helped transform the lives of our
            community.
          </p>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-hidden pb-8 pt-8 relative"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              title={testimonial.title}
              image={testimonial.image}
            />
          ))}

          {/* Duplicate the first few testimonials to create a seamless loop */}
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <TestimonialCard
              key={`duplicate-${index}`}
              quote={testimonial.quote}
              name={testimonial.name}
              title={testimonial.title}
              image={testimonial.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
