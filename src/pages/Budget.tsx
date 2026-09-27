import { useState, type FormEvent } from 'react';
import type {
  Budget as BudgetType,
  MoneyFormatter,
  Transaction,
} from '../types';
import { categories, getCategory } from '../data/categories';
import { amountInput, budgetSpent, parseAmount } from '../utils/finance';
import { MonthPicker, PageHeading } from '../components/PageHeading';
import { BudgetProgress } from '../components/BudgetProgress';
import { ConfirmDialog, Dialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import styles from '../components/ui.module.css';

interface Props {
  budgets: BudgetType[];
  transactions: Transaction[];
  month: string;
  setMonth: (month: string) => void;
  money: MoneyFormatter;
  onSave: (budget: BudgetType) => void;
  onDelete: (id: string) => void;
}
export default function Budget({
  budgets,
  transactions,
  month,
  setMonth,
  money,
  onSave,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState<BudgetType | 'new' | null>(null);
  const [deleting, setDeleting] = useState<BudgetType | null>(null);
  const monthly = budgets.filter((budget) => budget.month === month);
  const limit = monthly.reduce((sum, budget) => sum + budget.limitCents, 0);
  const spent = monthly.reduce(
    (sum, budget) => sum + budgetSpent(budget, transactions),
    0,
  );
  const available = categories.filter(
    (c) => c.type === 'expense' && !monthly.some((b) => b.categoryId === c.id),
  );
  return (
    <>
      <PageHeading
        title="Make room for what matters."
        description="A simple plan for your spending. A little less guesswork."
      >
        <MonthPicker month={month} onChange={setMonth} />
        <button
          className={styles.primary}
          disabled={!available.length}
          onClick={() => setEditing('new')}
        >
          <Icon name="plus" size={18} />
          Add budget
        </button>
      </PageHeading>
      <div className={styles.budgetOverview}>
        <div>
          <span>Planned this month</span>
          <strong>{money(limit)}</strong>
        </div>
        <div>
          <span>Spent in budgeted categories</span>
          <strong>{money(spent)}</strong>
        </div>
        <div>
          <span>{spent > limit ? 'Over your plan' : 'Left in your plan'}</span>
          <strong className={spent > limit ? styles.negative : styles.positive}>
            {money(Math.abs(limit - spent))}
          </strong>
        </div>
      </div>
      {monthly.length ? (
        <div className={styles.budgetGrid}>
          {monthly.map((budget) => (
            <section className={styles.panel} key={budget.id}>
              <BudgetProgress
                budget={budget}
                transactions={transactions}
                money={money}
                onEdit={() => setEditing(budget)}
                onDelete={() => setDeleting(budget)}
              />
            </section>
          ))}
        </div>
      ) : (
        <section className={styles.panel}>
          <div className={styles.empty}>
            <Icon name="budget" size={36} />
            <h3>A good month starts with a plan</h3>
            <p>Choose a spending category and set a comfortable limit.</p>
            <button
              className={styles.primary}
              onClick={() => setEditing('new')}
            >
              Create your first budget
            </button>
          </div>
        </section>
      )}
      <p className={styles.footnote}>
        <Icon name="shield" size={16} />
        Budgets are monthly guides. Your actual spending comes from your
        transactions.
      </p>
      {editing && (
        <BudgetForm
          budget={editing === 'new' ? undefined : editing}
          maxLimitCents={
            Number.MAX_SAFE_INTEGER -
            budgets.reduce((sum, b) => sum + b.limitCents, 0) +
            (editing === 'new' ? 0 : editing.limitCents)
          }
          availableIds={available.map((c) => c.id)}
          month={month}
          onClose={() => setEditing(null)}
          onSave={(budget) => {
            onSave(budget);
            setEditing(null);
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Remove this budget?"
          message={`Remove the ${getCategory(deleting.categoryId).name} limit of ${money(deleting.limitCents)}? Your transactions will stay as they are.`}
          confirmLabel="Remove budget"
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            onDelete(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </>
  );
}
function BudgetForm({
  budget,
  maxLimitCents,
  availableIds,
  month,
  onClose,
  onSave,
}: {
  budget?: BudgetType;
  maxLimitCents: number;
  availableIds: string[];
  month: string;
  onClose: () => void;
  onSave: (budget: BudgetType) => void;
}) {
  const [category, setCategory] = useState(
    budget?.categoryId ?? availableIds[0] ?? '',
  );
  const [amount, setAmount] = useState(
    budget ? amountInput(budget.limitCents) : '',
  );
  const [error, setError] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    const cents = parseAmount(amount);
    if (!cents || (!budget && !availableIds.includes(category))) {
      setError(
        'Choose an available category and enter a positive USD limit with up to two decimal places.',
      );
      return;
    }
    if (cents > maxLimitCents) {
      setError(
        'This limit would exceed the supported total. Enter a smaller amount.',
      );
      return;
    }
    onSave({
      id: budget?.id ?? crypto.randomUUID(),
      categoryId: category,
      month,
      limitCents: cents,
    });
  }
  return (
    <Dialog
      title={budget ? 'Edit budget' : 'Add a monthly budget'}
      onClose={onClose}
    >
      <form className={styles.form} onSubmit={submit} noValidate>
        <p className={styles.formIntro}>Set your spending limit for {month}.</p>
        <label>
          Category
          <select
            data-initial-focus={budget ? undefined : true}
            value={category}
            disabled={!!budget}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories
              .filter(
                (c) =>
                  availableIds.includes(c.id) || c.id === budget?.categoryId,
              )
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
        <label>
          Monthly limit (USD)
          <input
            data-initial-focus={budget ? true : undefined}
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? 'budget-error' : undefined}
          />
        </label>
        {error && (
          <p id="budget-error" className={styles.fieldError}>
            {error}
          </p>
        )}
        <div className={styles.dialogActions}>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.primary} type="submit">
            Save budget
          </button>
        </div>
      </form>
    </Dialog>
  );
}
