import { useEffect, useRef, useState } from 'react';

const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Fallback: if IntersectionObserver is not supported, make content visible
    if (!window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    // If already triggered, don't set up observer again
    if (hasTriggered.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          setIsVisible(true);
          hasTriggered.current = true;
          // Stop observing to prevent re-triggering
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return [ref, isVisible];
};

export default useScrollAnimation;
