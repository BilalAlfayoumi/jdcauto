import { cloneCarteGriseContent, defaultCarteGriseContent } from './carteGriseContent';

export const defaultCarteGrisePricing = defaultCarteGriseContent.pricingItems;

export function cloneCarteGrisePricing(items = defaultCarteGrisePricing) {
  return cloneCarteGriseContent({ ...defaultCarteGriseContent, pricingItems: items }).pricingItems;
}
