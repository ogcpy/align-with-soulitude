import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  message: z.string().optional(),
});

export default function BookingForm({ selectedService, selectedSlot, date, services }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const selectedServiceObj = services?.find(s => s.id.toString() === selectedService);
  
  // Format times for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });
  
  const bookingMutation = useMutation({
    mutationFn: (formData) => {
      return apiRequest('/api/consultations', {
        method: 'POST',
        body: JSON.stringify({
          slotId: selectedSlot.id,
          serviceId: parseInt(selectedService),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message || "",
        }),
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/available-slots'] });
      
      toast({
        title: "Booking Successful!",
        description: "Your consultation has been booked successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error booking your consultation. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values) {
    bookingMutation.mutate(values);
  }
  
  if (isSubmitted) {
    return (
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
        <CardContent className="space-y-4">
          <div className="bg-[#F1F1F1] p-6 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Service:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">{selectedServiceObj?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Date:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">{format(date, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Time:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">
                {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
              </span>
            </div>
            {selectedServiceObj?.price && (
              <div className="flex justify-between">
                <span className="text-neutral-600 font-['Raleway']">Price:</span>
                <span className="font-medium text-neutral-800 font-['Raleway']">${selectedServiceObj.price}</span>
              </div>
            )}
          </div>
          
          <p className="text-center text-neutral-600 font-['Raleway']">
            We have sent a confirmation email to your email address with all the details.
          </p>
          
          <div className="text-center mt-4">
            <p className="text-neutral-600 font-['Raleway']">
              If you have any questions or need to reschedule, please contact us via WhatsApp.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            className="bg-[#EAB69B] hover:bg-[#D49B80] text-white px-8 py-6 rounded-md transition-all font-medium font-['Raleway']"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-neutral-800 font-['Playfair_Display']">
          Complete Your Booking
        </CardTitle>
        <CardDescription className="text-neutral-600 font-['Raleway']">
          Fill in your details to confirm your consultation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 bg-[#F1F1F1] p-6 rounded-lg">
          <h3 className="font-medium text-lg mb-3 text-neutral-800 font-['Raleway']">Booking Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Service:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">{selectedServiceObj?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Date:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">{format(date, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 font-['Raleway']">Time:</span>
              <span className="font-medium text-neutral-800 font-['Raleway']">
                {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
              </span>
            </div>
            {selectedServiceObj?.price && (
              <div className="flex justify-between">
                <span className="text-neutral-600 font-['Raleway']">Price:</span>
                <span className="font-medium text-neutral-800 font-['Raleway']">${selectedServiceObj.price}</span>
              </div>
            )}
          </div>
        </div>
      
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-700 font-['Raleway']">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      {...field} 
                      className="border-neutral-300 focus:border-[#EAB69B]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-700 font-['Raleway']">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your email" 
                      type="email" 
                      {...field} 
                      className="border-neutral-300 focus:border-[#EAB69B]"
                    />
                  </FormControl>
                  <FormDescription className="text-neutral-500 font-['Raleway']">
                    We'll send booking confirmation to this email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-700 font-['Raleway']">Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your phone number" 
                      {...field} 
                      className="border-neutral-300 focus:border-[#EAB69B]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-700 font-['Raleway']">Special Requests (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requirements or questions about your consultation?" 
                      {...field} 
                      className="border-neutral-300 focus:border-[#EAB69B]"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-[#EAB69B] hover:bg-[#D49B80] text-white py-6 font-medium font-['Raleway']"
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? "Processing..." : "Confirm Booking"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}