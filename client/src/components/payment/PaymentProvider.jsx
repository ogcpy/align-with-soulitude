import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

// Initialize Stripe with the public key
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// The actual checkout form component
const CheckoutForm = ({ onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message || 'Payment failed. Please try again.');
      onPaymentError(error);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded
      onPaymentSuccess(paymentIntent);
    } else {
      setPaymentError('Something went wrong with your payment. Please try again.');
      onPaymentError(new Error('Payment intent status is not succeeded'));
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
          {paymentError}
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full bg-[#EAB69B] hover:bg-[#D49B80] text-white py-6 font-medium font-['Raleway']"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Complete Payment'}
      </Button>
      
      <p className="text-sm text-neutral-500 text-center mt-2 font-['Raleway']">
        Your payment is processed securely through Stripe.
      </p>
    </form>
  );
};

// The wrapper component that sets up the Stripe context
export default function PaymentProvider({ amount, consultationId, onPaymentSuccess, onPaymentError }) {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('/api/create-payment-intent', {
          method: 'POST',
          body: JSON.stringify({ 
            amount: amount,
            consultationId: consultationId,
          }),
        });
        
        if (response && response.clientSecret) {
          setClientSecret(response.clientSecret);
        } else {
          throw new Error('Failed to initialize payment');
        }
      } catch (err) {
        setError(err.message || 'Could not initialize payment. Please try again.');
        if (onPaymentError) {
          onPaymentError(err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (amount > 0 && consultationId) {
      createPaymentIntent();
    } else {
      setIsLoading(false);
      setError('Invalid payment amount or consultation');
    }
  }, [amount, consultationId, onPaymentError]);

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#EAB69B] border-t-transparent rounded-full mb-4"></div>
        <p className="text-neutral-600 font-['Raleway']">Preparing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-md space-y-4">
        <h3 className="font-medium text-lg">Payment Error</h3>
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="border-red-300 text-red-600 hover:bg-red-50"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-6 rounded-md">
        <p>Payment could not be initialized. Please try again or contact support.</p>
      </div>
    );
  }

  return (
    <div className="payment-form-container">
      <Elements 
        stripe={stripePromise} 
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#EAB69B',
              colorBackground: '#ffffff',
              colorText: '#333333',
              borderRadius: '8px',
            },
          },
        }}
      >
        <CheckoutForm
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
        />
      </Elements>
    </div>
  );
}