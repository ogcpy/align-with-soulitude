import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ amount, consultationId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`,
          // Pass consultation ID as metadata
          payment_method_data: {
            metadata: {
              consultationId,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment');
        onError && onError(error);
      } else {
        // Payment successful without redirect
        onSuccess && onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An unexpected error occurred');
      onError && onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <PaymentElement />
      
      {errorMessage && (
        <div className="text-red-500 mt-4">
          <p>{errorMessage}</p>
        </div>
      )}
      
      <div className="mt-6">
        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="w-full bg-[#EAB69B] hover:bg-[#D49B80] text-white py-3 px-6 rounded-md transition duration-300 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;