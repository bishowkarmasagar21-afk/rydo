export const CLASSES = {
  economy: { label: 'Economy', seats: 4, mult: 1 },
  comfort: { label: 'Comfort', seats: 4, mult: 1.35 },
  xl: { label: 'XL', seats: 6, mult: 1.8 },
};
const BASE = 2.5, PER_KM = 1.2, PER_MIN = 0.3, MINIMUM = 5;

export const fare = (cls, km, min) =>
  Math.round(Math.max(MINIMUM, (BASE + PER_KM * km + PER_MIN * min) * CLASSES[cls].mult) * 100) / 100;
