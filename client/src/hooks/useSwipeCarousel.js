import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * iOS-smooth swipe carousel hook with momentum scrolling and rubber-banding
 * @param {number} itemCount - Total number of items in the carousel
 * @param {object} options - Configuration options
 * @returns {object} Carousel state and handlers
 */
const useSwipeCarousel = (itemCount, options = {}) => {
  const {
    threshold = 50, // Minimum swipe distance to trigger change
    resistance = 0.3, // Rubber-band resistance (0-1)
    snapDuration = 300, // Snap animation duration in ms
    momentumDecay = 0.92, // Momentum decay factor
    minVelocity = 0.1, // Minimum velocity to trigger momentum
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentXRef = useRef(0);
  const offsetXRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isHorizontalSwipeRef = useRef(false);

  // Reset position when index changes externally
  useEffect(() => {
    if (!isDraggingRef.current && !isAnimating) {
      offsetXRef.current = 0;
    }
  }, [currentIndex, isAnimating]);

  // Smooth snap animation
  const snapToIndex = useCallback((targetIndex, fromOffset = 0) => {
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= itemCount) targetIndex = itemCount - 1;
    
    setIsAnimating(true);
    const startOffset = fromOffset;
    const targetOffset = 0;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / snapDuration, 1);
      
      // Easing function (ease-out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentOffset = startOffset * (1 - easeProgress);
      
      if (containerRef.current) {
        containerRef.current.style.transform = `translateX(${currentOffset}px)`;
      }
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentIndex(targetIndex);
        offsetXRef.current = 0;
        setIsAnimating(false);
        if (containerRef.current) {
          containerRef.current.style.transform = '';
          containerRef.current.style.transition = '';
        }
      }
    };
    
    if (containerRef.current) {
      containerRef.current.style.transition = '';
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [itemCount, snapDuration]);

  // Calculate rubber-band resistance
  const applyResistance = useCallback((offset, maxOffset) => {
    if (Math.abs(offset) <= maxOffset) return offset;
    
    const excess = Math.abs(offset) - maxOffset;
    const resistanceFactor = 1 - Math.pow(excess / (maxOffset * 2), 0.5) * resistance;
    return offset > 0 
      ? maxOffset + excess * resistanceFactor
      : -maxOffset - excess * resistanceFactor;
  }, [resistance]);

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    if (itemCount <= 1) return;
    
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    currentXRef.current = touch.clientX;
    lastXRef.current = touch.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    isDraggingRef.current = true;
    isHorizontalSwipeRef.current = false;
    
    // Cancel any ongoing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setIsAnimating(false);
    if (containerRef.current) {
      containerRef.current.style.transition = '';
    }
    
    // Don't prevent default yet - wait to see if it's a horizontal swipe
  }, [itemCount]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (!isDraggingRef.current || itemCount <= 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startXRef.current;
    const deltaY = touch.clientY - startYRef.current;
    
    // Determine if this is a horizontal swipe
    if (!isHorizontalSwipeRef.current) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 15) {
        isHorizontalSwipeRef.current = true;
        e.preventDefault(); // Prevent vertical scroll only for horizontal swipes
        e.stopPropagation();
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 15) {
        // Vertical scroll detected, cancel swipe
        isDraggingRef.current = false;
        isHorizontalSwipeRef.current = false;
        return;
      } else {
        // Not enough movement yet, don't prevent default
        return;
      }
    }
    
    if (!isHorizontalSwipeRef.current) return;
    
    e.preventDefault(); // Prevent scrolling during horizontal swipe
    e.stopPropagation();
    
    const now = performance.now();
    const timeDelta = now - lastTimeRef.current;
    
    if (timeDelta > 0) {
      const distanceDelta = touch.clientX - lastXRef.current;
      velocityRef.current = distanceDelta / timeDelta;
    }
    
    currentXRef.current = touch.clientX;
    lastXRef.current = touch.clientX;
    lastTimeRef.current = now;
    
    // Calculate offset with rubber-band effect
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const baseOffset = deltaX - (currentIndex * containerWidth);
    
    // Apply rubber-band resistance at boundaries
    let finalOffset = baseOffset;
    if (currentIndex === 0 && baseOffset > 0) {
      finalOffset = applyResistance(baseOffset, containerWidth * 0.3);
    } else if (currentIndex === itemCount - 1 && baseOffset < 0) {
      finalOffset = applyResistance(baseOffset, -containerWidth * 0.3);
    }
    
    offsetXRef.current = finalOffset;
    
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${finalOffset}px)`;
    }
  }, [currentIndex, itemCount, applyResistance]);

  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    if (!isDraggingRef.current || itemCount <= 1) return;
    
    isDraggingRef.current = false;
    
    if (!isHorizontalSwipeRef.current) {
      return;
    }
    
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const absVelocity = Math.abs(velocityRef.current);
    const absOffset = Math.abs(offsetXRef.current);
    
    let targetIndex = currentIndex;
    
    // Determine target index based on velocity and offset
    if (absVelocity > minVelocity) {
      // Momentum-based navigation
      if (velocityRef.current < -minVelocity) {
        // Swiping left (next)
        targetIndex = currentIndex + 1;
      } else if (velocityRef.current > minVelocity) {
        // Swiping right (previous)
        targetIndex = currentIndex - 1;
      }
    } else if (absOffset > threshold) {
      // Distance-based navigation
      if (offsetXRef.current < -threshold) {
        targetIndex = currentIndex + 1;
      } else if (offsetXRef.current > threshold) {
        targetIndex = currentIndex - 1;
      }
    }
    
    // Clamp target index
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= itemCount) targetIndex = itemCount - 1;
    
    // Snap to target
    snapToIndex(targetIndex, offsetXRef.current);
    
    isHorizontalSwipeRef.current = false;
  }, [currentIndex, itemCount, threshold, minVelocity, snapToIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Expose method to change index programmatically
  const goToIndex = useCallback((index) => {
    if (index >= 0 && index < itemCount && index !== currentIndex) {
      snapToIndex(index, 0);
    }
  }, [currentIndex, itemCount, snapToIndex]);

  return {
    currentIndex,
    isAnimating,
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    goToIndex,
  };
};

export default useSwipeCarousel;

