import React from 'react';
import { Switch, Route, Link } from 'wouter';
import { QueryClientProvider } from './hooks/useQueryClient';

// Sample pages - you'll replace these with your actual pages
const Home = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-4xl font-bold mb-6">Align with Soulitude</h1>
    <p className="mb-4">Welcome to your wellness journey.</p>
    <div className="flex gap-4">
      <Link href="/services">
        <a className="px-4 py-2 bg-[#EAB69B] hover:bg-[#D49B80] text-white rounded">
          Our Services
        </a>
      </Link>
      <Link href="/booking">
        <a className="px-4 py-2 bg-[#EAB69B] hover:bg-[#D49B80] text-white rounded">
          Book Consultation
        </a>
      </Link>
    </div>
  </div>
);

const Services = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">Our Services</h1>
    <p>Loading services from API...</p>
  </div>
);

const NotFound = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">Page Not Found</h1>
    <p>The page you are looking for doesn't exist.</p>
    <Link href="/">
      <a className="mt-4 inline-block px-4 py-2 bg-[#EAB69B] hover:bg-[#D49B80] text-white rounded">
        Go Home
      </a>
    </Link>
  </div>
);

function App() {
  return (
    <QueryClientProvider>
      <div className="min-h-screen bg-[#F1F1F1]">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/">
              <a className="text-2xl font-bold text-[#EAB69B]">Align with Soulitude</a>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/services">
                <a className="hover:text-[#EAB69B]">Services</a>
              </Link>
              <Link href="/booking">
                <a className="hover:text-[#EAB69B]">Book Consultation</a>
              </Link>
              <Link href="/account">
                <a className="hover:text-[#EAB69B]">Account</a>
              </Link>
            </div>
          </div>
        </nav>

        <main>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/services" component={Services} />
            <Route component={NotFound} />
          </Switch>
        </main>

        <footer className="bg-white mt-12 py-8">
          <div className="container mx-auto px-4">
            <p className="text-center text-gray-600">
              © {new Date().getFullYear()} Align with Soulitude. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;