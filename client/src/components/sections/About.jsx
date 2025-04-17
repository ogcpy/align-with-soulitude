export default function About() {
  return (
    <section id="about" className="py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-center">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-medium mb-6 text-neutral-800">
              About <span className="text-[#EAB69B]">Soulitude</span>
            </h2>
            <p className="text-neutral-600 mb-6 leading-relaxed font-['Raleway']">
            Welcome to "Align with Soulitude" a sacred space for remembering who you are through presence, soul connection, and divine timing.
            </p>
            <p className="text-neutral-600 mb-6 leading-relaxed font-['Raleway']">
            This is not a place for performance or perfection — but a home for the raw, the real, and the resonant. Each episode is an intuitive unfolding, guided by the energy of the moment. Some moments may empower you, others may stir something deeper. All of it is welcome.
            </p>
            <p className="text-neutral-600 mb-6 leading-relaxed font-['Raleway']">
            Healing isn’t linear. We honour the ascents, descents, and stillness in between. Through ancient wisdom and presence-led insights, I offer gentle guidance for those on the path of awakening, soul evolution, and inner remembrance.
            </p>
            <p className="text-neutral-600 mb-6 leading-relaxed font-['Raleway']">
            Whether you’re exploring mysticism or learning to be with yourself in deeper ways — know that you’re not alone. May each word ripple exactly where it's needed.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <div className="h-0.5 w-12 bg-[#EAB69B]"></div>
              <p className="text-neutral-500 italic font-light font-['Raleway']">Ready to align? Let's dive in together. ✨</p>
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