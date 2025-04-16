export default function About() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-medium mb-6 text-neutral-800">
              About <span className="text-[#EAB69B]">Soulitude</span>
            </h2>
            <p className="text-neutral-600 mb-6 leading-relaxed font-['Raleway']">
              Align with Soulitude was founded on the principle that true wellness comes from aligning your physical, mental, and spiritual self. We provide a sanctuary where you can disconnect from the noise of everyday life and reconnect with your inner wisdom.
            </p>
            <p className="text-neutral-600 mb-6 leading-relaxed font-['Raleway']">
              Our holistic approach combines ancient practices with modern techniques to help you find balance, clarity, and purpose in today's fast-paced world.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <div className="h-0.5 w-12 bg-[#EAB69B]"></div>
              <p className="text-neutral-500 italic font-light font-['Raleway']">Your journey to wellness begins here</p>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative h-96 overflow-hidden rounded-lg shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Person meditating in a peaceful setting" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#EAB69B] bg-opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
