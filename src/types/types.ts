export type Expense = {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
};

export type ExpenseStats = {
  total: number | null;
  mostSpentCategory: string | null;
  recentCount: number | null;
  expenses: Expense[];
};

export type ExpenseContextType = {
  expenses: Expense[];
  addExpense: (e: Expense) => Promise<void> | void;
  updateExpense: (e: Expense) => Promise<void> | void;
  deleteExpense: (id: string) => Promise<void> | void;
  loading: boolean;
  error: string | null;
  refresh?: () => Promise<void>;
};

export type PieData = {
  name: string;
  value: number;
  [key: string]: string | number | undefined;
};
