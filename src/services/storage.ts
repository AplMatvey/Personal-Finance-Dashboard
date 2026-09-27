import type { Budget, ExchangeRate, Settings, Transaction } from '../types';
import { categories } from '../data/categories';
import { isDate, isMonth, today } from '../utils/finance';

export const storageKeys = {
  transactions: 'financeflow.transactions.v1',
  budgets: 'financeflow.budgets.v1',
  settings: 'financeflow.settings.v1',
  rate: 'financeflow.rate.v1',
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function positiveCents(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
export function isTransaction(value: unknown): value is Transaction {
  return (
    isRecord(value) &&
    validId(value.id) &&
    (value.type === 'income' || value.type === 'expense') &&
    positiveCents(value.amountCents) &&
    categories.some(
      (c) => c.id === value.categoryId && c.type === value.type,
    ) &&
    isDate(value.date) &&
    value.date <= today() &&
    typeof value.description === 'string' &&
    value.description.trim().length > 0 &&
    value.description.length <= 120
  );
}
export function isTransactions(value: unknown): value is Transaction[] {
  return (
    Array.isArray(value) &&
    value.every(isTransaction) &&
    new Set(value.map((t) => t.id)).size === value.length &&
    Number.isSafeInteger(value.reduce((sum, t) => sum + t.amountCents, 0))
  );
}
function isBudget(value: unknown): value is Budget {
  return (
    isRecord(value) &&
    validId(value.id) &&
    categories.some((c) => c.id === value.categoryId && c.type === 'expense') &&
    isMonth(value.month) &&
    positiveCents(value.limitCents)
  );
}
export function isBudgets(value: unknown): value is Budget[] {
  return (
    Array.isArray(value) &&
    value.every(isBudget) &&
    new Set(value.map((b) => b.id)).size === value.length &&
    new Set(value.map((b) => `${b.month}/${b.categoryId}`)).size ===
      value.length &&
    Number.isSafeInteger(value.reduce((sum, b) => sum + b.limitCents, 0))
  );
}
export function isSettings(value: unknown): value is Settings {
  return (
    isRecord(value) &&
    (value.theme === 'light' || value.theme === 'dark') &&
    (value.displayCurrency === 'USD' || value.displayCurrency === 'EUR')
  );
}
export function isExchangeRate(value: unknown): value is ExchangeRate {
  return (
    isRecord(value) &&
    value.base === 'USD' &&
    value.quote === 'EUR' &&
    typeof value.rate === 'number' &&
    Number.isFinite(value.rate) &&
    value.rate > 0 &&
    value.rate < 100 &&
    isDate(value.date) &&
    value.date <= today()
  );
}
export interface StoredData<T> {
  data: T;
  error: string | null;
  blocked: boolean;
}
export function readStored<T>(
  key: string,
  validate: (value: unknown) => value is T,
  fallback: () => T,
  recovery: () => T = fallback,
): StoredData<T> {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return { data: fallback(), error: null, blocked: false };
    const parsed: unknown = JSON.parse(raw);
    if (!validate(parsed)) throw new Error('Invalid stored data');
    return { data: parsed, error: null, blocked: false };
  } catch {
    return {
      data: recovery(),
      error:
        'Saved data could not be read. The original has been kept. Changes to this set will not be saved until you reset it.',
      blocked: true,
    };
  }
}
export function writeStored(key: string, data: unknown): string | null {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return null;
  } catch {
    return 'Changes are only in memory. Browser storage is unavailable or full.';
  }
}
