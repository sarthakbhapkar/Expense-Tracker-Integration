import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useExpenses } from '../context/ExpenseContext';
import type{PieData} from '../types/types'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EF9', '#F08080'];

const ExpensePieChart: React.FC = () => {
  const {expenses}=useExpenses();

  const categoryTotals: Record<string, number> = expenses.reduce((acc, expense) => {
    const category = expense.category;
    const amount = Number(expense.amount);

    if (!acc[category]) {
      acc[category] = 0;
    }

    acc[category] += amount;

    return acc;
  }, {} as Record<string, number>);

  const data: PieData[] = Object.entries(categoryTotals).map(([category, total]) => ({
    name: category,
    value: total,
  }));

  if (data.length === 0) {
    return <p style={{ textAlign: 'center' }}>No expense data to show.</p>;
  }

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3 style={{ textAlign: 'center' }}>💸 Expense by Category</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={130}
            label
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart;
