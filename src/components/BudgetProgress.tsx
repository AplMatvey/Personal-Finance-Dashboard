import type { Budget, MoneyFormatter, Transaction } from '../types';
import { getCategory } from '../data/categories';
import { budgetSpent } from '../utils/finance';
import { Icon, type IconName } from './Icon';
import styles from './ui.module.css';

export function BudgetProgress({
  budget,
  transactions,
  money,
  onEdit,
  onDelete,
}: {
  budget: Budget;
  transactions: Transaction[];
  money: MoneyFormatter;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const category = getCategory(budget.categoryId);
  const spent = budgetSpent(budget, transactions);
  const percent = Math.round((spent / budget.limitCents) * 100);
  const over = spent > budget.limitCents;
  return (
    <div className={styles.budgetItem}>
      <div className={styles.budgetHeading}>
        <div className={styles.transactionName}>
          <span
            className={styles.categoryIcon}
            style={{ color: category.color }}
          >
            <Icon name={category.id as IconName} size={19} />
          </span>
          <h3>{category.name}</h3>
        </div>
        <div className={styles.rowActions}>
          {onEdit && (
            <button
              className={styles.iconButton}
              aria-label={`Edit ${category.name} budget`}
              onClick={onEdit}
            >
              <Icon name="edit" size={16} />
            </button>
          )}
          {onDelete && (
            <button
              className={styles.iconButton}
              aria-label={`Delete ${category.name} budget`}
              onClick={onDelete}
            >
              <Icon name="trash" size={16} />
            </button>
          )}
        </div>
      </div>
      <div className={styles.budgetNumbers}>
        <span>
          <strong>{money(spent)}</strong>{' '}
          <span className={styles.muted}>of {money(budget.limitCents)}</span>
        </span>
        <span className={over ? styles.negative : ''}>{percent}%</span>
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label={`${category.name} budget used`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(percent, 100)}
        aria-valuetext={`${percent}% used; ${money(spent)} of ${money(budget.limitCents)}`}
      >
        <div
          style={{
            width: `${Math.min(percent, 100)}%`,
            background: over ? 'var(--danger)' : category.color,
          }}
        />
      </div>
      <p className={`${styles.budgetRemaining} ${over ? styles.negative : ''}`}>
        {over
          ? `${money(spent - budget.limitCents)} over budget`
          : `${money(budget.limitCents - spent)} left to spend`}
      </p>
    </div>
  );
}
