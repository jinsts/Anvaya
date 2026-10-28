import { insertAt, readAt, removeAt } from '../../../src/lib/array-operations';

// TypeScript 6 / Node 24. The helpers mutate this dense numeric array.
export function workedExample() {
  const values = [12, 24, 36, 48];
  insertAt(values, 2, 30);
  const inserted = [...values];
  const read = readAt(values, 2);
  const removed = removeAt(values, 3);
  return { inserted, read, removed, final: values };
}
