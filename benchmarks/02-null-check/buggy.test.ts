import { describe, it, expect } from 'vitest';
import { getName } from './buggy';

describe('getName', () => {
  it('returns the uppercase name when name is provided', () => {
    expect(getName({ name: 'alice' })).toBe('ALICE');
  });
});
