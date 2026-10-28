/** Dense arrays of numbers; mutating helpers. Index validation is deliberate. */
function indexIn(index: number, length: number, allowEnd = false) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= length + Number(allowEnd)
  ) {
    throw new RangeError('Index outside the operation’s valid range');
  }
}

export function readAt(values: readonly number[], index: number): number {
  indexIn(index, values.length);
  return values[index]!;
}

export function updateAt(values: number[], index: number, value: number): void {
  indexIn(index, values.length);
  values[index] = value;
}

export function insertAt(values: number[], index: number, value: number): void {
  indexIn(index, values.length, true);
  for (let j = values.length; j > index; j--) {
    values[j] = values[j - 1]!;
  }
  values[index] = value;
}

export function append(values: number[], value: number): void {
  insertAt(values, values.length, value);
}

export function removeAt(values: number[], index: number): number {
  indexIn(index, values.length);
  const removed = values[index]!;
  for (let j = index; j < values.length - 1; j++) {
    values[j] = values[j + 1]!;
  }
  values.length -= 1;
  return removed;
}
