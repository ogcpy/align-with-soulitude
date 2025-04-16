import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F1F1F1]">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-[#EAB69B] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Page Not Found</h2>
        <p className="text-neutral-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-[#EAB69B] text-white hover:bg-opacity-90">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}