import { useEffect, useState } from 'react';

export function useParallax() {
  const [scrollY, setScrollY] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Calcul de l'opacité (fade-out progressif)
      // L'image disparaît complètement après 400px de scroll
      const maxScroll = 400;
      const newOpacity = Math.max(0, 1 - currentScrollY / maxScroll);
      setOpacity(newOpacity);

      // Calcul de la translation verticale (effet de parallaxe)
      // L'image se déplace vers le haut plus lentement que le scroll
      const parallaxSpeed = 0.5; // Ajustez cette valeur pour plus ou moins de parallaxe
      const newTranslateY = currentScrollY * parallaxSpeed;
      setTranslateY(newTranslateY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Appel initial pour définir les valeurs de départ

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { scrollY, opacity, translateY };
}

