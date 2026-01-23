import React, { useState, useRef, useEffect } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function ImageWithAnimation({ 
  src, 
  alt, 
  className = '', 
  animation = 'fade-in',
  delay = 0,
  forceVisible = false, // Pour forcer l'animation même si pas dans le viewport (ex: hero slider)
  ...props 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    // Si l'image est déjà chargée, déclencher l'animation immédiatement
    const img = new Image();
    img.src = src;
    if (img.complete) {
      setIsLoaded(true);
    } else {
      img.onload = () => setIsLoaded(true);
    }
  }, [src]);

  // Si forceVisible est true, considérer comme visible
  const shouldAnimate = forceVisible ? isLoaded : (isLoaded && isVisible);

  const animationClasses = {
    'fade-in': shouldAnimate
      ? 'opacity-100 scale-100'
      : 'opacity-0 scale-95',
    'fade-up': shouldAnimate
      ? 'opacity-100 translate-y-0 scale-100'
      : 'opacity-0 translate-y-4 scale-95',
    'zoom-in': shouldAnimate
      ? 'opacity-100 scale-100'
      : 'opacity-0 scale-90',
    'slide-left': shouldAnimate
      ? 'opacity-100 translate-x-0'
      : 'opacity-0 -translate-x-4',
    'slide-right': shouldAnimate
      ? 'opacity-100 translate-x-0'
      : 'opacity-0 translate-x-4'
  };

  return (
    <div
      ref={forceVisible ? null : ref}
      className={`overflow-hidden ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${animationClasses[animation]}`}
        style={{ transitionDelay: `${delay}ms` }}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
}

