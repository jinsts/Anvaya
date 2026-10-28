import { describe, expect, it } from 'vitest';
import {
  createModel,
  parseValues,
  parseInteger,
  planOperation,
  type Operation,
} from '../../src/lib/array-model';
import {
  append,
  insertAt,
  readAt,
  removeAt,
  updateAt,
} from '../../src/lib/array-operations';
import { workedExample } from '../../labs/dsa/arrays/examples';

describe('conceptual array trace', () => {
  it('inserts 30 at 2, copies on resize, shifts right in a safe order, and labels the result', () => {
    const model = createModel();
    const before = structuredClone(model);
    const trace = planOperation(model, 'insert', 2, 30);
    expect(trace.result).toEqual({ values: [12, 24, 30, 36, 48], capacity: 8 });
    expect(
      trace.frames.filter((f) => f.message.startsWith('Copy ')),
    ).toHaveLength(4);
    const shifts = trace.frames.filter((f) => f.message.startsWith('Shift '));
    expect(shifts.map((f) => f.slots)).toEqual([
      [12, 24, 36, null, 48, null, null, null],
      [12, 24, null, 36, 48, null, null, null],
    ]);
    expect(trace.frames.at(-1)?.labels).toMatchObject({
      2: 'inserted',
      3: 'shifted',
      4: 'shifted',
    });
    expect(trace.frames.at(-1)?.length).toBe(5);
    expect(model).toEqual(before);
  });
  it('removes a middle value and closes the gap left to right', () => {
    const trace = planOperation(createModel(), 'remove', 1);
    expect(trace.result).toEqual({ values: [12, 36, 48], capacity: 4 });
    expect(
      trace.frames
        .filter((f) => f.message.startsWith('Shift '))
        .map((f) => f.slots),
    ).toEqual([
      [12, 36, null, 48],
      [12, 36, 48, null],
    ]);
  });
  it('reads and updates without shifting or changing length', () => {
    const model = createModel();
    expect(planOperation(model, 'read', 2).frames.at(-1)?.message).toContain(
      'value 36',
    );
    const update = planOperation(model, 'update', 2, -8);
    expect(update.result).toEqual({ values: [12, 24, -8, 48], capacity: 4 });
    expect(update.frames).toHaveLength(2);
  });
  it('inserts into empty and at end, appends with spare capacity and removes last', () => {
    expect(
      planOperation(createModel([]), 'insert', 0, 7).result.values,
    ).toEqual([7]);
    expect(
      planOperation(createModel([1]), 'insert', 1, 2).result.values,
    ).toEqual([1, 2]);
    const append = planOperation(createModel([1]), 'append', 99, 2);
    expect(append.result).toEqual({ values: [1, 2], capacity: 4 });
    expect(append.frames).toHaveLength(2);
    expect(planOperation(createModel([1]), 'remove', 0).result.values).toEqual(
      [],
    );
  });
  it('doubles a full capacity-eight buffer and rejects growth beyond the limit', () => {
    expect(
      planOperation(
        createModel(Array.from({ length: 8 }, (_, i) => i)),
        'append',
        0,
        9,
      ).result.capacity,
    ).toBe(16);
    expect(() =>
      planOperation(createModel(Array(16).fill(1)), 'append', 0, 9),
    ).toThrow('limit');
  });
  it.each(['read', 'update', 'remove'] as Operation[])(
    'rejects %s on empty input',
    (op) => {
      expect(() => planOperation(createModel([]), op, 0)).toThrow('empty');
    },
  );
  it.each([-1, 5, 1.5, NaN, Infinity])('rejects invalid index %s', (index) => {
    expect(() => planOperation(createModel(), 'insert', index, 30)).toThrow(
      'Index',
    );
  });
  it('validates both model data and UI input strictly', () => {
    expect(() => createModel([1000])).toThrow('integers');
    expect(() => createModel(Array(17).fill(1))).toThrow('at most');
    expect(() => planOperation(createModel(), 'update', 0, Infinity)).toThrow(
      'integers',
    );
    expect(() =>
      planOperation({ values: [1], capacity: 0 }, 'read', 0),
    ).toThrow('capacity');
    expect(parseValues('')).toEqual([]);
    expect(parseValues(' 12, -3, 0 ')).toEqual([12, -3, 0]);
    for (const input of ['1,,2', '1e2', 'hello', '1.5', '9999'])
      expect(() => parseValues(input)).toThrow();
    for (const input of ['', '1.3', '2e1', 'no'])
      expect(() => parseInteger(input, 'Index')).toThrow();
    expect(parseInteger(' 2 ', 'Index')).toBe(2);
  });
});

describe('lesson helpers and worked outputs', () => {
  it('matches every output shown in the lesson', () => {
    expect(workedExample()).toEqual({
      inserted: [12, 24, 30, 36, 48],
      read: 30,
      removed: 36,
      final: [12, 24, 30, 48],
    });
  });
  it('supports update, append, insert boundaries and removal return values', () => {
    const values: number[] = [];
    append(values, 2);
    insertAt(values, 0, 1);
    insertAt(values, 2, 3);
    updateAt(values, 1, 8);
    expect(readAt(values, 1)).toBe(8);
    expect(removeAt(values, 2)).toBe(3);
    expect(values).toEqual([1, 8]);
  });
  it('rejects invalid helpers before changing the original', () => {
    const values = [1, 2];
    for (const index of [-1, 1.5, 3, NaN]) {
      expect(() => insertAt(values, index, 3)).toThrow(RangeError);
      expect(() => updateAt(values, index, 3)).toThrow(RangeError);
      expect(() => readAt(values, index)).toThrow(RangeError);
    }
    expect(values).toEqual([1, 2]);
  });
});
