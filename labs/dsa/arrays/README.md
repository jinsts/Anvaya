# Arrays practice

Use Node 24.14.0 and pnpm 9.15.9. Run `pnpm install --frozen-lockfile` at the
repository root first. No cloud accounts, downloaded exercise packages or secrets.

1. Implement `linearSearch` in `starter.ts`. Inputs are a dense finite-number
   array and a finite-number target. Return the first index using `===`, or -1;
   never mutate input. `[5, 5]`, target 5 gives 0. Empty input gives -1.
2. Implement `removeAt` in `starter.ts`. Mutate the original dense number array
   and return the removed value. Shift the suffix left, then shorten length.
   `[12,24,36,48]`, index 2 returns 36 and leaves `[12,24,48]`. Indices must be
   integers in `[0, length)`; otherwise throw `RangeError` without mutation.

From the root, run `pnpm lab dsa/arrays` to test **your starter**, including empty,
single-element, duplicate, first/last and invalid-index cases. It intentionally
fails while the TODOs remain. This attempt suite is excluded from the normal
quality gate; `pnpm test:labs` validates the separately supplied reference solution.

Hints: search can return as soon as a match is found; removal must never read past
the old final index. Explain your loop invariant before opening `solution.ts`.
Compare your result with the reference after an attempt.

Search uses O(n) worst-case time, O(1) best case and O(1) auxiliary space. Removal
uses O(n − i) time and O(1) auxiliary space under the textbook indexed model.
These bounds assume constant-time numeric equality/read/write; they do not
promise a particular JavaScript engine representation.
