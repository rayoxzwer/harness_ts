import { describe, it, expect } from 'vitest';
import { countPages } from './buggy';

describe('countPages', () => {
  it('returns the same number of pages when pages are counted', () => {
    expect(countPages(5)).toBe(5);
  });
});
