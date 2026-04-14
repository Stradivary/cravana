const TEST_DISCOUNT_PERCENT = 95;

export function applyTestDiscount(basePrice: number): number {
  const normalizedPrice = Number.isFinite(basePrice) ? Math.max(0, Math.floor(basePrice)) : 0;
  const discounted = Math.floor(normalizedPrice * ((100 - TEST_DISCOUNT_PERCENT) / 100));
  return Math.max(1, discounted);
}
