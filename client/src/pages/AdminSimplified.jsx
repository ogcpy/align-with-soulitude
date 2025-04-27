import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Skeleton,
  ServicesSkeleton,
  AvailabilitySlotsSkeleton,
  ConsultationsSkeleton,
  DiscountCodesSkeleton,
  CalendarSkeleton,
  BookingsSkeleton,
} from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  Tag,
  X,
  Users,
  ClipboardCheck,
  LayoutDashboard,
  Settings,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminSimplified() {
  const [activeTab, setActiveTab] = useState("availability");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('adminData');
    setIsAdmin(false);
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin dashboard",
    });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-neutral-800 font-['Playfair_Display']">
              Admin Dashboard
            </CardTitle>
            <CardDescription className="text-neutral-600 font-['Raleway']">
              Loading authentication status...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin w-10 h-10 border-4 border-[#EAB69B] border-t-transparent rounded-full"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <AdminLogin onLoginSuccess={() => setIsAdmin(true)} />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-['Playfair_Display'] font-medium text-neutral-800">Admin Dashboard</h1>
          <p className="text-neutral-600 font-['Raleway']">Manage your services, availability, and bookings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="text-neutral-600 hover:text-neutral-800" 
            onClick={() => window.location.href = '/'}
          >
            Back to Website
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-800 border-red-200 hover:bg-red-50" 
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="availability" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Availability</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Services</span>
          </TabsTrigger>
          <TabsTrigger value="discounts" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Discount Codes</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="availability">
          <AvailabilityTabSimple />
        </TabsContent>
        
        <TabsContent value="services">
          <ServicesTab />
        </TabsContent>
        
        <TabsContent value="discounts">
          <DiscountCodesTabSimple />
        </TabsContent>
        
        <TabsContent value="bookings">
          <BookingsTabSimple />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Admin Login Component
function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      console.log('Attempting admin login with:', username);
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok && data.success) {
        console.log('Login successful');
        
        // Store admin data in localStorage with the username
        localStorage.setItem('adminData', JSON.stringify({
          user: data.user,
          timestamp: new Date().getTime(),
          username: username // Store the username for authentication
        }));
        
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        
        // Call the callback to update parent component state
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-neutral-800 font-['Playfair_Display']">Admin Login</CardTitle>
          <CardDescription className="text-neutral-600 font-['Raleway']">
            Please log in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-neutral-700 font-['Raleway']">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-neutral-300 focus:border-[#EAB69B]"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-neutral-700 font-['Raleway']">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-neutral-300 focus:border-[#EAB69B]"
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleLogin}
            className="w-full bg-[#EAB69B] hover:bg-[#D49B80] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Simplified Availability Tab
function AvailabilityTabSimple() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTimeHour, setStartTimeHour] = useState("09");
  const [startTimeMinute, setStartTimeMinute] = useState("00");
  const [endTimeHour, setEndTimeHour] = useState("10");
  const [endTimeMinute, setEndTimeMinute] = useState("00");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch available slots
  const { 
    data: availableSlots = [], 
    isLoading: slotsLoading 
  } = useQuery({
    queryKey: ['/api/admin/slots'],
    queryFn: async () => {
      const res = await fetch('/api/admin/slots', {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch slots");
      }
      return res.json();
    }
  });
  
  // Fetch services for dropdown
  const { 
    data: services = [], 
    isLoading: servicesLoading 
  } = useQuery({
    queryKey: ['/api/admin/services'],
    queryFn: async () => {
      const res = await fetch('/api/admin/services', {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      return res.json();
    }
  });

  // Add state for session type and service selection
  const [sessionType, setSessionType] = useState("individual");
  const [selectedService, setSelectedService] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(1);
  
  // Create a simple direct fetch mutation
  const createSlot = async () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }
    
    const startTime = `${startTimeHour}:${startTimeMinute}`;
    const endTime = `${endTimeHour}:${endTimeMinute}`;
    
    try {
      const res = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        },
        body: JSON.stringify({
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime,
          endTime,
          isBooked: false,
          sessionType: sessionType,
          serviceId: selectedService ? parseInt(selectedService) : null,
          maxParticipants: sessionType === "group" ? maxParticipants : 1
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create slot");
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/slots'] });
      toast({
        title: "Success",
        description: "Availability slot created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create slot",
        variant: "destructive"
      });
    }
  };
  
  const deleteSlot = async (id) => {
    try {
      const res = await fetch(`/api/admin/slots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete slot");
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/slots'] });
      toast({
        title: "Success",
        description: "Availability slot deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete slot",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Availability</CardTitle>
          <CardDescription>Create a new time slot for appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <div className="flex justify-center overflow-auto max-w-full">
                <div className="min-w-[300px] border rounded-md p-3">
                  <Calendar 
                    mode="single" 
                    selected={selectedDate} 
                    onSelect={setSelectedDate} 
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <div className="flex space-x-2">
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={startTimeHour}
                    onChange={(e) => setStartTimeHour(e.target.value)}
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <option key={hour} value={hour.toString().padStart(2, '0')}>
                        {hour.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className="flex items-center">:</span>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={startTimeMinute}
                    onChange={(e) => setStartTimeMinute(e.target.value)}
                  >
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <div className="flex space-x-2">
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={endTimeHour}
                    onChange={(e) => setEndTimeHour(e.target.value)}
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <option key={hour} value={hour.toString().padStart(2, '0')}>
                        {hour.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className="flex items-center">:</span>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={endTimeMinute}
                    onChange={(e) => setEndTimeMinute(e.target.value)}
                  >
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Session Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
              >
                <option value="individual">Individual (1-on-1)</option>
                <option value="group">Group Session</option>
              </select>
            </div>
            
            {sessionType === "group" && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Maximum Participants</label>
                <input
                  type="number"
                  min="2"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 2)}
                />
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Service (Optional)</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">Any Service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.title}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to make this slot available for any service
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-[#EAB69B] hover:bg-[#D49B80] text-white"
            onClick={createSlot}
          >
            Add Availability Slot
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Slots</CardTitle>
          <CardDescription>Manage your available appointment slots</CardDescription>
        </CardHeader>
        <CardContent>
          {slotsLoading ? (
            <AvailabilitySlotsSkeleton />
          ) : availableSlots.length > 0 ? (
            <div className="space-y-3">
              {availableSlots.map(slot => {
                // Find service name if serviceId is present
                const serviceName = slot.serviceId 
                  ? services.find(s => s.id === slot.serviceId)?.title || "Unknown Service" 
                  : "Any Service";
                
                return (
                  <div key={slot.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{format(new Date(slot.date), 'MMM d, yyyy')}</p>
                      <p className="text-sm text-neutral-500">{slot.startTime} - {slot.endTime}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          slot.sessionType === "individual" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {slot.sessionType === "individual" ? "Individual" : "Group"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                          {serviceName}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteSlot(slot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-neutral-500">
              No available slots found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Simplified Discount Codes Tab
function DiscountCodesTabSimple() {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch discount codes
  const { 
    data: discountCodes = [], 
    isLoading: codesLoading 
  } = useQuery({
    queryKey: ['/api/admin/discount-codes'],
    queryFn: async () => {
      const res = await fetch('/api/admin/discount-codes', {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch discount codes");
      }
      return res.json();
    }
  });
  
  const createDiscountCode = async () => {
    if (!code || !discountValue || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Use our new simplified endpoint with minimal fields
      const simpleData = {
        code,
        description,
        discountType,
        discountValue: discountValue.toString()
      };
      
      console.log('Sending simplified discount code data:', simpleData);
      
      const res = await fetch('/api/admin/discount-codes-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        },
        body: JSON.stringify(simpleData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Discount code error:', errorData);
        throw new Error(
          errorData.message || 
          (errorData.errors && errorData.errors.length > 0 ? 
           errorData.errors.map(e => e.message).join(', ') : 
           "Failed to create discount code")
        );
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      toast({
        title: "Success",
        description: "Discount code created successfully"
      });
      
      // Reset form
      setCode("");
      setDescription("");
      setDiscountValue("");
    } catch (error) {
      console.error('Error creating discount code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create discount code",
        variant: "destructive"
      });
    }
  };
  
  const deleteDiscountCode = async (id) => {
    try {
      const res = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete discount code");
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      toast({
        title: "Success",
        description: "Discount code deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete discount code",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Discount Code</CardTitle>
          <CardDescription>Create a new discount code for your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code*</label>
              <Input 
                value={code} 
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME10" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description*</label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of this discount code" 
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {discountType === "percentage" ? "Percentage (%)*" : "Amount ($)*"}
                </label>
                <Input 
                  type="number"
                  value={discountValue} 
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "10" : "5.00"}
                  min={0}
                  max={discountType === "percentage" ? 100 : undefined}
                  step={discountType === "percentage" ? 1 : 0.01}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-[#EAB69B] hover:bg-[#D49B80] text-white"
            onClick={createDiscountCode}
          >
            Create Discount Code
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Discount Codes</CardTitle>
          <CardDescription>Manage your discount codes</CardDescription>
        </CardHeader>
        <CardContent>
          {codesLoading ? (
            <DiscountCodesSkeleton />
          ) : discountCodes.length > 0 ? (
            <div className="space-y-3">
              {discountCodes.map(discount => (
                <div key={discount.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{discount.code}</p>
                    <p className="text-sm text-neutral-500">
                      {discount.discountType === "percentage" 
                        ? `${discount.discountValue}% off` 
                        : `$${discount.discountValue} off`}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteDiscountCode(discount.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-neutral-500">
              No discount codes found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// SettingsTab Component
function ServicesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state for new or editing service
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [serviceActive, setServiceActive] = useState(true);
  const [sessionType, setSessionType] = useState("one-on-one");
  const [maxParticipants, setMaxParticipants] = useState(1);
  const [offerIndividual, setOfferIndividual] = useState(true);
  const [offerGroup, setOfferGroup] = useState(false);
  
  const { 
    data: services = [], 
    isLoading: servicesLoading,
    refetch: refetchServices 
  } = useQuery({
    queryKey: ['/api/admin/services'],
    queryFn: async () => {
      const res = await fetch('/api/admin/services', {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      return res.json();
    }
  });
  
  const resetForm = () => {
    setServiceTitle("");
    setServiceDescription("");
    setServicePrice("");
    setServiceDuration("");
    setServiceActive(true);
    setSessionType("one-on-one");
    setMaxParticipants(1);
    setOfferIndividual(true);
    setOfferGroup(false);
    setEditingService(null);
  };
  
  const openCreateDialog = () => {
    resetForm();
    setIsCreating(true);
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (service) => {
    setEditingService(service);
    setServiceTitle(service.title);
    setServiceDescription(service.description);
    setServicePrice(service.price.toString());
    setServiceDuration(service.duration?.toString() || "60");
    // Default to true if active is undefined, null, or true
    setServiceActive(service.active !== false);
    // Set session type and max participants with defaults
    setSessionType(service.sessionType || "one-on-one");
    setMaxParticipants(service.maxParticipants || 1);
    // Set offer types with defaults
    setOfferIndividual(service.offerIndividual !== false);
    setOfferGroup(service.offerGroup === true);
    setIsCreating(false);
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };
  
  const handleSaveService = async () => {
    // Validate form
    if (!serviceTitle.trim()) {
      toast({
        title: "Error",
        description: "Service title is required",
        variant: "destructive"
      });
      return;
    }
    
    if (isNaN(parseFloat(servicePrice)) || parseFloat(servicePrice) <= 0) {
      toast({
        title: "Error",
        description: "Service price must be a valid number greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    const serviceData = {
      title: serviceTitle,
      description: serviceDescription,
      price: parseFloat(servicePrice),
      duration: parseInt(serviceDuration || "60", 10),
      active: serviceActive,
      sessionType: sessionType,
      maxParticipants: parseInt(maxParticipants, 10)
    };
    
    try {
      let res;
      
      if (isCreating) {
        // Create new service
        res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
          },
          body: JSON.stringify(serviceData)
        });
      } else {
        // Update existing service
        res = await fetch(`/api/admin/services/${editingService.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
          },
          body: JSON.stringify(serviceData)
        });
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save service");
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      toast({
        title: "Success",
        description: isCreating ? "Service created successfully" : "Service updated successfully"
      });
      
      closeDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save service",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteService = async (serviceId) => {
    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete service");
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      toast({
        title: "Success",
        description: "Service deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive"
      });
    }
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium font-['Playfair_Display']">Services Management</h2>
          <p className="text-neutral-600">Manage your consultation services and pricing</p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-[#EAB69B] hover:bg-[#D49B80] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Service
        </Button>
      </div>
      
      {servicesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServicesSkeleton />
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <Card key={service.id} className={`${service.active === false ? 'opacity-70' : ''}`}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div className="truncate">{service.title}</div>
                  {service.active === false ? (
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                      Inactive
                    </span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Service details and pricing
                </CardDescription>
                <div className="mt-2 flex flex-col space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#EAB69B]">{formatPrice(service.price)}</span>
                    <span className="text-neutral-500">{service.duration || 60} min</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full mr-1">
                      {service.sessionType === 'one-on-one' ? 'One-on-One' : 
                       service.sessionType === 'group' ? 'Group' : 
                       service.sessionType === 'event' ? 'Event' : 
                       'One-on-One'}
                    </span>
                    {(service.sessionType === 'group' || service.sessionType === 'event') && (
                      <span className="text-xs text-neutral-500">
                        Max: {service.maxParticipants || 1}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 line-clamp-3">
                  {service.description || 'No description provided.'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openEditDialog(service)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Service</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{service.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteService(service.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-neutral-100 p-3 mb-4">
              <ClipboardCheck className="h-6 w-6 text-neutral-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Services Found</h3>
            <p className="text-neutral-500 mb-6 max-w-md">
              You haven't created any services yet. Add your first service to start accepting bookings.
            </p>
            <Button
              onClick={openCreateDialog}
              className="bg-[#EAB69B] hover:bg-[#D49B80] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Service
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Service Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Create New Service" : "Edit Service"}
            </DialogTitle>
            <DialogDescription>
              {isCreating 
                ? "Add a new service that clients can book" 
                : "Update the details of this service"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="serviceTitle">Service Title</Label>
              <Input 
                id="serviceTitle"
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                placeholder="e.g., Kundalini Awakening Consultation"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceDescription">Description</Label>
              <Textarea 
                id="serviceDescription"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Describe what this service includes..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="servicePrice">Price (£)</Label>
                <Input 
                  id="servicePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  placeholder="120.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serviceDuration">Duration (minutes)</Label>
                <Input 
                  id="serviceDuration"
                  type="number"
                  min="15"
                  step="15"
                  value={serviceDuration}
                  onChange={(e) => setServiceDuration(e.target.value)}
                  placeholder="60"
                />
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="sessionType">Session Type</Label>
                <select 
                  id="sessionType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                >
                  <option value="one-on-one">One-on-One Session</option>
                  <option value="group">Group Session</option>
                  <option value="event">Event</option>
                </select>
              </div>
              
              {(sessionType === 'group' || sessionType === 'event') && (
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Maximum Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="2"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    placeholder="10"
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="serviceActive"
                  checked={serviceActive}
                  onCheckedChange={setServiceActive}
                />
                <Label htmlFor="serviceActive">Active</Label>
                <span className="text-xs text-neutral-500 ml-2">
                  (Only active services can be booked)
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeDialog}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveService}
              className="bg-[#EAB69B] hover:bg-[#D49B80] text-white"
            >
              {isCreating ? "Create Service" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Email settings
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  
  // Stripe settings
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeCurrency, setStripeCurrency] = useState("GBP");
  const [showStripeSecretKey, setShowStripeSecretKey] = useState(false);
  const [showStripePublicKey, setShowStripePublicKey] = useState(false);
  
  // Loading and saving states
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingStripe, setSavingStripe] = useState(false);
  
  // Fetch settings
  const { isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings', {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await res.json();
      
      // Update email settings
      setSenderEmail(data.email?.senderEmail || "");
      setSenderName(data.email?.senderName || "");
      
      // Update Stripe settings if available
      if (data.stripe) {
        setStripeSecretKey(data.stripe.secretKey || "");
        setStripePublicKey(data.stripe.publicKey || "");
        setStripeCurrency(data.stripe.currency || "GBP");
      } else {
        // If not in settings, try to get from environment
        setStripeSecretKey(process.env.STRIPE_SECRET_KEY || "");
        setStripePublicKey(process.env.VITE_STRIPE_PUBLIC_KEY || "");
      }
      
      return data;
    }
  });
  
  // Save email settings
  const saveEmailSettings = async () => {
    setSavingEmail(true);
    
    try {
      const res = await fetch('/api/admin/settings/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        },
        body: JSON.stringify({
          senderEmail,
          senderName
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to save email settings");
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Success",
        description: "Email settings saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save email settings",
        variant: "destructive"
      });
    } finally {
      setSavingEmail(false);
    }
  };
  
  // Save Stripe settings
  const saveStripeSettings = async () => {
    setSavingStripe(true);
    
    try {
      if (!stripeSecretKey.startsWith('sk_') || !stripePublicKey.startsWith('pk_')) {
        throw new Error("Invalid API keys format. Secret key should start with 'sk_' and public key with 'pk_'");
      }
      
      const res = await fetch('/api/admin/settings/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        },
        body: JSON.stringify({
          secretKey: stripeSecretKey,
          publicKey: stripePublicKey,
          currency: stripeCurrency
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save Stripe settings");
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Success",
        description: "Stripe settings saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save Stripe settings",
        variant: "destructive"
      });
    } finally {
      setSavingStripe(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Email Settings Card (Twilio SendGrid) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings (Twilio SendGrid)
          </CardTitle>
          <CardDescription>Configure your Twilio SendGrid email notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingSettings ? (
            <div className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-40 mt-8" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Sender Email Address</Label>
                <Input
                  id="senderEmail"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="noreply@alignwithsoulitude.co.uk"
                />
                <p className="text-xs text-neutral-500">
                  The email address that will appear in the From field of sent emails
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Align with Soulitude"
                />
                <p className="text-xs text-neutral-500">
                  The name that will appear in the From field of sent emails
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-[#EAB69B] hover:bg-[#D49B80] text-white"
            onClick={saveEmailSettings}
            disabled={savingEmail || isLoadingSettings}
          >
            {savingEmail ? "Saving..." : "Save Email Settings"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Stripe Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center h-5 w-5 justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm-1.35 17.65c-3.35 0-6.07-1.225-6.07-3.35 0-.433.15-.833.433-1.167.867 1.65 2.95 2.45 5.637 2.45 2.7 0 4.767-.8 5.633-2.45.284.334.434.734.434 1.167.001 2.125-2.751 3.35-6.068 3.35zm.684-4.9c-2.55 0-4.634-1.084-4.634-2.45 0-.383.133-.75.383-1.05C7.75 10.25 9.267 10.7 11.35 10.7c2.067 0 3.583-.45 4.25-1.45.25.3.384.667.384 1.05 0 1.366-2.083 2.45-4.65 2.45zm-.017-4.95c-1.617 0-2.917-.7-2.917-1.55 0-.867 1.3-1.55 2.917-1.55 1.616 0 2.917.683 2.917 1.55 0 .85-1.3 1.55-2.917 1.55z"/>
              </svg>
            </div>
            Stripe Settings
          </CardTitle>
          <CardDescription>Configure your Stripe payment settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingSettings ? (
            <div className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-40 mt-8" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="stripeSecretKey">Secret Key</Label>
                <div className="flex">
                  <Input
                    id="stripeSecretKey"
                    type={showStripeSecretKey ? "text" : "password"}
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
                    placeholder="sk_xxxxx"
                    className="flex-1 rounded-r-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStripeSecretKey(!showStripeSecretKey)}
                    className="rounded-l-none"
                  >
                    {showStripeSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-neutral-500">
                  Your Stripe secret key (starts with sk_)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripePublicKey">Public Key</Label>
                <div className="flex">
                  <Input
                    id="stripePublicKey"
                    type={showStripePublicKey ? "text" : "password"}
                    value={stripePublicKey}
                    onChange={(e) => setStripePublicKey(e.target.value)}
                    placeholder="pk_xxxxx"
                    className="flex-1 rounded-r-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStripePublicKey(!showStripePublicKey)}
                    className="rounded-l-none"
                  >
                    {showStripePublicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-neutral-500">
                  Your Stripe publishable key (starts with pk_)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripeCurrency">Default Currency</Label>
                <select
                  id="stripeCurrency"
                  value={stripeCurrency}
                  onChange={(e) => setStripeCurrency(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <p className="text-xs text-neutral-500">
                  The default currency for payments
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-[#EAB69B] hover:bg-[#D49B80] text-white"
            onClick={saveStripeSettings}
            disabled={savingStripe || isLoadingSettings}
          >
            {savingStripe ? "Saving..." : "Save Stripe Settings"}
          </Button>
        </CardFooter>
      </Card>

      {/* Password Change functionality has been removed */}
    </div>
  );
}

function BookingsTabSimple() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { 
    data: consultations = [], 
    isLoading: consultationsLoading 
  } = useQuery({
    queryKey: ['/api/admin/consultations'],
    queryFn: async () => {
      const res = await fetch('/api/admin/consultations', {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch consultations");
      }
      const data = await res.json();
      console.log("Fetched consultations:", data);
      return data;
    }
  });
  
  // Fetch services for display names
  const { data: services = [] } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const res = await fetch('/api/services');
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      return res.json();
    }
  });
  
  // Helper function to get service name by ID
  const getServiceNameById = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.title : `Service #${serviceId}`;
  };
  
  const handleResendConfirmationEmail = async (consultation) => {
    try {
      // First, get the service details
      const serviceRes = await fetch(`/api/services/${consultation.serviceId}`);
      if (!serviceRes.ok) {
        throw new Error("Failed to fetch service details");
      }
      const service = await serviceRes.json();
      
      // Get the slot details if not already included
      let slot = consultation.slot;
      if (!slot && consultation.slotId) {
        const slotRes = await fetch(`/api/admin/slots/${consultation.slotId}`, {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
          }
        });
        if (slotRes.ok) {
          slot = await slotRes.json();
        }
      }
      
      if (!slot) {
        toast({
          title: "Error",
          description: "Could not find booking time slot details",
          variant: "destructive"
        });
        return;
      }
      
      // Send the email
      const res = await fetch('/api/admin/resend-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('adminData') || '{}').timestamp}`
        },
        body: JSON.stringify({
          consultationId: consultation.id,
          email: consultation.email,
          name: consultation.name,
          service: {
            title: service.title,
            price: service.price
          },
          date: slot.date,
          time: `${slot.startTime} - ${slot.endTime}`,
          finalPrice: service.price // Simple version with no discounts
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to resend email");
      }
      
      toast({
        title: "Success",
        description: "Confirmation email resent successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend confirmation email",
        variant: "destructive"
      });
    }
  };
  
  // Generate calendar days for current month view
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Create calendar grid (6 weeks x 7 days)
    const calendarDays = [];
    
    // Previous month days to fill the first week
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, -i + firstDayOfWeek - 1);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        consultations: []
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Find consultations for this day
      const dayConsultations = consultations.filter(c => 
        c.slot && c.slot.date === dateStr
      );
      
      calendarDays.push({
        date,
        isCurrentMonth: true,
        consultations: dayConsultations
      });
    }
    
    // Next month days to complete the grid (max 6 rows of 7 days = 42 days)
    const remainingDays = 42 - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        consultations: []
      });
    }
    
    return calendarDays;
  };
  
  // Get calendar days with consultations
  const calendarDays = generateCalendarDays();
  
  // Group calendar days into weeks
  const calendarWeeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    calendarWeeks.push(calendarDays.slice(i, i + 7));
  }
  
  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-medium font-['Playfair_Display']">Upcoming Consultations</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant={viewMode === "list" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-[#EAB69B] hover:bg-[#D49B80] text-white" : ""}
          >
            List View
          </Button>
          <Button 
            variant={viewMode === "calendar" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("calendar")}
            className={viewMode === "calendar" ? "bg-[#EAB69B] hover:bg-[#D49B80] text-white" : ""}
          >
            Calendar View
          </Button>
        </div>
      </div>
      
      {consultationsLoading ? (
        <BookingsSkeleton viewMode={viewMode} />
      ) : viewMode === "list" ? (
        // List View
        <Card>
          <CardContent className="pt-6">
            {consultations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map(consultation => (
                    <TableRow key={consultation.id}>
                      <TableCell>
                        {consultation.slot?.date && (
                          <>
                            {format(new Date(consultation.slot.date), 'MMM d, yyyy')}
                            <br />
                            <span className="text-sm text-neutral-500">
                              {consultation.slot.startTime} - {consultation.slot.endTime}
                            </span>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {consultation.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{consultation.email}</div>
                        <div className="text-sm text-neutral-500">{consultation.phone}</div>
                      </TableCell>
                      <TableCell>
                        {getServiceNameById(consultation.serviceId)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          consultation.status === 'confirmed' || consultation.status === 'paid' ? 'bg-green-100 text-green-800' :
                          consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          consultation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                          onClick={() => handleResendConfirmationEmail(consultation)}
                        >
                          Resend Email
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-neutral-500">
                No consultations found
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Calendar View
        <Card>
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                  <CalendarDays className="h-4 w-4 rotate-90" />
                </Button>
                <h3 className="text-lg font-medium">{format(currentMonth, 'MMMM yyyy')}</h3>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <CalendarDays className="h-4 w-4 -rotate-90" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-w-[700px] overflow-x-auto">
              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-sm font-medium">
                <div className="py-2">Sun</div>
                <div className="py-2">Mon</div>
                <div className="py-2">Tue</div>
                <div className="py-2">Wed</div>
                <div className="py-2">Thu</div>
                <div className="py-2">Fri</div>
                <div className="py-2">Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div 
                    key={index} 
                    className={`min-h-24 p-1 border rounded-md ${
                      day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                    } ${day.date.getDay() === 0 || day.date.getDay() === 6 ? 'bg-gray-50' : ''}`}
                  >
                    <div className="text-right p-1 font-medium text-sm">
                      {format(day.date, 'd')}
                    </div>
                    <div className="space-y-1">
                      {day.consultations.map(consultation => (
                        <div 
                          key={consultation.id} 
                          className={`text-xs px-1 py-0.5 rounded truncate ${
                            consultation.status === 'confirmed' || consultation.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                          title={`${consultation.name} - ${getServiceNameById(consultation.serviceId)}`}
                        >
                          {consultation.slot.startTime} - {consultation.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}