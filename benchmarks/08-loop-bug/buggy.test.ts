import { describe, it, expect } from 'vitest';
import { sumRange } from './buggy';

describe('sumRange', () => {
  it('sums a range of numbers inclusive', () => {
    expect(sumRange(4)).toBe(10);
  });
});
