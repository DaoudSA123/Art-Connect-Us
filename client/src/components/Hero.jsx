import React from 'react';

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/ACU SHOOT E/_DSF3259.jpg')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 md:px-8 max-w-5xl mx-auto">
        <div className="mb-8 md:mb-10 animate-fade-in">
          <span className="text-gray-300 text-xs md:text-sm font-mono font-medium uppercase tracking-widest opacity-80">
            /// EST. 2024
          </span>
        </div>
        
        <div className="mb-0 animate-fade-in flex justify-center" style={{ marginBottom: '-12px' }}>
          <img 
            src="/images/logo.png" 
            alt="Art Connect Us" 
            style={{
              maxWidth: '100%',
              height: 'auto',
              maxHeight: '600px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3))'
            }}
          />
        </div>
        
        <div className="flex items-center justify-center mb-2 animate-slide-up" style={{ marginTop: '-8px' }}>
          <div className="w-24 md:w-32 h-[1px] bg-gray-400/60"></div>
          <div className="mx-6 md:mx-8 w-2.5 h-2.5 bg-gray-400/80 rotate-45"></div>
          <div className="w-24 md:w-32 h-[1px] bg-gray-400/60"></div>
        </div>
        
        <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-10 md:mb-12 max-w-2xl mx-auto font-street font-medium animate-slide-up leading-relaxed tracking-wide">
          ART CONNECT US.
        </p>
        
        <button className="bg-dark-navy hover:bg-denim-blue text-white font-street font-bold py-4 md:py-5 px-10 md:px-12 rounded-none border-2 border-dark-navy hover:border-denim-blue transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 uppercase tracking-widest text-base md:text-lg animate-slide-up shadow-lg hover:shadow-xl hover:shadow-denim-blue/30 focus:outline-none focus:ring-2 focus:ring-denim-blue focus:ring-offset-2 focus:ring-offset-luxury-black">
          /// SHOP DROP
        </button>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 md:bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400/70 rounded-full flex justify-center backdrop-blur-sm bg-black/20">
          <div className="w-1 h-3 bg-gray-400/80 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
