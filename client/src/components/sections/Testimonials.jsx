import { useEffect, useRef } from "react";
import { Quote } from "lucide-react";

function TestimonialCard({ quote, name, title, image }) {
  return (
    <div className="bg-[#F1F1F1] p-8 rounded-lg relative w-full max-w-md mx-auto snap-start shrink-0">
      <div className="absolute -top-6 left-8 text-[#EAB69B]">
        <Quote className="h-12 w-12" />
      </div>
      <p className="text-neutral-600 mb-6 leading-relaxed italic font-['Raleway']">
        {quote}
      </p>
      <div className="flex items-center">
        <div className="mr-4">
          <img 
            src={image} 
            alt={`${name} portrait`} 
            className="w-12 h-12 rounded-full object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <h4 className="font-medium text-neutral-800 font-['Raleway']">{name}</h4>
          <p className="text-neutral-500 text-sm font-['Raleway']">{title}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const scrollRef = useRef(null);

  const testimonials = [
    {
      quote: "I very much enjoyed my reading and I've even been doing some shadow work :) although I have a lot more to work on, I found your reading very easy to follow and very insightful and reassuring.",
      name: "Angela M.",
      title: "Oracle Reading Client",
      image: "https://www.shutterstock.com/image-vector/hand-drawn-modern-woman-avatar-260nw-1373621021.jpg"
    },
    {
      quote: "This is so wonderful, thank you so much! This reading was not was I was expecting but it’s was so lovely! You mentioned so many things that resonated, and the spiritual gifts awakening is very exciting. Thank you so much🥰❤️🥰 I do hope to book a reading again soon",
      name: "Sara B.",
      title: "Oracle Reading Client",
      image: "https://www.shutterstock.com/image-vector/hand-drawn-modern-woman-avatar-260nw-1373621021.jpg"
    },
    {
      quote: "Thank you so so much for the reading it was exactly what I needed to hear so much right now ❤️❤️",
      name: "Martin K.",
      title: "Oracle Reading Client",
      image: "https://www.shutterstock.com/image-vector/hand-drawn-modern-man-avatar-260nw-1373616869.jpg"
    },
    {
      quote: "I am still so thankful for the reading I got, it really touched me.",
      name: "Olivia F.",
      title: "Oracle Reading Client",
      image: "https://www.shutterstock.com/image-vector/hand-drawn-modern-woman-avatar-260nw-1373621021.jpg"
    },
    {
      quote: "It was UNREAL I highly recommend this beautiful powerful soul who gave me so many codes and keys to enter the next chapter of my journey. She gave me so many powerful insights around an initation I am currently moving through as a priestess leading big spaces...",
      name: "Yas K.",
      title: "Oracle Reading Client",
      image: "https://www.shutterstock.com/image-vector/hand-drawn-modern-woman-avatar-260nw-1373621021.jpg"
    },
    {
      quote: "Oh Darling you are a true beacon of hope and healing. Whenever I hear your voice I weep from the instant healing my soul receives. I appreciate you on every level of being 💖",
      name: "Tara G.",
      title: "Oracle Reading Client",
      image: "https://www.shutterstock.com/image-vector/hand-drawn-modern-woman-avatar-260nw-1373621021.jpg"
    },
    {
      quote: "Thank you for that finance reading, It definitely encouraged me to step into my Power.",
      name: "Cindy C.",
      title: "Oracle Reading Client",
      image: "https://www.shutterstock.com/image-vector/hand-drawn-modern-woman-avatar-260nw-1373621021.jpg"
    },
    // your testimonials array
  ];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;

    const scroll = () => {
      if (!scrollContainer) return;
      scrollAmount += 1;
      if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollAmount = 0;
      }
      scrollContainer.scrollTo({
        left: scrollAmount,
        behavior: "smooth"
      });
    };

    const interval = setInterval(scroll, 5); // Adjust speed here
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-medium mb-6 text-neutral-800">
            What Our <span className="text-[#EAB69B]">Clients Say</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto font-['Raleway']">
            Read how Align with Soulitude has helped transform the lives of our community.
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory w-full "
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
        </div>
      </div>
    </section>
  );
}
