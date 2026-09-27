import type { MoneyFormatter, Transaction } from '../types';
import { getCategory } from '../data/categories';
import { formatDate } from '../utils/finance';
import { Icon, type IconName } from './Icon';
import styles from './ui.module.css';

export function TransactionTable({
  transactions,
  money,
  onEdit,
  onDelete,
  compact = false,
}: {
  transactions: Transaction[];
  money: MoneyFormatter;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  compact?: boolean;
}) {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Category</th>
            <th>Date</th>
            {!compact && <th>Type</th>}
            <th className={styles.numeric}>Amount</th>
            {!compact && (
              <th>
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const category = getCategory(t.categoryId);
            return (
              <tr key={t.id}>
                <td>
                  <div className={styles.transactionName}>
                    <span
                      className={styles.categoryIcon}
                      style={{ color: category.color }}
                    >
                      <Icon name={category.id as IconName} size={19} />
                    </span>
                    <button
                      className={styles.textButton}
                      onClick={() => onEdit(t)}
                      title={`Edit ${t.description}`}
                    >
                      {t.description}
                    </button>
                  </div>
                </td>
                <td>
                  <span className={styles.categoryTag}>{category.name}</span>
                </td>
                <td className={styles.date}>{formatDate(t.date)}</td>
                {!compact && (
                  <td>
                    <span className={styles.type}>{t.type}</span>
                  </td>
                )}
                <td
                  className={`${styles.numeric} ${t.type === 'income' ? styles.positive : ''}`}
                >
                  <span className="sr-only">
                    {t.type === 'income' ? 'Income' : 'Expense'}{' '}
                  </span>
                  {t.type === 'income' ? '+' : '−'}
                  {money(t.amountCents)}
                </td>
                {!compact && (
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.iconButton}
                        onClick={() => onEdit(t)}
                        aria-label={`Edit ${t.description}`}
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        className={styles.iconButton}
                        onClick={() => onDelete(t)}
                        aria-label={`Delete ${t.description}`}
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
