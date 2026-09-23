import { describe, it, expect } from 'vitest';
import { parseCount } from './buggy';

describe('parseCount', () => {
  it('returns the integer value from string input', () => {
    expect(parseCount('42')).toBe(42);
  });
});
