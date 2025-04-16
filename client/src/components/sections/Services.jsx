import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

function ServiceCard({ title, description, image }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-['Playfair_Display'] font-medium mb-3 text-neutral-800">{title}</h3>
        <p className="text-neutral-600 mb-4 text-sm font-['Raleway']">
          {description}
        </p>
        <a href="#" className="text-[#EAB69B] font-medium flex items-center text-sm group font-['Raleway']">
          Learn more 
          <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
        </a>
      </div>
    </div>
  );
}

export default function Services() {
  const services = [
    {
      title: "Guided Meditation",
      description: "Reconnect with your inner self through our guided meditation sessions designed to calm the mind and restore balance.",
      image: "https://images.unsplash.com/photo-1591291621164-2c6367723315?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Mindful Movement",
      description: "Experience the harmony of body and mind through gentle, intentional movement practices that promote healing.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Wellness Coaching",
      description: "Personalized guidance to help you create sustainable habits that support your physical and emotional wellbeing.",
      image: "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
    }
  ];

  const handleNavClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Header height offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="bg-[#F1F1F1] py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-medium mb-6 text-neutral-800">
            Our <span className="text-[#EAB69B]">Services</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto font-['Raleway']">
            Discover the various ways we can support your journey toward balance and wellness through our holistic offerings.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              title={service.title}
              description={service.description}
              image={service.image}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            onClick={() => handleNavClick('contact')}
            className="bg-[#EAB69B] text-white px-8 py-6 rounded-md hover:bg-opacity-90 transition-all font-['Raleway'] text-sm uppercase tracking-wider inline-block"
          >
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
}