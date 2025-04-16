import { Toaster } from "@/components/ui/toaster";
import { Route, Switch } from "wouter";
import Home from "@/pages/Home";
import Booking from "@/pages/Booking";
import NotFound from "@/pages/not-found";
import PrivacyPolicy from "@/pages/PrivacyPolicy"; // Added
import TermsOfService from "@/pages/TermsOfService"; // Added
import CookiePolicy from "@/pages/CookiePolicy"; // Added

export default function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/booking" component={Booking} />
        <Route path="/privacy-policy" component={PrivacyPolicy} /> {/* Added */}
        <Route path="/terms-of-service" component={TermsOfService} /> {/* Added */}
        <Route path="/cookie-policy" component={CookiePolicy} /> {/* Added */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

// Dummy components for policy pages (replace with actual content)
const PrivacyPolicy = () => <div>Privacy Policy Placeholder</div>;
const TermsOfService = () => <div>Terms of Service Placeholder</div>;
const CookiePolicy = () => <div>Cookie Policy Placeholder</div>;