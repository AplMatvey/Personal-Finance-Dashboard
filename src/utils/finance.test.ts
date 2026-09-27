import { describe, expect, it } from 'vitest';
import {
  amountInput,
  budgetSpent,
  defaultFilters,
  filterTransactions,
  inMonth,
  isDate,
  parseAmount,
  shiftMonth,
  sixMonths,
  totals,
} from './finance';
import type { Budget, Transaction } from '../types';

const transactions: Transaction[] = [
  {
    id: 'salary',
    type: 'income',
    amountCents: 100000,
    categoryId: 'salary',
    date: '2025-02-01',
    description: 'Monthly salary',
  },
  {
    id: 'food',
    type: 'expense',
    amountCents: 1234,
    categoryId: 'food',
    date: '2025-02-02',
    description: 'Grocery SHOP',
  },
  {
    id: 'old-food',
    type: 'expense',
    amountCents: 4567,
    categoryId: 'food',
    date: '2025-01-02',
    description: 'Grocery shop',
  },
  {
    id: 'bus',
    type: 'expense',
    amountCents: 650,
    categoryId: 'transport',
    date: '2025-02-02',
    description: 'Bus pass',
  },
];
describe('money input', () => {
  it('preserves cents when reopening a very large amount for editing', () => {
    expect(amountInput(9007199254740990)).toBe('90071992547409.90');
    expect(parseAmount(amountInput(9007199254740990))).toBe(9007199254740990);
  });
  it.each([
    ['12.34', 1234],
    ['12,34', 1234],
    [' 12.3 ', 1230],
    ['0.01', 1],
    ['001', 100],
  ])('parses %s into cents', (input, expected) =>
    expect(parseAmount(input)).toBe(expected),
  );
  it.each([
    '',
    ' ',
    '0',
    '-1',
    '1.234',
    '1,234',
    '12usd',
    '1e3',
    'Infinity',
    '1.2.3',
    '9007199254740992',
    '.50',
    '12.',
  ])('rejects %s', (input) => expect(parseAmount(input)).toBeNull());
});
describe('calendar dates', () => {
  it('rejects nonexistent dates and accepts leap days', () => {
    expect(isDate('2025-02-29')).toBe(false);
    expect(isDate('2024-02-29')).toBe(true);
    expect(isDate('2025-04-31')).toBe(false);
    expect(isDate('2025-13-01')).toBe(false);
  });
  it('crosses year boundaries without shifting days', () => {
    expect(shiftMonth('2025-01', -1)).toBe('2024-12');
    expect(sixMonths([], '2025-02').map((row) => row.month)).toEqual([
      '2024-09',
      '2024-10',
      '2024-11',
      '2024-12',
      '2025-01',
      '2025-02',
    ]);
  });
});
describe('derived financial data', () => {
  it('calculates exact all-time and monthly totals', () => {
    expect(totals(transactions)).toEqual({
      income: 100000,
      expense: 6451,
      balance: 93549,
    });
    expect(totals(inMonth(transactions, '2025-02'))).toEqual({
      income: 100000,
      expense: 1884,
      balance: 98116,
    });
    expect(totals([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });
  it('combines filters without mutating the original array', () => {
    const original = [...transactions];
    const result = filterTransactions(transactions, {
      ...defaultFilters,
      search: 'GROCERY',
      type: 'expense',
      category: 'food',
      month: '2025-02',
    });
    expect(result.map((t) => t.id)).toEqual(['food']);
    expect(transactions).toEqual(original);
  });
  it('sorts stably for equal dates and sorts amounts', () => {
    expect(
      filterTransactions(transactions, defaultFilters)
        .slice(0, 2)
        .map((t) => t.id),
    ).toEqual(['food', 'bus']);
    expect(
      filterTransactions(transactions, {
        ...defaultFilters,
        sort: 'amount-asc',
      })[0].id,
    ).toBe('bus');
  });
  it('counts only expenses for a budget category and month', () => {
    const budget: Budget = {
      id: 'b',
      categoryId: 'food',
      month: '2025-02',
      limitCents: 1000,
    };
    expect(budgetSpent(budget, transactions)).toBe(1234);
    expect(budgetSpent(budget, transactions)).toBeGreaterThan(
      budget.limitCents,
    );
  });
  it('fills empty chart months with zeroes', () => {
    const data = sixMonths(transactions, '2025-02');
    expect(data).toHaveLength(6);
    expect(data[0].expense).toBe(0);
    expect(data[5].expense).toBe(1884);
  });
});
