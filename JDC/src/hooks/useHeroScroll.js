import { useEffect, useState } from 'react';

/**
 * Hook personnalisé pour l'animation du hero au scroll
 * L'image se réduit progressivement et s'estompe lors du scroll
 */
export function useHeroScroll() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = 600; // Hauteur approximative du hero
      
      // Calcul du progrès du scroll (0 à 1)
      const progress = Math.min(scrollY / heroHeight, 1);
      setScrollProgress(progress);
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Appel initial

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return {
    scrollProgress,
    isScrolled,
    // Opacité de l'image (s'estompe progressivement)
    imageOpacity: Math.max(0, 1 - scrollProgress * 1.2),
    // Scale de l'image (se réduit progressivement)
    imageScale: Math.max(0.7, 1 - scrollProgress * 0.3),
    // Opacité du contenu texte (apparaît progressivement)
    contentOpacity: Math.min(1, scrollProgress * 2),
    // Translation du contenu (slide-up)
    contentTranslateY: Math.max(0, 20 - scrollProgress * 20),
  };
}

