import { describe, it, expect } from 'vitest';
import { computeDiscount } from './buggy';

describe('computeDiscount', () => {
  it('applies a percentage discount correctly', () => {
    expect(computeDiscount(100, 0.2)).toBe(80);
  });
});
