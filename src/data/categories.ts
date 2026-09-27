import type { Category } from '../types';

export const categories: Category[] = [
  { id: 'salary', name: 'Salary', type: 'income', color: '#b7df88' },
  { id: 'freelance', name: 'Freelance', type: 'income', color: '#84c9aa' },
  { id: 'food', name: 'Food', type: 'expense', color: '#b7df88' },
  { id: 'transport', name: 'Transport', type: 'expense', color: '#94bada' },
  { id: 'housing', name: 'Housing', type: 'expense', color: '#b8a3d5' },
  {
    id: 'entertainment',
    name: 'Entertainment',
    type: 'expense',
    color: '#e6bb81',
  },
  { id: 'health', name: 'Health', type: 'expense', color: '#dc979b' },
  { id: 'other', name: 'Other', type: 'expense', color: '#8eaaa0' },
];
export function getCategory(id: string) {
  return categories.find((category) => category.id === id)!;
}
