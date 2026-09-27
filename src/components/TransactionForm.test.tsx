import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TransactionForm } from './TransactionForm';
import { ConfirmDialog } from './Dialog';
import type { Transaction } from '../types';

describe('transaction form', () => {
  it('adds a valid transaction with integer cents and a trimmed description', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    render(<TransactionForm onSave={save} onClose={vi.fn()} />);
    await user.type(screen.getByLabelText('Amount (USD)'), '12,34');
    await user.type(screen.getByLabelText('Description'), '  Lunch  ');
    await user.click(screen.getByRole('button', { name: 'Add transaction' }));
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        amountCents: 1234,
        description: 'Lunch',
        type: 'expense',
        categoryId: 'food',
      }),
    );
  });
  it('shows linked validation errors without saving', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    render(<TransactionForm onSave={save} onClose={vi.fn()} />);
    await user.type(screen.getByLabelText('Amount (USD)'), '1e3');
    await user.click(screen.getByRole('button', { name: 'Add transaction' }));
    expect(save).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Amount (USD)')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByLabelText('Description')).toHaveAccessibleDescription(
      'Use a description between 1 and 120 characters.',
    );
  });
  it('preserves the id when editing', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    const transaction: Transaction = {
      id: 'keep-me',
      type: 'expense',
      amountCents: 1200,
      categoryId: 'food',
      date: '2025-01-01',
      description: 'Lunch',
    };
    render(
      <TransactionForm
        transaction={transaction}
        onSave={save}
        onClose={vi.fn()}
      />,
    );
    await user.clear(screen.getByLabelText('Amount (USD)'));
    await user.type(screen.getByLabelText('Amount (USD)'), '18.50');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(save).toHaveBeenCalledWith({ ...transaction, amountCents: 1850 });
    expect(transaction.amountCents).toBe(1200);
  });
  it('cancels a deletion without calling the destructive action', async () => {
    const user = userEvent.setup();
    const remove = vi.fn();
    const close = vi.fn();
    render(
      <ConfirmDialog
        title="Delete lunch?"
        message="Lunch ($12.00) will be removed."
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={close}
      />,
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(close).toHaveBeenCalledOnce();
    expect(remove).not.toHaveBeenCalled();
  });
});
