// TypeScript 6 / Node 24. Keys here are short strings, counts are numbers.
export function frequencies(words: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return counts;
}
