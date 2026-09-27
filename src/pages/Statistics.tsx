import type { MoneyFormatter, Transaction } from '../types';
import { MonthPicker, PageHeading } from '../components/PageHeading';
import { CashFlowChart, SpendingChart } from '../components/Charts';
import { inMonth, totals } from '../utils/finance';
import styles from '../components/ui.module.css';
export default function Statistics({
  transactions,
  month,
  setMonth,
  money,
}: {
  transactions: Transaction[];
  month: string;
  setMonth: (month: string) => void;
  money: MoneyFormatter;
}) {
  const monthly = inMonth(transactions, month);
  const summary = totals(monthly);
  const savingRate =
    summary.income > 0
      ? Math.round((summary.balance / summary.income) * 100)
      : null;
  return (
    <>
      <PageHeading
        title="See the bigger picture."
        description="Turn your everyday transactions into a better understanding."
      >
        <MonthPicker month={month} onChange={setMonth} />
      </PageHeading>
      <div className={styles.budgetOverview}>
        <div>
          <span>Net this month</span>
          <strong>{money(summary.balance)}</strong>
        </div>
        <div>
          <span>Savings rate</span>
          <strong>{savingRate === null ? '—' : `${savingRate}%`}</strong>
          <small>
            {savingRate === null
              ? 'Add income to calculate this'
              : 'Share of income left after expenses'}
          </small>
        </div>
        <div>
          <span>Transactions this month</span>
          <strong>{monthly.length}</strong>
        </div>
      </div>
      <div className={styles.chartGrid}>
        <CashFlowChart
          transactions={transactions}
          month={month}
          money={money}
        />
        <SpendingChart
          transactions={transactions}
          month={month}
          money={money}
        />
      </div>
      <p className={styles.footnote}>
        Calculated from your recorded transactions. Months without activity are
        shown as zero.
      </p>
    </>
  );
}
