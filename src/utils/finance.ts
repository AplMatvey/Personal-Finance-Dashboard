import type { Budget, Transaction, TransactionType } from '../types';

export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function isMonth(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(value) &&
    value.slice(0, 4) !== '0000'
  );
}
export function isDate(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !isMonth(value.slice(0, 7))
  )
    return false;
  const date = new Date(`${value}T12:00:00`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === Number(value.slice(0, 4)) &&
    date.getMonth() + 1 === Number(value.slice(5, 7)) &&
    date.getDate() === Number(value.slice(8))
  );
}
export function parseAmount(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}
export function amountInput(cents: number) {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}
export function monthLabel(month: string, short = false) {
  return new Intl.DateTimeFormat('en-US', {
    month: short ? 'short' : 'long',
    ...(short ? {} : { year: 'numeric' as const }),
  }).format(new Date(`${month}-01T12:00:00`));
}
export function shiftMonth(month: string, offset: number) {
  const date = new Date(`${month}-01T12:00:00`);
  date.setMonth(date.getMonth() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
export function totals(transactions: Transaction[]) {
  return transactions.reduce(
    (result, transaction) => {
      result[transaction.type] += transaction.amountCents;
      result.balance +=
        transaction.type === 'income'
          ? transaction.amountCents
          : -transaction.amountCents;
      return result;
    },
    { income: 0, expense: 0, balance: 0 },
  );
}
export function inMonth(transactions: Transaction[], month: string) {
  return transactions.filter((transaction) =>
    transaction.date.startsWith(month),
  );
}
export function budgetSpent(budget: Budget, transactions: Transaction[]) {
  return transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.categoryId === budget.categoryId &&
        t.date.startsWith(budget.month),
    )
    .reduce((sum, t) => sum + t.amountCents, 0);
}
export interface Filters {
  search: string;
  type: TransactionType | '';
  category: string;
  month: string;
  sort: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}
export const defaultFilters: Filters = {
  search: '',
  type: '',
  category: '',
  month: '',
  sort: 'date-desc',
};
export function filterTransactions(
  transactions: Transaction[],
  filters: Filters,
) {
  return transactions
    .filter(
      (t) =>
        t.description
          .toLowerCase()
          .includes(filters.search.trim().toLowerCase()) &&
        (!filters.type || t.type === filters.type) &&
        (!filters.category || t.categoryId === filters.category) &&
        (!filters.month || t.date.startsWith(filters.month)),
    )
    .sort((a, b) => {
      const difference = filters.sort.startsWith('date')
        ? a.date.localeCompare(b.date)
        : a.amountCents - b.amountCents;
      return filters.sort.endsWith('asc') ? difference : -difference;
    });
}
export function sixMonths(transactions: Transaction[], month: string) {
  return Array.from({ length: 6 }, (_, index) => {
    const key = shiftMonth(month, index - 5);
    return {
      month: key,
      label: monthLabel(key, true),
      ...totals(inMonth(transactions, key)),
    };
  });
}
