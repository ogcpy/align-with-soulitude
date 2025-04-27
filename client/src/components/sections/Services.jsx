
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Youtube } from "lucide-react";
import podcastImage from "@/assets/images/podcast.jpg";

function ServiceCard({ title, description, image, link }) {
  return (
    <a href={link} className="block bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg hover:opacity-90 h-full">
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-6 flex flex-col h-[calc(100%-192px)]">
        <h3 className="text-xl font-['Playfair_Display'] font-medium mb-3 text-neutral-800">{title}</h3>
        <p className="text-neutral-600 mb-4 text-sm font-['Raleway'] flex-grow">
          {description}
        </p>
        <div className="text-[#EAB69B] font-medium flex items-center text-sm group font-['Raleway']">
          Learn more 
          <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
        </div>
      </div>
    </a>
  );
}

export default function Services() {
  const services = [
    {
      title: "Sound Bath Facilitator",
      description: "Immerse yourself in healing sound frequencies that promote deep relaxation, stress relief, and cellular rejuvenation through harmonious vibrations.",
      image: "https://images.unsplash.com/photo-1513278974582-3e1b4a4fa35e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      link: "/booking"
    },
    {
      title: "Inner Dance & Kundalini Facilitator",
      description: "Experience deep transformation through guided inner dance and kundalini awakening sessions that connect you with your highest self.",
      image: "https://images.unsplash.com/photo-1591291621164-2c6367723315?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      link: "/booking"
    },
    {
      title: "Vedic Astrology Reading",
      description: "Discover your life's path and potential through ancient Vedic wisdom and personalized astrological readings.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      link: "/booking"
    }
  ];

  return (
    <section id="services" className="bg-[#F1F1F1] py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Playfair_Display'] font-medium mb-4 sm:mb-6 text-neutral-800">
            Our <span className="text-[#EAB69B]">Services</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto font-['Raleway']">
            Discover the various ways we can support your journey toward balance and wellness through our holistic offerings.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              title={service.title}
              description={service.description}
              image={service.image}
              link={service.link}
            />
          ))}
        </div>
        
        <a 
          href="https://www.youtube.com/channel/YOUR_CHANNEL_ID" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg hover:opacity-90"
        >
          <div className="h-48 md:h-64 overflow-hidden">
            <img 
              src={podcastImage}
              alt="Align with Soulitude Podcast" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-['Playfair_Display'] font-medium mb-3 text-neutral-800">Intuitive Podcast</h3>
            <p className="text-neutral-600 mb-4 text-sm font-['Raleway']">
              Join us on our spiritual journey through our podcast series where we explore consciousness, healing, and personal transformation.
            </p>
            <div className="text-[#EAB69B] font-medium flex items-center text-sm group font-['Raleway']">
              Visit our YouTube Channel
              <Youtube className="h-4 w-4 ml-2" />
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
