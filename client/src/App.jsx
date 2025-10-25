import React from 'react';
import './App.css';
import Hero from './components/Hero.jsx';
import ProductShowcase from './components/ProductShowcase.jsx';
import About from './components/About.jsx';
import Footer from './components/Footer.jsx';

const App = () => {
  return (
    <div className="App min-h-screen bg-luxury-black text-white">
      <Hero />
      <ProductShowcase />
      <About />
      <Footer />
    </div>
  );
};

export default App;
