import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, parse } from "date-fns";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getQueryFn } from "@/lib/queryClient";
import BookingForm from "@/components/booking/BookingForm";
import { useCurrency } from "@/hooks/useCurrency";
import CurrencySelector from "@/components/CurrencySelector";

export default function Booking() {
  // Set initial date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [date, setDate] = useState(tomorrow);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState("individual");
  const [step, setStep] = useState(1);
  const { formatPrice } = useCurrency();

  // Fetch services
  const { 
    data: services, 
    isLoading: servicesLoading 
  } = useQuery({
    queryKey: ['/api/services'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch all available slots regardless of session type
  const { 
    data: availableSlots, 
    isLoading: slotsLoading 
  } = useQuery({
    queryKey: ['/api/available-slots', date?.toISOString(), selectedService],
    queryFn: async ({ queryKey }) => {
      const [endpoint, dateString, serviceId] = queryKey;
      
      let url = `${endpoint}`;
      if (dateString) {
        url += `?fromDate=${dateString}`;
      }
      if (serviceId) {
        url += `${dateString ? '&' : '?'}serviceId=${serviceId}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch available slots");
      }
      return res.json();
    },
    enabled: !!date,
  });

  const handleDateChange = (newDate) => {
    if (newDate) {
      console.log("Date changed to:", format(newDate, 'yyyy-MM-dd'));
      setDate(newDate);
      setSelectedSlot(null);
    }
  };

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
  };
  
  // Find the first date with slots for the current session type
  const findDateWithSlots = (sessionType) => {
    if (!availableSlots) return null;
    
    // Find the first date with available slots for the selected session type
    const slot = availableSlots.find(slot => 
      !slot.isBooked && slot.sessionType === sessionType
    );
    
    if (slot) {
      // Parse the date string (format: "2025-04-28")
      const [year, month, day] = slot.date.split('-').map(num => parseInt(num, 10));
      // Create a new Date (months are 0-indexed in JavaScript)
      return new Date(year, month - 1, day);
    }
    
    // Fallback to hardcoded dates if no slots found
    if (sessionType === "individual") {
      return new Date(2025, 3, 28); // April 28, 2025 (month is 0-indexed)
    } else if (sessionType === "group") {
      return new Date(2025, 4, 5);  // May 5, 2025 (month is 0-indexed)
    }
    
    return null;
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
  
  // Effect to auto-navigate to dates with slots ONLY when session type changes
  useEffect(() => {
    if (availableSlots) {
      console.log("All available slots:", availableSlots);
      console.log("Selected date:", format(date, 'yyyy-MM-dd'));
      console.log("Session type:", sessionType);
      
      // Log the slots for the current date and session type
      const filteredSlots = availableSlots.filter(slot => 
        !slot.isBooked && 
        slot.date === format(date, 'yyyy-MM-dd') && 
        (slot.sessionType === sessionType || 
         (sessionType === "individual" && slot.sessionType === "individual") ||
         (sessionType === "group" && slot.sessionType === "group"))
      );
      console.log("Filtered slots for current date and session type:", filteredSlots);
    }
  }, [availableSlots, date]);
  
  // This effect only runs when the session type changes
  useEffect(() => {
    if (availableSlots) {
      const filteredSlots = availableSlots.filter(slot => 
        !slot.isBooked && 
        slot.date === format(date, 'yyyy-MM-dd') && 
        (slot.sessionType === sessionType || 
         (sessionType === "individual" && slot.sessionType === "individual") ||
         (sessionType === "group" && slot.sessionType === "group"))
      );
      
      // Only auto-navigate when session type changes and no slots are available
      if (filteredSlots.length === 0) {
        const newDate = findDateWithSlots(sessionType);
        if (newDate) {
          setDate(newDate);
        }
      }
    }
  }, [sessionType, availableSlots, date]);
  
  // Create lookup of dates with available slots
  const datesWithSlots = useMemo(() => {
    if (!availableSlots) return {};
    
    const dateMap = {};
    availableSlots
      .filter(slot => 
        !slot.isBooked && 
        (slot.sessionType === sessionType || 
         (sessionType === "individual" && slot.sessionType === "individual") ||
         (sessionType === "group" && slot.sessionType === "group"))
      )
      .forEach(slot => {
        dateMap[slot.date] = true;
      });
    
    return dateMap;
  }, [availableSlots, sessionType]);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-6xl relative">
      <div className="flex justify-end absolute right-3 sm:right-4 top-3 sm:top-4 gap-2">
        <CurrencySelector />
        <a 
          href="/" 
          className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-xl"
          aria-label="Return to homepage"
        >
          ×
        </a>
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-['Playfair_Display'] font-medium mb-4 sm:mb-6 text-center text-neutral-800">
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
            <CardContent className="overflow-hidden">
              <div className="w-full max-w-[300px] mx-auto">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  className="rounded-md border"
                  disabled={(calDate) => calDate < new Date(new Date().setHours(0, 0, 0, 0))}
                  modifiersClassNames={{
                    selected: 'bg-[#EAB69B] text-white',
                  }}
                  components={{
                    Day: ({ date: dayDate, ...props }) => {
                      // Create a clean props object without displayMonth (which causes a React warning)
                      const cleanProps = { ...props };
                      if ('displayMonth' in cleanProps) {
                        delete cleanProps.displayMonth;
                      }
                      
                      const formattedDate = format(dayDate, 'yyyy-MM-dd');
                      const hasSlots = datesWithSlots[formattedDate];
                      
                      return (
                        <div className="relative">
                          <button
                            type="button"
                            {...cleanProps}
                            className={`${props.className} ${hasSlots ? 'text-green-700 font-medium' : 'opacity-70'}`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (cleanProps.onClick) {
                                cleanProps.onClick(e);
                              }
                              setDate(dayDate);
                            }}
                          >
                            {dayDate.getDate()}
                          </button>
                          {hasSlots && (
                            <div 
                              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full" 
                              style={{ bottom: '2px' }}
                            />
                          )}
                        </div>
                      );
                    }
                  }}
                />
              </div>
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
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-neutral-800">Session Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSessionType("individual");
                      const newDate = findDateWithSlots("individual");
                      if (newDate) {
                        setDate(newDate);
                      }
                    }}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      sessionType === "individual"
                        ? 'border-[#EAB69B] bg-[#EAB69B]/10 text-[#EAB69B]'
                        : 'border-gray-200 hover:border-[#EAB69B] text-neutral-600'
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    onClick={() => {
                      setSessionType("group");
                      const newDate = findDateWithSlots("group");
                      if (newDate) {
                        setDate(newDate);
                      }
                    }}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      sessionType === "group"
                        ? 'border-[#EAB69B] bg-[#EAB69B]/10 text-[#EAB69B]'
                        : 'border-gray-200 hover:border-[#EAB69B] text-neutral-600'
                    }`}
                  >
                    Group
                  </button>
                </div>
              </div>
            
              {servicesLoading ? (
                <div className="grid gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full p-4 rounded-lg border border-gray-200 animate-pulse">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))}
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
                      <div className="text-sm text-neutral-600">{formatPrice(service.price)}</div>
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
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-md" />
                  ))}
                </div>
              ) : availableSlots && availableSlots.length > 0 ? (
                <>
                  {(() => {
                    const filteredSlots = availableSlots.filter(slot => 
                      !slot.isBooked && 
                      slot.date === format(date, 'yyyy-MM-dd') && 
                      (slot.sessionType === sessionType || 
                       (sessionType === "individual" && slot.sessionType === "individual") ||
                       (sessionType === "group" && slot.sessionType === "group"))
                    );
                    
                    if (filteredSlots.length > 0) {
                      return (
                        <div className="grid grid-cols-2 gap-2">
                          {filteredSlots.map((slot) => (
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
                      );
                    } else {
                      return (
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <p className="text-neutral-600 mb-2">No available slots for this date.</p>
                            <p className="text-neutral-600">Please select a different date or session type.</p>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className="text-neutral-600 mb-2">No available slots for this date.</p>
                    {sessionType === "individual" ? (
                      <>
                        <p className="text-neutral-600 mb-2">Individual session dates available:</p>
                        <p className="text-green-700 font-medium">Apr 28, Apr 30, May 1</p>
                      </>
                    ) : (
                      <>
                        <p className="text-neutral-600 mb-2">Group session dates available:</p>
                        <p className="text-green-700 font-medium">May 5</p>
                      </>
                    )}
                  </div>
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
            sessionType={sessionType}
          />
        </div>
      )}
    </div>
  );
}