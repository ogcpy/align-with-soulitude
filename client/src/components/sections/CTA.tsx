import { Button } from "@/components/ui/button";

export default function CTA() {
  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Header height offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#EAB69B] py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="md:w-2/3">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-['Playfair_Display'] font-medium text-white mb-4">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-white text-opacity-90 max-w-2xl font-['Raleway']">
              Take the first step toward balance and inner peace. Book a consultation with us today and discover how Align with Soulitude can support your wellness journey.
            </p>
          </div>
          <div className="md:w-1/3 flex justify-center md:justify-end">
            <Button 
              onClick={() => handleNavClick('contact')}
              className="bg-white text-[#EAB69B] px-8 py-6 rounded-md hover:bg-opacity-90 transition-all font-['Raleway'] text-sm uppercase tracking-wider inline-block"
            >
              Book a Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
