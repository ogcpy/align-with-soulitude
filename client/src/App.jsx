import { Toaster } from "@/components/ui/toaster";
import { Route, Switch } from "wouter";
import Home from "@/pages/Home";
import Booking from "@/pages/Booking";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/booking" component={Booking} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}