import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getQueryFn } from "@/lib/queryClient";
import BookingForm from "@/components/booking/BookingForm";

export default function Booking() {
  const [date, setDate] = useState(new Date());
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1);

  // Fetch services
  const { 
    data: services, 
    isLoading: servicesLoading 
  } = useQuery({
    queryKey: ['/api/services'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch available slots for the selected date
  const { 
    data: availableSlots, 
    isLoading: slotsLoading 
  } = useQuery({
    queryKey: ['/api/available-slots', date && date.toISOString()],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!date,
  });

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedSlot(null);
  };

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedSlot(null);
  };

  // Format time for display (e.g., "09:00 AM")
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl relative">
      <a 
        href="/" 
        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
        aria-label="Return to homepage"
      >
        ×
      </a>
      <h1 className="text-3xl md:text-4xl font-['Playfair_Display'] font-medium mb-6 text-center text-neutral-800">
        Book Your <span className="text-[#EAB69B]">Consultation</span>
      </h1>
      <p className="text-center text-neutral-600 mb-12 max-w-3xl mx-auto font-['Raleway']">
        Select a date, service, and time slot to book your personal consultation. 
        Our experts will guide you through your spiritual journey and help you find 
        balance and inner peace.
      </p>

      {step === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl text-neutral-800 font-['Raleway']">Choose a Date</CardTitle>
              <CardDescription className="text-neutral-600 font-['Raleway']">
                Select your preferred date for the consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="rounded-md border"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl text-neutral-800 font-['Raleway']">Select a Service</CardTitle>
              <CardDescription className="text-neutral-600 font-['Raleway']">
                Choose the type of consultation you need
              </CardDescription>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-neutral-600">Loading services...</p>
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceChange(service.id.toString())}
                      className={`w-full p-4 text-left rounded-lg border transition-all ${
                        selectedService === service.id.toString()
                          ? 'border-[#EAB69B] bg-[#EAB69B]/10'
                          : 'border-gray-200 hover:border-[#EAB69B]'
                      }`}
                    >
                      <div className="font-medium">{service.title}</div>
                      <div className="text-sm text-neutral-600">${service.price}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-neutral-600">No services available. Please contact us directly.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl text-neutral-800 font-['Raleway']">Pick a Time Slot</CardTitle>
              <CardDescription className="text-neutral-600 font-['Raleway']">
                Available time slots for {date && format(date, 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {slotsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-neutral-600">Loading available slots...</p>
                </div>
              ) : availableSlots && availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {[...new Map(availableSlots
                    .filter(slot => !slot.isBooked)
                    .map(slot => [slot.startTime, slot])).values()]
                    .map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot && selectedSlot.id === slot.id ? "default" : "outline"}
                        className={`w-full ${selectedSlot && selectedSlot.id === slot.id ? 'bg-[#EAB69B] hover:bg-[#D49B80]' : ''}`}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {formatTime(slot.startTime)}
                      </Button>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-neutral-600">No available slots for this date. Please select another date.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-[#EAB69B] hover:bg-[#D49B80] text-white"
                disabled={!selectedSlot || !selectedService}
                onClick={handleNext}
              >
                Continue to Booking
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="mb-6"
          >
            ← Back to Selection
          </Button>
          
          <BookingForm 
            selectedService={selectedService} 
            selectedSlot={selectedSlot} 
            date={date}
            services={services}
          />
        </div>
      )}
    </div>
  );
}