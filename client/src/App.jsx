
import { Toaster } from "@/components/ui/toaster";
import { Route, Switch } from "wouter";
import { useEffect, useState, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { preloadResources } from "@/lib/preloader";

// Import the main pages normally since they're critical
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { CurrencyProvider } from "./hooks/useCurrency";

// Lazy load non-critical pages to improve initial load time
const Booking = lazy(() => import("@/pages/Booking"));
const BookingConfirmation = lazy(() => import("@/pages/BookingConfirmation"));
const AdminSimplified = lazy(() => import("@/pages/AdminSimplified"));
const PrivacyPolicy = lazy(() => import("@/pages/policies/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/policies/TermsOfService"));
const CookiePolicy = lazy(() => import("@/pages/policies/CookiePolicy"));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F1F1F1]">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-[#EAB69B] mx-auto mb-4" />
      <p className="text-neutral-600 font-['Raleway']">Loading...</p>
    </div>
  </div>
);

export default function App() {
  const [isPreloading, setIsPreloading] = useState(true);

  useEffect(() => {
    // Preload key resources in the background
    const preloadKey = async () => {
      // Define key resources to preload
      await preloadResources({
        // Preload key testimonial images
        images: [
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
          "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
        ],
      });
      
      setIsPreloading(false);
    };
    
    preloadKey();
    
    return () => {
      // Clean up if needed
    };
  }, []);

  return (
    <CurrencyProvider>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/booking" component={Booking} />
          <Route path="/booking-confirmation" component={BookingConfirmation} />
          <Route path="/admin" component={AdminSimplified} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/cookie-policy" component={CookiePolicy} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      <Toaster />
    </CurrencyProvider>
  );
}
