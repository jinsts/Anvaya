import { useState } from 'react';
import {
  createModel,
  INITIAL_VALUES,
  parseInteger,
  parseValues,
  planOperation,
  type Operation,
  type OperationPlan,
} from '../../lib/array-model';

export default function ArrayExplorer() {
  const [model, setModel] = useState(() => createModel());
  const [operation, setOperation] = useState<Operation>('insert');
  const [index, setIndex] = useState('2');
  const [value, setValue] = useState('30');
  const [dataset, setDataset] = useState(INITIAL_VALUES.join(', '));
  const [plan, setPlan] = useState<OperationPlan | null>(null);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(
    'Choose an operation, predict the work, then step through it.',
  );
  const frame = plan?.frames[step];
  const busy = plan !== null && step < plan.frames.length - 1;
  const slots =
    frame?.slots ??
    Array.from({ length: model.capacity }, (_, i) => model.values[i] ?? null);
  const capacity = frame?.capacity ?? model.capacity;
  const length = frame?.length ?? model.values.length;
  const needsValue = ['update', 'insert', 'append'].includes(operation);
  function clearTrace() {
    setPlan(null);
    setStep(0);
    setSelected(null);
    setError('');
  }
  function begin() {
    try {
      const next = planOperation(
        model,
        operation,
        operation === 'append'
          ? model.values.length
          : parseInteger(index, 'Index'),
        needsValue ? parseInteger(value, 'Value') : 0,
      );
      setPlan(next);
      setStep(0);
      setSelected(null);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid operation.');
    }
  }
  function nextStep() {
    if (!plan || !busy) return;
    const next = step + 1;
    setStep(next);
    if (next === plan.frames.length - 1) setModel(plan.result);
  }
  function loadExample() {
    try {
      const next = createModel(parseValues(dataset));
      setModel(next);
      clearTrace();
      setNotice(
        `Loaded ${next.values.length} values. ${next.values.length ? 'Choose an index to inspect.' : 'Empty array: try insert at index 0.'}`,
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid example.');
    }
  }
  function reset() {
    setModel(createModel());
    setDataset(INITIAL_VALUES.join(', '));
    setOperation('insert');
    setIndex('2');
    setValue('30');
    clearTrace();
    setNotice('Reset to [12, 24, 36, 48]. Try inserting 30 at index 2.');
  }
  return (
    <section className="array-explorer" aria-label="Interactive array explorer">
      <div className="explorer-heading">
        <div>
          <span className="eyebrow">Experiment 01 / Dynamic array</span>
          <h3>Make the work visible.</h3>
        </div>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
      <p className="explorer-caption">
        Textbook model · integer values · manual steps · maximum 16 values
      </p>
      <fieldset className="operation-controls" disabled={busy}>
        <legend>Choose your operation</legend>
        <label>
          Operation
          <select
            value={operation}
            onChange={(e) => {
              setOperation(e.target.value as Operation);
              clearTrace();
            }}
          >
            <option value="read">Read</option>
            <option value="update">Update</option>
            <option value="append">Append</option>
            <option value="insert">Insert</option>
            <option value="remove">Remove</option>
          </select>
        </label>
        {operation !== 'append' && (
          <label>
            Index
            <input
              inputMode="numeric"
              value={index}
              onChange={(e) => setIndex(e.target.value)}
            />
          </label>
        )}
        {needsValue && (
          <label>
            Value
            <input
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
        )}
        <button type="button" className="primary-control" onClick={begin}>
          Prepare operation
        </button>
      </fieldset>
      {error && (
        <p role="alert" className="explorer-error">
          {error}
        </p>
      )}
      <div className="explorer-stats">
        <span>
          Logical length <strong>{length}</strong>
        </span>
        <span>
          Capacity <strong>{capacity}</strong>
        </span>
        <span>{busy ? 'Operation in progress' : 'Ready to explore'}</span>
      </div>
      <div className="array-cells" aria-label="Array cells">
        {slots.map((cell, i) => (
          <button
            type="button"
            key={i}
            disabled={busy || cell === null || i >= model.values.length}
            onClick={() => {
              setPlan(null);
              setStep(0);
              setSelected(i);
              setIndex(String(i));
              setNotice(
                `Index ${i} contains ${cell}. One indexed access, O(1) in this model; no other cells are visited.`,
              );
            }}
            className={`array-cell ${frame?.active.includes(i) || selected === i ? 'active' : ''} ${frame?.labels[i] === 'inserted' ? 'inserted' : ''}`}
            aria-label={`Index ${i}, ${cell === null ? 'unused' : `value ${cell}`}${frame?.labels[i] ? `, ${frame.labels[i]}` : ''}`}
            aria-pressed={selected === i}
          >
            <span className="cell-index">index {i}</span>
            <strong>{cell ?? '—'}</strong>
            <span className="cell-state">
              {frame?.labels[i] ?? (cell === null ? 'unused' : 'value')}
            </span>
          </button>
        ))}
      </div>
      <p className="explorer-caption">
        Select a cell to inspect. “—” marks unused space or a temporary gap.
        Changes commit on the final step.
      </p>
      <div className="operation-story">
        <div role="status" aria-live="polite" aria-atomic="true">
          <strong>
            {plan
              ? `Step ${step + 1} of ${plan.frames.length}`
              : 'Your prediction comes first'}
          </strong>
          <p>{frame?.message ?? notice}</p>
        </div>
        {plan && (
          <button
            type="button"
            className="primary-control"
            onClick={nextStep}
            disabled={!busy}
          >
            {busy ? 'Next step →' : 'Operation complete'}
          </button>
        )}
      </div>
      {plan && (
        <p className="operation-cost">
          <strong>Cost model:</strong> {plan.cost}
        </p>
      )}
      <details>
        <summary>Try your own small example</summary>
        <label htmlFor="array-values">
          Comma-separated integers, -999 to 999; blank means empty
        </label>
        <div className="dataset-controls">
          <input
            id="array-values"
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            disabled={busy}
          />
          <button type="button" onClick={loadExample} disabled={busy}>
            Load example
          </button>
        </div>
      </details>
      <noscript>
        <p>
          The interactive controls need JavaScript. The lesson’s insertion
          walkthrough below provides the same model in text.
        </p>
      </noscript>
    </section>
  );
}
