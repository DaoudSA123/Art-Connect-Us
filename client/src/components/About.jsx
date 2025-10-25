import React from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const About = () => {
  const [contentRef, contentVisible] = useScrollAnimation(0.2);
  const [imageRef, imageVisible] = useScrollAnimation(0.3);

  return (
    <section className="py-20 px-4 bg-luxury-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div 
            ref={contentRef} 
            className={`space-y-6 ${contentVisible ? 'fade-in-left visible' : 'fade-in-left'}`}
          >
            <div className="mb-6">
              <span className="text-dark-maroon text-sm font-mono font-medium uppercase tracking-widest">
                /// OUR STORY
              </span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-street font-bold text-white">
              STREET ROOTS
            </h2>
            
            <div className="flex items-center mb-8">
              <div className="w-16 h-0.5 bg-dark-maroon"></div>
              <div className="mx-4 w-2 h-2 bg-dark-maroon rotate-45"></div>
              <div className="w-16 h-0.5 bg-dark-maroon"></div>
            </div>
            
            <div className="space-y-4 text-gray-300 text-lg font-street font-medium">
              <p>
                BORN FROM THE STREETS. BUILT FOR THE CULTURE. WE DON'T FOLLOW TRENDS - WE CREATE THEM.
              </p>
              
              <p>
                EVERY PIECE TELLS A STORY. EVERY DROP IS A STATEMENT. FROM THE BLOCK TO THE RUNWAY.
              </p>
              
              <p>
                AUTHENTIC. RAW. UNCOMPROMISING. THIS IS MORE THAN CLOTHING - IT'S A MOVEMENT.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6 pt-6">
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-dark-maroon">5+</div>
                <div className="text-sm text-gray-400 font-mono font-medium uppercase tracking-widest">/// YEARS</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-dark-maroon">10K+</div>
                <div className="text-sm text-gray-400 font-mono font-medium uppercase tracking-widest">/// FAM</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-dark-maroon">100%</div>
                <div className="text-sm text-gray-400 font-mono font-medium uppercase tracking-widest">/// REAL</div>
              </div>
            </div>
          </div>
          
          {/* Image */}
          <div 
            ref={imageRef} 
            className={`relative ${imageVisible ? 'fade-in-right visible' : 'fade-in-right'}`}
          >
            <div className="relative overflow-hidden rounded-none luxury-border">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop" 
                alt="Brand Story"
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-dark-maroon opacity-30"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 border-2 border-dark-navy opacity-30"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
