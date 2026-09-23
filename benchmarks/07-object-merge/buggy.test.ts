import { describe, it, expect } from 'vitest';
import { mergeUser } from './buggy';

describe('mergeUser', () => {
  it('keeps original values when updates are empty', () => {
    expect(mergeUser({ name: 'Alice' }, {})).toEqual({ name: 'Alice' });
  });
});
