import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";

// Initialize Stripe with the public key
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if (!stripeKey) {
  console.error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// The actual checkout form component
const CheckoutForm = ({ onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe or Elements not loaded');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      console.log('Confirming payment...');
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        setPaymentError(error.message || 'Payment failed. Please try again.');
        if (onPaymentError) onPaymentError(error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        if (onPaymentSuccess) onPaymentSuccess(paymentIntent);
      } else {
        console.error('Payment not succeeded, status:', paymentIntent?.status);
        setPaymentError('Something went wrong with your payment. Please try again.');
        if (onPaymentError) onPaymentError(new Error('Payment intent status is not succeeded'));
      }
    } catch (err) {
      console.error('Exception in payment confirmation:', err);
      setPaymentError('An unexpected error occurred. Please try again.');
      if (onPaymentError) onPaymentError(err);
    } finally {
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
export default function PaymentProviderFixed({ amount, consultationId, onPaymentSuccess, onPaymentError }) {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to create a payment intent
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        console.log('Creating payment intent for amount:', amount);
        
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: amount,
            consultationId: consultationId,
          }),
        });
        
        const data = await response.json();
        console.log('Payment intent response:', data);
        
        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error(data.message || 'Failed to create payment intent');
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err.message || 'There was an error preparing your payment. Please try again.');
        if (onPaymentError) onPaymentError(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only create a payment intent if we have a valid amount
    if (amount && parseFloat(amount) > 0) {
      createPaymentIntent();
    } else {
      console.error('Invalid amount for payment intent:', amount);
      setError('Invalid payment amount. Please try again.');
      setIsLoading(false);
      if (onPaymentError) onPaymentError(new Error('Invalid payment amount'));
    }
  }, [amount, consultationId, onPaymentError]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#EAB69B] border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-neutral-600 font-['Raleway']">Setting up secure payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
        <p className="font-medium">Payment Error</p>
        <p>{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
        <p className="font-medium">Configuration Error</p>
        <p>Stripe payment is not properly configured. Please contact support.</p>
      </div>
    );
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#EAB69B',
        colorBackground: '#FFFFFF',
        colorText: '#2D3748',
        colorDanger: '#EF4444',
        fontFamily: 'Raleway, sans-serif',
        borderRadius: '4px',
      },
    },
  };

  return (
    <div className="payment-provider">
      {clientSecret && (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <CheckoutForm 
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
          />
        </Elements>
      )}
    </div>
  );
}