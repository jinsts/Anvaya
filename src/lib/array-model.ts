/** Textbook dynamic-array model. This does not represent a JS engine's storage. */
export const MAX_LENGTH = 16;
export const INITIAL_VALUES = [12, 24, 36, 48];
export type Operation = 'read' | 'update' | 'append' | 'insert' | 'remove';
export interface ArrayModel {
  values: number[];
  capacity: number;
}
export interface Frame {
  slots: (number | null)[];
  length: number;
  capacity: number;
  message: string;
  active: number[];
  labels: Record<number, string>;
}
export interface OperationPlan {
  frames: Frame[];
  result: ArrayModel;
  cost: string;
}

export function safeValue(value: number) {
  if (!Number.isInteger(value) || Math.abs(value) > 999)
    throw new Error('Values must be integers from -999 to 999.');
  return value;
}
export function checkIndex(index: number, length: number, allowEnd = false) {
  const max = allowEnd ? length : length - 1;
  if (!Number.isInteger(index) || index < 0 || index > max) {
    throw new Error(
      max < 0
        ? 'The array is empty. Insert or append a value first.'
        : `Index must be an integer from 0 to ${max}.`,
    );
  }
}
export function createModel(values = INITIAL_VALUES): ArrayModel {
  if (values.length > MAX_LENGTH)
    throw new Error(`Use at most ${MAX_LENGTH} values.`);
  values.forEach(safeValue);
  let capacity = 4;
  while (capacity < values.length) capacity *= 2;
  return { values: [...values], capacity };
}
export function parseValues(input: string): number[] {
  if (!input.trim()) return [];
  return input.split(',').map((part) => {
    if (!/^-?\d+$/.test(part.trim()))
      throw new Error('Use comma-separated integers, such as 12, 24, 36.');
    return safeValue(Number(part.trim()));
  });
}
export function parseInteger(input: string, label: string) {
  if (!/^-?\d+$/.test(input.trim()))
    throw new Error(`${label} must be an integer.`);
  return Number(input);
}

export function planOperation(
  model: ArrayModel,
  operation: Operation,
  requestedIndex: number,
  value = 0,
): OperationPlan {
  if (
    ![4, 8, 16].includes(model.capacity) ||
    model.values.length > model.capacity
  )
    throw new Error('Invalid model capacity.');
  model.values.forEach(safeValue);
  const n = model.values.length;
  const index = operation === 'append' ? n : requestedIndex;
  const inserting = operation === 'insert' || operation === 'append';
  checkIndex(index, n, inserting);
  if (inserting || operation === 'update') safeValue(value);
  if (inserting && n === MAX_LENGTH)
    throw new Error(
      `Explorer limit: ${MAX_LENGTH} values. Remove a value or reset.`,
    );
  const values = [...model.values];
  let capacity = model.capacity;
  let slots: (number | null)[] = Array.from(
    { length: capacity },
    (_, i) => values[i] ?? null,
  );
  const frames: Frame[] = [];
  const labels: Record<number, string> = {};
  const frame = (message: string, active: number[] = [], length = n) =>
    frames.push({
      slots: [...slots],
      length,
      capacity,
      message,
      active,
      labels: { ...labels },
    });
  frame(
    `Predict first: ${operation} ${inserting || operation === 'update' ? value + ' ' : ''}at index ${index}. How many cells will move?`,
  );
  let cost: string;
  if (operation === 'read') {
    labels[index] = 'read';
    frame(
      `Read index ${index}: value ${values[index]}. One indexed access; no scanning.`,
      [index],
    );
    cost = 'O(1) time and O(1) extra space under the indexed-access model.';
  } else if (operation === 'update') {
    values[index] = value;
    slots[index] = value;
    labels[index] = 'updated';
    frame(
      `Write ${value} at index ${index}. Length and order stay unchanged.`,
      [index],
    );
    cost = 'O(1) time and O(1) extra space under the indexed-access model.';
  } else if (operation === 'remove') {
    slots[index] = null;
    labels[index] = 'gap';
    frame(
      `Remove ${values[index]} from index ${index}. Fill the gap from the right.`,
      [index],
    );
    for (let source = index + 1; source < n; source++) {
      slots[source - 1] = slots[source]!;
      slots[source] = null;
      labels[source - 1] = 'shifted';
      labels[source] = 'gap';
      frame(
        `Shift ${slots[source - 1]} left: index ${source} → ${source - 1}.`,
        [source - 1, source],
      );
    }
    values.splice(index, 1);
    delete labels[n - 1];
    frame(
      `Done. Removed index ${index}; shifted ${n - index - 1} values left. Capacity stays ${capacity}.`,
      [],
      n - 1,
    );
    cost = `O(n − i) time (${n - index - 1} shifts here), O(n) worst case; O(1) extra space. Removing the last value is O(1).`;
  } else {
    const grew = n === capacity;
    if (grew) {
      capacity *= 2;
      slots = Array.from({ length: capacity }, () => null);
      frame(
        `Capacity ${model.capacity} is full. Allocate a new buffer of ${capacity} cells. The old ${n} values still exist until copying completes.`,
      );
      for (let source = 0; source < n; source++) {
        slots[source] = values[source]!;
        labels[source] = 'copied';
        frame(
          `Copy ${values[source]} from old index ${source} to new index ${source}.`,
          [source],
        );
      }
    }
    for (let source = n - 1; source >= index; source--) {
      slots[source + 1] = slots[source]!;
      slots[source] = null;
      labels[source + 1] = 'shifted';
      labels[source] = 'gap';
      frame(
        `Shift ${slots[source + 1]} right: index ${source} → ${source + 1}. Work from right to left to avoid overwriting a value.`,
        [source, source + 1],
      );
    }
    values.splice(index, 0, value);
    slots[index] = value;
    labels[index] = 'inserted';
    frame(
      `Insert ${value} at index ${index}. Done: [${values.join(', ')}]. Shifted ${n - index} values${grew ? ` and copied ${n} during growth` : ''}.`,
      [index],
      n + 1,
    );
    cost =
      operation === 'append'
        ? `O(1) amortized append with capacity doubling; O(n) worst case on resize.${grew ? ` This append copies ${n} values.` : ' No resize for this append.'} O(n) temporary space when growing.`
        : `O(1 + n − i) time without growth (${n - index} shifts here); O(n) worst-case time including resize. O(1) extra space without growth, O(n) while resizing.`;
  }
  return { frames, result: { values, capacity }, cost };
}
