/** Reference solution. TODO: Replace with the tested implementation. */
export function solve(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
