import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from './Footer';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      fetch(`${API_BASE}/stripe/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSessionData(data.session);
          } else {
            setError(data.message || 'Failed to verify payment');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching session:', err);
          setError('Failed to verify payment session');
          setLoading(false);
        });
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-denim-blue mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg font-street">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-luxury-black text-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-street font-bold uppercase tracking-widest mb-6">
            Payment Verification Failed
          </h1>
          <p className="text-gray-400 text-lg mb-8 font-street">
            {error}
          </p>
          <button
            onClick={() => navigate('/cart')}
            className="bg-denim-blue hover:bg-denim-blue/90 text-white font-street font-bold py-4 px-8 rounded-none transition-all duration-300 transform hover:scale-105 border uppercase tracking-widest text-lg mr-4"
          >
            Back to Cart
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-dark-navy hover:bg-dark-navy/90 text-white font-street font-bold py-4 px-8 rounded-none transition-all duration-300 transform hover:scale-105 border uppercase tracking-widest text-lg"
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-luxury-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-street font-bold uppercase tracking-widest mb-6">
          Payment Successful!
        </h1>
        <p className="text-gray-400 text-lg mb-8 font-street">
          Thank you for your purchase. We'll send you a confirmation email shortly.
        </p>
        {sessionData && (
          <div className="bg-dark-navy border border-gray-700 p-6 mb-8 max-w-md mx-auto">
            <p className="text-sm text-gray-400 mb-2 font-street uppercase tracking-widest">Order Total</p>
            <p className="text-2xl font-mono font-bold">
              ${sessionData.amount_total.toFixed(2)} {sessionData.currency.toUpperCase()}
            </p>
            {sessionData.customer_email && (
              <p className="text-xs text-gray-500 mt-3 font-street">
                Confirmation sent to: {sessionData.customer_email}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-denim-blue hover:bg-denim-blue/90 text-white font-street font-bold py-4 px-8 rounded-none transition-all duration-300 transform hover:scale-105 border uppercase tracking-widest text-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;

