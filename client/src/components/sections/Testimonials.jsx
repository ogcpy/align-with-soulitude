import { Quote } from "lucide-react";

function TestimonialCard({ quote, name, title, image }) {
  return (
    <div className="bg-[#F1F1F1] p-8 rounded-lg relative">
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
  const testimonials = [
    {
      quote: "Align with Soulitude has been a true sanctuary for me. The guided meditations have helped me manage my anxiety, and I've gained valuable tools to bring mindfulness into my everyday life.",
      name: "Sarah L.",
      title: "Wellness Coaching Client",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    },
    {
      quote: "I've tried many wellness programs, but none have been as comprehensive and personalized as what I found at Align with Soulitude. The holistic approach has truly transformed how I approach my health.",
      name: "Michael T.",
      title: "Mindful Movement Participant",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    }
  ];

  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-medium mb-6 text-neutral-800">
            What Our <span className="text-[#EAB69B]">Clients Say</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto font-['Raleway']">
            Read how Align with Soulitude has helped transform the lives of our community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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