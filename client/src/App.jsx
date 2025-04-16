
import { Toaster } from "@/components/ui/toaster";
import { Route, Switch } from "wouter";
import Home from "@/pages/Home";
import Booking from "@/pages/Booking";
import NotFound from "@/pages/not-found";
import PrivacyPolicy from "@/pages/policies/PrivacyPolicy";
import TermsOfService from "@/pages/policies/TermsOfService";
import CookiePolicy from "@/pages/policies/CookiePolicy";

export default function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/booking" component={Booking} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/cookie-policy" component={CookiePolicy} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}
