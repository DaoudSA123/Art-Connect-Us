import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Hero from './components/Hero.jsx';
import ProductShowcase from './components/ProductShowcase.jsx';
import About from './components/About.jsx';
import Footer from './components/Footer.jsx';
import ProductPage from './components/ProductPage.jsx';
import CartPage from './components/CartPage.jsx';
import CheckoutSuccess from './components/CheckoutSuccess.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import CartIcon from './components/CartIcon.jsx';
import NewsletterPopup from './components/NewsletterPopup.jsx';
import { CartProvider } from './contexts/CartContext.jsx';

const App = () => {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  return (
    <CartProvider>
      <Router>
        <div className="App min-h-screen bg-luxury-black text-white denim-texture">
          <CartIcon isContactFormOpen={isContactFormOpen} />
          <NewsletterPopup />
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <ProductShowcase />
                <About />
                <Footer 
                  isContactFormOpen={isContactFormOpen}
                  setIsContactFormOpen={setIsContactFormOpen}
                />
              </>
            } />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
