import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(1, { message: "Please select a subject." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export default function Contact() {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would send this data to your backend
    console.log(values);
    
    toast({
      title: "Message sent!",
      description: "Thank you for reaching out. We'll get back to you soon.",
    });
    
    form.reset();
  }

  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-medium mb-6 text-neutral-800">
              Connect <span className="text-[#EAB69B]">With Us</span>
            </h2>
            <p className="text-neutral-600 mb-8 leading-relaxed font-['Raleway']">
              Have questions about our services or want to learn more about how we can support your wellness journey? Reach out to us today.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-[#F1F1F1] p-3 rounded-full mr-4">
                  <MapPin className="h-6 w-6 text-[#EAB69B]" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1 font-['Raleway']">Visit Us</h3>
                  <p className="text-neutral-600 font-['Raleway']">123 Serenity Lane, Mindful City, MC 12345</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-[#F1F1F1] p-3 rounded-full mr-4">
                  <Mail className="h-6 w-6 text-[#EAB69B]" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1 font-['Raleway']">Email Us</h3>
                  <p className="text-neutral-600 font-['Raleway']">hello@alignwithsoulitude.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-[#F1F1F1] p-3 rounded-full mr-4">
                  <Phone className="h-6 w-6 text-[#EAB69B]" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1 font-['Raleway']">Call Us</h3>
                  <p className="text-neutral-600 font-['Raleway']">(555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="bg-[#F1F1F1] p-8 rounded-lg">
              <h3 className="text-2xl font-['Playfair_Display'] font-medium mb-6 text-neutral-800">Send a Message</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-700 mb-1 font-['Raleway']">Your Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your name" 
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#EAB69B] focus:ring-opacity-50 focus:border-[#EAB69B] outline-none transition-all"
                            {...field} 
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
                        <FormLabel className="text-sm font-medium text-neutral-700 mb-1 font-['Raleway']">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your email" 
                            type="email" 
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#EAB69B] focus:ring-opacity-50 focus:border-[#EAB69B] outline-none transition-all"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-700 mb-1 font-['Raleway']">Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#EAB69B] focus:ring-opacity-50 focus:border-[#EAB69B] outline-none transition-all">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="services">Services Information</SelectItem>
                            <SelectItem value="booking">Booking Request</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-700 mb-1 font-['Raleway']">Your Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="How can we help you?"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#EAB69B] focus:ring-opacity-50 focus:border-[#EAB69B] outline-none transition-all"
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#EAB69B] text-white px-5 py-6 rounded-md hover:bg-opacity-90 transition-all font-medium font-['Raleway']"
                  >
                    Send Message
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
