import type { Budget, Transaction } from '../types';
import { shiftMonth, today } from '../utils/finance';

export function demoTransactions(): Transaction[] {
  const current = today();
  return [0, -1, -2]
    .flatMap((offset) => {
      const month = shiftMonth(current.slice(0, 7), offset);
      const day = (value: number) =>
        `${month}-${String(offset === 0 ? Math.min(value, Number(current.slice(8))) : value).padStart(2, '0')}`;
      return [
        {
          id: `demo-${month}-salary`,
          type: 'income' as const,
          amountCents: 480000,
          categoryId: 'salary',
          date: day(1),
          description: 'Monthly salary',
        },
        {
          id: `demo-${month}-rent`,
          type: 'expense' as const,
          amountCents: 125000,
          categoryId: 'housing',
          date: day(2),
          description: 'Apartment rent',
        },
        {
          id: `demo-${month}-food`,
          type: 'expense' as const,
          amountCents: 18650 + offset * 1250,
          categoryId: 'food',
          date: day(8),
          description: 'Weekly groceries',
        },
        {
          id: `demo-${month}-train`,
          type: 'expense' as const,
          amountCents: 6800,
          categoryId: 'transport',
          date: day(12),
          description: 'Monthly transit pass',
        },
        {
          id: `demo-${month}-project`,
          type: 'income' as const,
          amountCents: 85000 - offset * 15000,
          categoryId: 'freelance',
          date: day(18),
          description: 'Website design project',
        },
        {
          id: `demo-${month}-dinner`,
          type: 'expense' as const,
          amountCents: 6450,
          categoryId: 'food',
          date: day(23),
          description: 'Dinner with friends',
        },
      ];
    })
    .concat([
      {
        id: 'demo-cinema',
        type: 'expense',
        amountCents: 2800,
        categoryId: 'entertainment',
        date: current,
        description: 'Friday movie night',
      },
      {
        id: 'demo-pharmacy',
        type: 'expense',
        amountCents: 3450,
        categoryId: 'health',
        date: current,
        description: 'Pharmacy essentials',
      },
    ]);
}
export function demoBudgets(): Budget[] {
  return [
    ['food', 40000],
    ['housing', 140000],
    ['transport', 12000],
    ['entertainment', 15000],
  ].map(([categoryId, limitCents]) => ({
    id: `budget-${categoryId}`,
    categoryId: String(categoryId),
    limitCents: Number(limitCents),
    month: today().slice(0, 7),
  }));
}
