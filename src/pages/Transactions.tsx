import { useState } from 'react';
import type { MoneyFormatter, Transaction, TransactionType } from '../types';
import { categories } from '../data/categories';
import {
  defaultFilters,
  filterTransactions,
  type Filters,
} from '../utils/finance';
import { PageHeading } from '../components/PageHeading';
import { TransactionTable } from '../components/TransactionTable';
import { Icon } from '../components/Icon';
import styles from '../components/ui.module.css';

export default function Transactions({
  transactions,
  money,
  onAdd,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  money: MoneyFormatter;
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const filtered = filterTransactions(transactions, filters);
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(defaultFilters);
  function setType(type: TransactionType | '') {
    setFilters((current) => ({
      ...current,
      type,
      category:
        type &&
        !categories.some((c) => c.id === current.category && c.type === type)
          ? ''
          : current.category,
    }));
  }
  return (
    <>
      <PageHeading
        title="Every little detail."
        description="Keep track of what comes in and what goes out."
      >
        <button className={styles.primary} onClick={onAdd}>
          <Icon name="plus" size={18} />
          Add transaction
        </button>
      </PageHeading>
      <section className={styles.panel}>
        <div className={styles.filters}>
          <label className={styles.search}>
            <span className="sr-only">Search transactions</span>
            <Icon name="search" size={18} />
            <input
              placeholder="Search transactions…"
              value={filters.search}
              onChange={(event) =>
                setFilters({ ...filters, search: event.target.value })
              }
            />
          </label>
          <label>
            Type
            <select
              value={filters.type}
              onChange={(event) =>
                setType(event.target.value as TransactionType | '')
              }
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
          <label>
            Category
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters({ ...filters, category: event.target.value })
              }
            >
              <option value="">All categories</option>
              {categories
                .filter((c) => !filters.type || c.type === filters.type)
                .map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Month (blank = all time)
            <input
              type="month"
              value={filters.month}
              onChange={(event) =>
                setFilters({ ...filters, month: event.target.value })
              }
            />
          </label>
          <label>
            Sort by
            <select
              value={filters.sort}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  sort: event.target.value as Filters['sort'],
                })
              }
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="amount-desc">Highest amount</option>
              <option value="amount-asc">Lowest amount</option>
            </select>
          </label>
        </div>
        <div className={styles.resultsHeader}>
          <p role="status">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'transaction' : 'transactions'}
            {filters.month ? '' : ' · All time'}
          </p>
          <button
            className={styles.textButton}
            disabled={!hasFilters}
            onClick={() => setFilters(defaultFilters)}
          >
            Reset filters
          </button>
        </div>
        {filtered.length ? (
          <TransactionTable
            transactions={filtered}
            money={money}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : (
          <div className={styles.empty}>
            <Icon name="search" size={32} />
            <h3>
              {transactions.length
                ? 'No matching transactions'
                : 'A clean slate'}
            </h3>
            <p>
              {transactions.length
                ? 'Try another search or clear your filters.'
                : 'Start with a coffee, a grocery trip, or your latest payday.'}
            </p>
            <button
              className={styles.secondary}
              onClick={
                transactions.length ? () => setFilters(defaultFilters) : onAdd
              }
            >
              {transactions.length
                ? 'Reset filters'
                : 'Add your first transaction'}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
