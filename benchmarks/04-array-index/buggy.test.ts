import { describe, it, expect } from 'vitest';
import { getFirstItem } from './buggy';

describe('getFirstItem', () => {
  it('returns the first item from a list', () => {
    expect(getFirstItem(['a', 'b', 'c'])).toBe('a');
  });
});
