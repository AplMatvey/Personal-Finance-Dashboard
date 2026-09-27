import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MoneyFormatter, Transaction } from '../types';
import { categories } from '../data/categories';
import { inMonth, monthLabel, sixMonths } from '../utils/finance';
import styles from './ui.module.css';

export function CashFlowChart({
  transactions,
  month,
  money,
}: {
  transactions: Transaction[];
  month: string;
  money: MoneyFormatter;
}) {
  const data = sixMonths(transactions, month);
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Cash flow</h2>
          <p>Your income and expenses, side by side.</p>
        </div>
        <div className={styles.legend}>
          <span>
            <i style={{ background: '#b7df88' }} />
            Income
          </span>
          <span>
            <i style={{ background: '#687e69' }} />
            Expenses
          </span>
        </div>
      </div>
      <div
        className={styles.chart}
        role="img"
        aria-label="Income and expenses for the last six months. Exact values are available in the data table below."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barGap={5}
            margin={{ top: 12, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              vertical={false}
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              width={68}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              tickFormatter={(value: number) =>
                money(value).replace(/\.00$/, '')
              }
              tickCount={4}
            />
            <Tooltip
              cursor={{ fill: 'var(--surface-hover)' }}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text)',
              }}
              formatter={(value) => money(Number(value))}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#b7df88"
              radius={[4, 4, 0, 0]}
              maxBarSize={23}
              isAnimationActive={false}
            />
            <Bar
              dataKey="expense"
              name="Expenses"
              fill="#687e69"
              radius={[4, 4, 0, 0]}
              maxBarSize={23}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className={styles.chartDetails}>
        <summary>View monthly totals</summary>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <caption className="sr-only">Cash flow totals</caption>
            <thead>
              <tr>
                <th>Month</th>
                <th>Income</th>
                <th>Expenses</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.month}>
                  <td>{monthLabel(row.month)}</td>
                  <td>{money(row.income)}</td>
                  <td>{money(row.expense)}</td>
                  <td>{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
export function SpendingChart({
  transactions,
  month,
  money,
}: {
  transactions: Transaction[];
  month: string;
  money: MoneyFormatter;
}) {
  const monthly = inMonth(transactions, month);
  const data = categories
    .filter((category) => category.type === 'expense')
    .map((category) => ({
      ...category,
      fill: category.color,
      value: monthly
        .filter((t) => t.type === 'expense' && t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amountCents, 0),
    }))
    .filter((category) => category.value > 0);
  const total = data.reduce((sum, category) => sum + category.value, 0);
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>Spending breakdown</h2>
          <p>Where your money went this month.</p>
        </div>
      </div>
      {total === 0 ? (
        <div className={styles.empty}>
          <h3>No expenses this month</h3>
          <p>Add an expense to see your spending breakdown.</p>
        </div>
      ) : (
        <>
          <div
            className={styles.donut}
            role="img"
            aria-label={`Total expenses: ${money(total)}. Category totals are listed below.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="72%"
                  outerRadius="94%"
                  paddingAngle={3}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={false}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutLabel}>
              <span>Total spent</span>
              <strong>{money(total)}</strong>
            </div>
          </div>
          <ul className={styles.spendingLegend}>
            {data.map((category) => (
              <li key={category.id}>
                <span>
                  <i style={{ background: category.color }} />
                  {category.name}
                </span>
                <strong>{money(category.value)}</strong>
                <small>{Math.round((category.value / total) * 100)}%</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
