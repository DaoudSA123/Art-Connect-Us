import React, { useRef, useEffect } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const About = () => {
  const [contentRef, contentVisible] = useScrollAnimation(0.2);
  const [imageRef, imageVisible] = useScrollAnimation(0.3);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Video autoplay prevented:', error);
      });
    }
  }, []);

  return (
    <section className="py-28 md:py-32 px-6 md:px-8 bg-luxury-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* Content */}
          <div 
            ref={contentRef} 
            className={`space-y-7 ${contentVisible ? 'fade-in-left visible' : 'fade-in-left'}`}
          >
            <div className="mb-7">
              <span className="text-gray-300/80 text-xs md:text-sm font-mono font-medium uppercase tracking-widest">
                /// OUR STORY
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-street font-bold text-white leading-tight">
              ITS US
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
            
            <div className="flex flex-wrap gap-8 pt-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-mono font-bold text-white mb-2">5+</div>
                <div className="text-xs md:text-sm text-gray-400/80 font-mono font-medium uppercase tracking-widest">/// YEARS</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-mono font-bold text-white mb-2">10K+</div>
                <div className="text-xs md:text-sm text-gray-400/80 font-mono font-medium uppercase tracking-widest">/// FAM</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-mono font-bold text-white mb-2">100%</div>
                <div className="text-xs md:text-sm text-gray-400/80 font-mono font-medium uppercase tracking-widest">/// REAL</div>
              </div>
            </div>
          </div>
          
          {/* Video */}
          <div 
            ref={imageRef} 
            className={`relative ${imageVisible ? 'fade-in-right visible' : 'fade-in-right'}`}
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
