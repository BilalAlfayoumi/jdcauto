import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function AnimatedSection({ 
  children, 
  className = '', 
  animation = 'fade-up',
  delay = 0 
}) {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  const animationClasses = {
    'fade-up': isVisible 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 translate-y-8',
    'fade-in': isVisible 
      ? 'opacity-100' 
      : 'opacity-0',
    'zoom-in': isVisible 
      ? 'opacity-100 scale-100' 
      : 'opacity-0 scale-95',
    'pop': isVisible 
      ? 'opacity-100 scale-100 animate-pop' 
      : 'opacity-0 scale-75',
    'slide-left': isVisible 
      ? 'opacity-100 translate-x-0' 
      : 'opacity-0 -translate-x-8',
    'slide-right': isVisible 
      ? 'opacity-100 translate-x-0' 
      : 'opacity-0 translate-x-8'
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${animationClasses[animation]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

