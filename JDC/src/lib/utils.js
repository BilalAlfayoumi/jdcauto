import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine les classes CSS de manière intelligente
 * Utilise clsx pour la logique conditionnelle et tailwind-merge pour résoudre les conflits Tailwind
 * @param {...any} inputs - Classes CSS à combiner
 * @returns {string} - Classes CSS combinées
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

