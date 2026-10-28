import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import ArrayExplorer from '../../src/components/interactive/ArrayExplorer';

it('steps the full acceptance scenario and resets deterministically', async () => {
  const user = userEvent.setup();
  render(<ArrayExplorer />);
  await user.click(screen.getByRole('button', { name: 'Prepare operation' }));
  expect(screen.getByRole('status')).toHaveTextContent('Predict first');
  expect(screen.getByLabelText('Operation')).toBeDisabled();
  for (let i = 0; i < 8; i++)
    await user.click(screen.getByRole('button', { name: 'Next step →' }));
  expect(screen.getByRole('status')).toHaveTextContent('[12, 24, 30, 36, 48]');
  expect(
    screen.getByRole('button', { name: 'Index 2, value 30, inserted' }),
  ).toBeVisible();
  expect(
    screen.getByRole('button', { name: 'Index 3, value 36, shifted' }),
  ).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Reset' }));
  expect(
    screen.getByRole('button', { name: 'Index 2, value 36' }),
  ).toBeVisible();
  expect(screen.getByLabelText('Index', { exact: true })).toHaveValue('2');
});

it('validates bad input and performs empty insertion and removal with keyboard', async () => {
  const user = userEvent.setup();
  render(<ArrayExplorer />);
  const index = screen.getByLabelText('Index', { exact: true });
  await user.clear(index);
  await user.type(index, '-1');
  await user.click(screen.getByRole('button', { name: 'Prepare operation' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Index must');
  await user.click(screen.getByText('Try your own small example'));
  await user.clear(screen.getByLabelText(/Comma-separated/));
  await user.click(screen.getByRole('button', { name: 'Load example' }));
  await user.clear(index);
  await user.type(index, '0');
  await user.click(screen.getByRole('button', { name: 'Prepare operation' }));
  const next = screen.getByRole('button', { name: 'Next step →' });
  next.focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('status')).toHaveTextContent('[30]');
  await user.selectOptions(screen.getByLabelText('Operation'), 'remove');
  await user.click(screen.getByRole('button', { name: 'Prepare operation' }));
  await user.click(screen.getByRole('button', { name: 'Next step →' }));
  await user.click(screen.getByRole('button', { name: 'Next step →' }));
  expect(screen.getByRole('status')).toHaveTextContent('Removed index 0');
  expect(
    within(screen.getByLabelText('Array cells')).getAllByRole('button'),
  ).toHaveLength(4);
});

it('reset cancels a partial trace and custom malformed values produce an error', () => {
  render(<ArrayExplorer />);
  fireEvent.click(screen.getByRole('button', { name: 'Prepare operation' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next step →' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(screen.queryByText(/Step 2 of/)).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Comma-separated/), {
    target: { value: '1,,2' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Load example' }));
  expect(screen.getByRole('alert')).toHaveTextContent('comma-separated');
});
