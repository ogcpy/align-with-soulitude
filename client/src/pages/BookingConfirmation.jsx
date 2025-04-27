import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function BookingConfirmation() {
  const [_, setLocation] = useLocation();
  const [consultationId, setConsultationId] = useState(null);
  
  // Extract consultation ID from URL query params on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setConsultationId(id);
    } else {
      // Redirect to booking if no ID is provided
      setLocation("/booking");
    }
  }, [setLocation]);
  
  // Fetch consultation details if we have an ID
  const { 
    data: consultation, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/consultations', consultationId],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!consultationId,
  });
  
  // Format time for display (e.g., "09:00 AM")
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-neutral-800 font-['Playfair_Display']">
              Loading Booking Details...
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-[#EAB69B] border-t-transparent rounded-full"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If there was an error or consultation not found
  if (error || !consultation) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-neutral-800 font-['Playfair_Display']">
              Booking Not Found
            </CardTitle>
            <CardDescription className="text-neutral-600 font-['Raleway'] text-lg">
              We couldn't find the booking information you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <p className="text-neutral-600 font-['Raleway']">
              The consultation you're trying to view may have been canceled or the link is incorrect.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              className="bg-[#EAB69B] hover:bg-[#D49B80] text-white px-8 py-6 rounded-md transition-all font-medium font-['Raleway']"
              onClick={() => setLocation("/")}
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // If consultation data loaded successfully
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-neutral-800 font-['Playfair_Display']">
            Booking Confirmed!
          </CardTitle>
          <CardDescription className="text-neutral-600 font-['Raleway'] text-lg">
            Thank you for scheduling a consultation with us.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-[#F1F1F1] p-6 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Service:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">{consultation.service?.title || "Consultation"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Date:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">
                {consultation.slot?.date ? format(new Date(consultation.slot.date), 'MMMM d, yyyy') : "Scheduled Date"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Time:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">
                {consultation.slot ? `${formatTime(consultation.slot.startTime)} - ${formatTime(consultation.slot.endTime)}` : "Scheduled Time"}
              </span>
            </div>
            {consultation.service?.price && (
              <div className="flex justify-between">
                <span className="text-neutral-600 font-['Raleway']">Price:</span>
                <span className="font-medium text-neutral-800 font-['Raleway']">${consultation.service.price}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Status:</span>
              <span className="font-medium text-green-600 font-['Raleway']">{consultation.status || "Confirmed"}</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-3">
            <h3 className="font-medium text-lg mb-3 text-neutral-800 font-['Raleway']">Your Information</h3>
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Name:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">{consultation.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Email:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">{consultation.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Phone:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">{consultation.phone}</span>
            </div>
            {consultation.message && (
              <div className="pt-2 mt-2 border-t border-gray-200">
                <span className="text-neutral-600 font-['Raleway'] block mb-1">Special Requests:</span>
                <p className="font-medium text-neutral-800 font-['Raleway']">{consultation.message}</p>
              </div>
            )}
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-neutral-600 font-['Raleway']">
              We have sent a confirmation email to your email address with all the details.
            </p>
            <p className="text-neutral-600 font-['Raleway']">
              If you have any questions or need to reschedule, please contact us via WhatsApp.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            className="bg-[#EAB69B] hover:bg-[#D49B80] text-white px-8 py-6 rounded-md transition-all font-medium font-['Raleway']"
            onClick={() => setLocation("/")}
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}