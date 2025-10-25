import React from 'react';

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <span className="text-dark-maroon text-sm font-mono font-medium uppercase tracking-widest">
            /// EST. 2024
          </span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-street font-bold mb-6 animate-fade-in">
          <span className="text-white">ART</span>
          <br />
          <span className="text-dark-maroon">CONNECT US</span>
        </h1>
        
        <div className="flex items-center justify-center mb-8 animate-slide-up">
          <div className="w-20 h-0.5 bg-dark-maroon"></div>
          <div className="mx-6 w-3 h-3 bg-dark-maroon rotate-45"></div>
          <div className="w-20 h-0.5 bg-dark-maroon"></div>
        </div>
        
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-street font-medium animate-slide-up">
          PREMIUM DROPS. AUTHENTIC VIBES. STREET READY.
        </p>
        
        <button className="bg-dark-navy hover:bg-dark-maroon text-white font-street font-bold py-4 px-8 rounded-none border-2 border-dark-navy hover:border-dark-maroon transition-all duration-300 transform hover:scale-105 uppercase tracking-widest text-lg animate-slide-up">
          /// SHOP DROP
        </button>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-dark-maroon rounded-full flex justify-center">
          <div className="w-1 h-3 bg-dark-maroon rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
