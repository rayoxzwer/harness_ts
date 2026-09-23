export function sumRange(end: number) {
  let total = 0;
  for (let i = 1; i < end; i++) {
    total += i;
  }
  return total;
}
