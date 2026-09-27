import { useState, type FormEvent } from 'react';
import type { Transaction, TransactionType } from '../types';
import { categories } from '../data/categories';
import { amountInput, isDate, parseAmount, today } from '../utils/finance';
import { Dialog } from './Dialog';
import styles from './ui.module.css';

interface Props {
  transaction?: Transaction;
  maxAmountCents?: number;
  onSave: (transaction: Transaction) => void;
  onClose: () => void;
}
export function TransactionForm({
  transaction,
  maxAmountCents = Number.MAX_SAFE_INTEGER,
  onSave,
  onClose,
}: Props) {
  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? 'expense',
  );
  const [amount, setAmount] = useState(
    transaction ? amountInput(transaction.amountCents) : '',
  );
  const [categoryId, setCategoryId] = useState(
    transaction?.categoryId ?? 'food',
  );
  const [date, setDate] = useState(transaction?.date ?? today());
  const [description, setDescription] = useState(
    transaction?.description ?? '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amountCents = parseAmount(amount);
    const nextErrors: Record<string, string> = {};
    if (amountCents === null)
      nextErrors.amount =
        'Enter a positive USD amount with up to two decimal places.';
    else if (amountCents > maxAmountCents)
      nextErrors.amount =
        'This amount would exceed the supported total. Enter a smaller amount.';
    if (!isDate(date) || date > today())
      nextErrors.date = 'Choose a valid date, today or earlier.';
    if (
      !categories.some(
        (category) => category.id === categoryId && category.type === type,
      )
    )
      nextErrors.category =
        'Choose a category that matches the transaction type.';
    if (!description.trim() || description.trim().length > 120)
      nextErrors.description =
        'Use a description between 1 and 120 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || amountCents === null) return;
    onSave({
      id: transaction?.id ?? crypto.randomUUID(),
      type,
      amountCents,
      categoryId,
      date,
      description: description.trim(),
    });
  }
  return (
    <Dialog
      title={transaction ? 'Edit transaction' : 'Add transaction'}
      onClose={onClose}
    >
      <p className={styles.formIntro}>
        A small update. A clearer picture of your money.
      </p>
      <form noValidate onSubmit={submit} className={styles.form}>
        <label>
          Type
          <select
            data-initial-focus
            value={type}
            onChange={(event) => {
              const next = event.target.value as TransactionType;
              setType(next);
              setCategoryId(
                categories.find((category) => category.type === next)!.id,
              );
            }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="transaction-amount">Amount (USD)</label>
            <input
              id="transaction-amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
            />
            {errors.amount && (
              <span id="amount-error" className={styles.fieldError}>
                {errors.amount}
              </span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="transaction-category">Category</label>
            <select
              id="transaction-category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
            >
              {categories
                .filter((category) => category.type === type)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            {errors.category && (
              <span id="category-error" className={styles.fieldError}>
                {errors.category}
              </span>
            )}
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="transaction-date">Date</label>
          <input
            id="transaction-date"
            type="date"
            max={today()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'date-error' : undefined}
          />
          {errors.date && (
            <span id="date-error" className={styles.fieldError}>
              {errors.date}
            </span>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="transaction-description">Description</label>
          <input
            id="transaction-description"
            placeholder="What was it for?"
            maxLength={120}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? 'description-error' : undefined
            }
          />
          {errors.description && (
            <span id="description-error" className={styles.fieldError}>
              {errors.description}
            </span>
          )}
        </div>
        <p className={styles.muted}>
          Amounts are always entered and saved in USD.
        </p>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.primary} type="submit">
            {transaction ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
