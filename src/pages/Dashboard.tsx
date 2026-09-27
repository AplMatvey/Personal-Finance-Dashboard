import { Link } from 'react-router-dom';
import type { Budget, MoneyFormatter, Transaction } from '../types';
import { SummaryCards } from '../components/SummaryCards';
import { CashFlowChart, SpendingChart } from '../components/Charts';
import { TransactionTable } from '../components/TransactionTable';
import { BudgetProgress } from '../components/BudgetProgress';
import { MonthPicker, PageHeading } from '../components/PageHeading';
import { Icon } from '../components/Icon';
import { filterTransactions, defaultFilters } from '../utils/finance';
import styles from '../components/ui.module.css';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  month: string;
  setMonth: (value: string) => void;
  money: MoneyFormatter;
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}
export default function Dashboard({
  transactions,
  budgets,
  month,
  setMonth,
  money,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const recent = filterTransactions(transactions, defaultFilters).slice(0, 5);
  const monthlyBudgets = budgets.filter((budget) => budget.month === month);
  return (
    <>
      <PageHeading
        title="A little clarity. A lot of possibility."
        description="Welcome back. Here’s how your finances are looking."
      >
        <MonthPicker month={month} onChange={setMonth} />
        <button className={styles.primary} onClick={onAdd}>
          <Icon name="plus" size={18} />
          Add transaction
        </button>
      </PageHeading>
      <SummaryCards transactions={transactions} month={month} money={money} />
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
      <div className={styles.bottomGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Recent transactions</h2>
              <p>The latest activity, all in one place.</p>
            </div>
            <Link className={styles.subtleLink} to="/transactions">
              View all
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
          {recent.length ? (
            <TransactionTable
              transactions={recent}
              money={money}
              onEdit={onEdit}
              onDelete={onDelete}
              compact
            />
          ) : (
            <div className={styles.empty}>
              <Icon name="transactions" size={30} />
              <h3>Your fresh start begins here</h3>
              <p>Add your first transaction to get the full picture.</p>
              <button className={styles.primary} onClick={onAdd}>
                Add transaction
              </button>
            </div>
          )}
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Budget check-in</h2>
              <p>A little room for what matters.</p>
            </div>
            <Link
              className={styles.iconButton}
              to="/budget"
              aria-label="Manage budgets"
            >
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
          {monthlyBudgets.length ? (
            <div className={styles.budgetList}>
              {monthlyBudgets.slice(0, 3).map((budget) => (
                <BudgetProgress
                  key={budget.id}
                  budget={budget}
                  transactions={transactions}
                  money={money}
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <h3>Make a plan for this month</h3>
              <p>Set a limit and give your spending some direction.</p>
              <Link to="/budget" className={styles.subtleLink}>
                Create a budget
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
