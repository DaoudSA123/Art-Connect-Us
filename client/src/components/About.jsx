import React, { useRef, useEffect, useState } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const About = () => {
  const [contentRef, contentVisible] = useScrollAnimation(0.2);
  const [imageRef, imageVisible] = useScrollAnimation(0.3);
  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Video autoplay prevented:', error);
      });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section 
      className="px-6 md:px-8 bg-luxury-black"
      style={{ 
        paddingTop: isMobile ? '7rem' : '8rem',
        paddingBottom: isMobile ? '2rem' : '8rem'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div 
          className="grid grid-cols-1 lg:grid-cols-2 items-center"
          style={{ 
            gap: isMobile ? '0' : window.innerWidth >= 1024 ? '4rem' : '2rem'
          }}
        >
          {/* Content */}
          <div 
            ref={contentRef} 
            className={`space-y-7 ${contentVisible ? 'fade-in-left visible' : 'fade-in-left'}`}
            style={{ marginBottom: isMobile ? '-1.5rem' : '0' }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-street font-bold text-white leading-tight mb-7">
              IT'S US
            </h2>
            
            <div className="flex items-center mb-9">
              <div className="w-20 md:w-24 h-[1px] bg-gray-400/60"></div>
              <div className="mx-5 md:mx-6 w-2.5 h-2.5 bg-gray-400/80 rotate-45"></div>
              <div className="w-20 md:w-24 h-[1px] bg-gray-400/60"></div>
            </div>
            
            <div className="space-y-5 text-gray-300/90 text-base md:text-lg font-street font-medium leading-relaxed">
              <p>
                UNLEASHING A SOURCE OF ART TO CONNECT US. THIS IS WHO WE ARE. WE DON'T FOLLOW TRENDS, WE CREATE THEM.
              </p>
              
              <p>
                EVERY PIECE IS US. EVERY DROP IS OUR STATEMENT.
              </p>
              
              <p>
                AUTHENTIC. RAW. UNCOMPROMISING. THIS IS US, AND THIS IS OUR MOVEMENT.
              </p>
            </div>
            
            
          </div>
          
          {/* Video */}
          <div 
            ref={imageRef} 
            className={`relative ${imageVisible ? 'fade-in-right visible' : 'fade-in-right'}`}
            style={{ 
              marginTop: isMobile ? '-6rem' : '0',
              marginBottom: isMobile ? '-2rem' : '0',
              overflow: 'hidden'
            }}
          >
            <video 
              ref={videoRef}
              src="/copy_13656D32-4C43-4D91-8093-FF50253FC1C0.mov"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-contain"
              style={{ transform: 'rotate(90deg)', width: '500px', height: '500px' }}
              onLoadedData={(e) => {
                e.target.play().catch(() => {});
              }}
              onEnded={(e) => {
                e.target.play();
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
