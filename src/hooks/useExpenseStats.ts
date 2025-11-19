import { useEffect, useState } from "react";
import type { Expense, ExpenseStats } from "../types/types";
import { useExpenses } from "../context/ExpenseContext";

const useExpenseStats = (): ExpenseStats => {
  const { expenses } = useExpenses();
  const [total, setTotal] = useState<number | null>(null);
  const [mostSpentCategory, setMostSpentCategory] = useState<string | null>(
    null
  );
  const [recentCount, setRecentCount] = useState<number | null>(null);

  useEffect(() => {
    calculateStats(expenses);
  }, [expenses]);

  const calculateStats = (data: Expense[]) => {
    if (data.length === 0) {
      setTotal(0);
      setMostSpentCategory(null);
      setRecentCount(0);
      return;
    }

    const totalAmount = data.reduce((sum, e) => sum + e.amount, 0);
    setTotal(totalAmount);

    let maxCategory: string | null = null;
    let maxAmount = 0;
    const categoryTotals = new Map<string, number>();

    for (const { category, amount } of data) {
      const total = (categoryTotals.get(category) || 0) + amount;
      categoryTotals.set(category, total);

      if (total > maxAmount) {
        maxAmount = total;
        maxCategory = category;
      }
    }

    setMostSpentCategory(maxCategory);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recent = data.filter((e) => new Date(e.date) >= oneWeekAgo).length;
    setRecentCount(recent);
  };

  return {
    total,
    mostSpentCategory,
    recentCount,
    expenses,
  };
};

export default useExpenseStats;
