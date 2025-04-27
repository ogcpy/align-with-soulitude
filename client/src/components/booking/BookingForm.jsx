import { useState, useEffect } from "react";
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
import PaymentProviderFixed from "@/components/payment/PaymentProviderFixed";
import { useCurrency } from "@/hooks/useCurrency";
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
import { 
  CheckCircle,
  Tag,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  message: z.string().optional(),
  discountCode: z.string().optional(),
});

export default function BookingForm({ selectedService, selectedSlot, date, services, sessionType }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingStep, setBookingStep] = useState("details"); // details -> review -> payment -> success
  const [discount, setDiscount] = useState(null);
  const [discountError, setDiscountError] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [bookingId, setBookingId] = useState(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatPrice, activeCurrency } = useCurrency();
  
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
  
  // Initialize final price from service price
  useEffect(() => {
    if (selectedServiceObj && selectedServiceObj.price) {
      setFinalPrice(selectedServiceObj.price);
    }
  }, [selectedServiceObj]);
  
  // Discount code validation mutation
  const validateDiscountMutation = useMutation({
    mutationFn: async (code) => {
      console.log('Validating discount code:', code);
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate discount code');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Discount validation response:', data);
      if (data.success && data.discount) {
        setDiscount(data.discount);
        setDiscountError(null);
        
        // Calculate the new price with discount
        const servicePrice = selectedServiceObj?.price || 0;
        let discountedPrice = servicePrice;
        
        if (data.discount.type === 'percentage') {
          const discountAmount = (servicePrice * parseFloat(data.discount.value)) / 100;
          discountedPrice = servicePrice - discountAmount;
        } else {
          // Fixed amount discount
          discountedPrice = servicePrice - parseFloat(data.discount.value);
          if (discountedPrice < 0) discountedPrice = 0;
        }
        
        setFinalPrice(discountedPrice);
        
        toast({
          title: "Discount Applied!",
          description: `${data.discount.type === 'percentage' ? data.discount.value + '% off' : activeCurrency.symbol + data.discount.value + ' off'} your booking.`,
        });
      }
    },
    onError: (error) => {
      setDiscount(null);
      setDiscountError(error.message || "Invalid discount code");
      
      toast({
        title: "Discount Code Invalid",
        description: error.message || "The discount code you entered is invalid or expired.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setValidatingCode(false);
    }
  });

  // Handle discount code validation
  const validateDiscountCode = () => {
    const code = form.getValues("discountCode");
    if (!code) {
      setDiscountError("Please enter a discount code");
      return;
    }
    
    setValidatingCode(true);
    validateDiscountMutation.mutate(code);
  };
  
  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (formData) => {
      console.log("Booking mutation started with data:", formData);
      const payload = {
        slotId: selectedSlot.id,
        serviceId: parseInt(selectedService),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message || "",
      };
      
      // Add discount code if available
      if (discount) {
        payload.discountCode = formData.discountCode;
      }
      
      console.log("Sending booking payload:", payload);
      
      // Use fetch directly instead of apiRequest to have more control
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Booking request failed:", errorData);
        throw new Error(errorData.message || "Failed to book consultation");
      }
      
      return response.json();
    },
    onSuccess: (response) => {
      console.log("Booking successful:", response);
      queryClient.invalidateQueries({ queryKey: ['/api/available-slots'] });
      
      // Store the booking ID for payment
      if (response.consultation && response.consultation.id) {
        console.log("Setting bookingId:", response.consultation.id);
        setBookingId(response.consultation.id);
      } else {
        console.error("No consultation ID in response:", response);
      }
      
      // If the price is 0 (free or 100% discount), mark as submitted directly
      if (finalPrice <= 0) {
        setIsSubmitted(true);
        toast({
          title: "Booking Successful!",
          description: "Your consultation has been booked successfully. You will receive a confirmation email shortly.",
        });
      } else {
        // Move to payment step
        console.log("Moving to payment step with finalPrice:", finalPrice);
        setBookingStep("payment");
      }
    },
    onError: (error) => {
      console.error("Booking mutation error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error booking your consultation. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  function onSubmit(values) {
    if (bookingStep === "details") {
      // Move to review step
      setBookingStep("review");
    } else if (bookingStep === "review") {
      console.log("Submitting booking with values:", values);
      try {
        // Submit booking
        bookingMutation.mutate(values);
      } catch (error) {
        console.error("Error submitting booking:", error);
        toast({
          title: "Booking Submission Failed",
          description: "There was an error processing your booking. Please try again.",
          variant: "destructive",
        });
      }
    }
  }
  
  // Handle payment success
  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      console.log("Payment successful, notifying server...");
      
      // Notify the server about the successful payment
      const response = await fetch('/api/payment-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultationId: bookingId,
          paymentIntentId: paymentIntent.id
        }),
      });
      
      const data = await response.json();
      console.log("Payment success notification response:", data);
      
      // Mark the booking as completed
      setIsSubmitted(true);
      toast({
        title: "Payment Successful!",
        description: "Your consultation has been booked and payment processed successfully. A confirmation email will be sent to your email address.",
      });
    } catch (error) {
      console.error("Error notifying server about payment:", error);
      // Still mark as submitted even if notification fails
      setIsSubmitted(true);
      toast({
        title: "Payment Successful!",
        description: "Your consultation has been booked and payment processed successfully. A confirmation will be sent shortly.",
      });
    }
  };
  
  // Handle payment error
  const handlePaymentError = (error) => {
    toast({
      title: "Payment Failed",
      description: error.message || "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
  };
  
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
                <span className="font-medium text-neutral-800 font-['Raleway']">{formatPrice(selectedServiceObj.price)}</span>
              </div>
            )}
          </div>
          
          <div className="text-center text-neutral-600 font-['Raleway'] space-y-2">
            <p>A confirmation email will be sent to your email address with all the details.</p>
            <p className="text-sm italic">Please check your spam folder if you don't see it in your inbox.</p>
          </div>
          
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
  
  // Based on step, render different content
  if (bookingStep === "payment") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-neutral-800 font-['Playfair_Display']">
            Complete Your Payment
          </CardTitle>
          <CardDescription className="text-neutral-600 font-['Raleway']">
            Secure payment to confirm your booking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-neutral-600 font-['Raleway']">Original Price:</span>
                <span className="font-medium text-neutral-800 font-['Raleway']">{formatPrice(selectedServiceObj?.price)}</span>
              </div>
              
              {discount && (
                <div className="flex justify-between text-green-600">
                  <span className="font-['Raleway']">Discount:</span>
                  <span className="font-medium font-['Raleway']">
                    {discount.type === 'percentage' ? `${discount.value}%` : `${activeCurrency.symbol}${discount.value}`} off
                  </span>
                </div>
              )}
              
              <div className="flex justify-between font-bold mt-2">
                <span className="text-neutral-800 font-['Raleway']">Total Price:</span>
                <span className="text-neutral-800 font-['Raleway']">{formatPrice(finalPrice)}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <PaymentProviderFixed
              amount={finalPrice}
              consultationId={bookingId}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <Button 
              variant="outline"
              onClick={() => setBookingStep("review")}
              className="w-full"
            >
              Back to Review
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-neutral-800 font-['Playfair_Display']">
          {bookingStep === "review" ? "Review Your Booking" : "Complete Your Booking"}
        </CardTitle>
        <CardDescription className="text-neutral-600 font-['Raleway']">
          {bookingStep === "review" 
            ? "Please review your booking details before proceeding to payment" 
            : "Fill in your details to confirm your consultation"}
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
            
            {bookingStep === "review" ? (
              <>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 font-['Raleway']">Original Price:</span>
                    <span className="font-medium text-neutral-800 font-['Raleway']">{formatPrice(selectedServiceObj?.price)}</span>
                  </div>
                  
                  {discount && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-['Raleway']">Discount:</span>
                      <span className="font-medium font-['Raleway']">
                        {discount.type === 'percentage' ? `${discount.value}%` : `${activeCurrency.symbol}${discount.value}`} off
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold mt-2">
                    <span className="text-neutral-800 font-['Raleway']">Total Price:</span>
                    <span className="text-neutral-800 font-['Raleway']">{formatPrice(finalPrice)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span className="text-neutral-600 font-['Raleway']">Price:</span>
                <span className="font-medium text-neutral-800 font-['Raleway']">{formatPrice(selectedServiceObj?.price)}</span>
              </div>
            )}
          </div>
        </div>
      
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {bookingStep === "details" ? (
              <>
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
              </>
            ) : (
              // Review step - show user info and allow discount code
              <>
                <div className="space-y-4">
                  <h3 className="font-medium text-lg text-neutral-800 font-['Raleway']">Contact Information</h3>
                  <div className="bg-white p-4 rounded-md border border-gray-100 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-600 font-['Raleway']">Full Name</p>
                        <p className="font-medium text-neutral-800 font-['Raleway']">{form.getValues("name")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 font-['Raleway']">Email Address</p>
                        <p className="font-medium text-neutral-800 font-['Raleway']">{form.getValues("email")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 font-['Raleway']">Phone Number</p>
                        <p className="font-medium text-neutral-800 font-['Raleway']">{form.getValues("phone")}</p>
                      </div>
                      {form.getValues("message") && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-neutral-600 font-['Raleway']">Special Requests</p>
                          <p className="font-medium text-neutral-800 font-['Raleway']">{form.getValues("message")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Discount Code Section */}
                  <div className="mt-6">
                    <h3 className="font-medium text-lg text-neutral-800 font-['Raleway'] mb-2">Have a Discount Code?</h3>
                    <div className="flex space-x-2">
                      <FormField
                        control={form.control}
                        name="discountCode"
                        render={({ field }) => (
                          <div className="flex-grow">
                            <Input 
                              placeholder="Enter discount code" 
                              {...field} 
                              className="border-neutral-300 focus:border-[#EAB69B]"
                              disabled={!!discount || validatingCode}
                            />
                            {discountError && (
                              <p className="text-sm text-red-500 mt-1">{discountError}</p>
                            )}
                            {discount && (
                              <div className="flex items-center mt-2 text-green-600">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                <span className="text-sm">
                                  Code "{discount.code}" applied successfully
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      />
                      <Button 
                        type="button" 
                        variant={discount ? "outline" : "default"}
                        onClick={discount ? () => {
                          form.setValue("discountCode", "");
                          setDiscount(null);
                          setDiscountError(null);
                          setFinalPrice(selectedServiceObj?.price || 0);
                        } : validateDiscountCode}
                        disabled={validatingCode}
                        className={discount ? "bg-white border-red-500 text-red-500 hover:bg-red-50" : "bg-[#EAB69B] hover:bg-[#D49B80] text-white"}
                      >
                        {validatingCode ? "Validating..." : discount ? "Remove" : "Apply"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 space-y-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setBookingStep("details")}
                    className="w-full"
                  >
                    Edit Details
                  </Button>
                </div>
              </>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-[#EAB69B] hover:bg-[#D49B80] text-white py-6 font-medium font-['Raleway']"
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending 
                ? "Processing..." 
                : bookingStep === "details" 
                  ? "Continue to Review" 
                  : "Proceed to Payment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}