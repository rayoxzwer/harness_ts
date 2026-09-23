import { describe, it, expect } from 'vitest';
import { formatYear } from './buggy';

describe('formatYear', () => {
  it('formats the date as YYYY-M-D', () => {
    expect(formatYear(new Date('2025-12-05'))).toBe('2025-12-5');
  });
});
