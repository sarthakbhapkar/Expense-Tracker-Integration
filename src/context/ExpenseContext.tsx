import React, { createContext, useContext, useEffect, useState } from "react";
import type { Expense, ExpenseContextType } from "../types/types";
import { useAuth } from "../context/AuthContext";

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------
  // 1️. Fetch expenses for the logged-in user
  // ----------------------------------------
  const fetchExpenses = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const body = {
        ExpExpensesAlias: {
          ds: "Expenses",
          query: {
            filter: [{ email: { is: user.email } }],
            projection: { id: 1, title: 1, amount: 1, date: 1, category: 1 },
            limit: 1000,
          },
        },
      };

      const res = await fetch(
        `https://dev.cloudio.io/v1/api?x=${encodeURIComponent(user.x)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Application": "training",
            Authorization: user.jwt,
          },
          body: JSON.stringify(body),
        }
      );

      const json = await res.json();
      const rows = json?.data?.ExpExpensesAlias?.data ?? [];

      setExpenses(
        rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          amount: Number(r.amount),
          date: r.date,
          category: r.category,
        }))
      );
    } catch (err: any) {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user?.email]);

  // ----------------------------------------
  // 2️. Add expense
  // ----------------------------------------
  const addExpense = async (exp: Expense) => {
    if (!user?.email) return;
    const body = {
      ExpExpensesAlias: {
        ds: "Expenses",
        data: [
          {
            _rs: "I",
            email: user?.email,
            title: exp.title,
            amount: exp.amount,
            date: exp.date,
            category: exp.category,
          },
        ],
      },
    };

    const res = await fetch(
      `https://dev.cloudio.io/v1/api?x=${encodeURIComponent(user.x)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Application": "training",
          Authorization: user.jwt,
        },
        body: JSON.stringify(body),
      }
    );
    fetchExpenses();
  };

  // ----------------------------------------
  // 3️. Edit expense
  // ----------------------------------------
  const updateExpense = async (exp: Expense) => {
    if (!exp?.id) throw new Error("Missing expense id");
    if (!user?.x || !user?.jwt) {
      throw new Error("User session missing. Please login again.");
    }

    setLoading(true);
    setError(null);

    try {
      // 1) Fetch the existing row using the API route (using user.x + jwt)
      const fetchBody = {
        ExpExpensesAlias: {
          ds: "Expenses",
          query: {
            filter: [{ id: { is: Number(exp.id) }}],
            projection: {
              id: 1,
              title: 1,
              amount: 1,
              date: 1,
              category: 1,
              creationDate: 1,
              createdBy: 1,
              lastUpdateDate: 1,
              lastUpdatedBy: 1,
              userId: 1,
            },
            limit: 1,
            offset: 0,
          },
        },
      };

      const fetchRes = await fetch(
        `https://dev.cloudio.io/v1/api?x=${encodeURIComponent(user.x)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Application": "training",
            Authorization: user.jwt,
          },
          body: JSON.stringify(fetchBody),
        }
      );

      if (!fetchRes.ok) {
        const txt = await fetchRes.text().catch(() => "");
        throw new Error(`Failed to fetch row: ${txt || fetchRes.status}`);
      }

      const fetchJson = await fetchRes.json();
      const row = fetchJson?.data?.ExpExpensesAlias?.data?.[0];
      if (!row) throw new Error("Row not found on server");

      // 2) Build update payload merging current values with new values
      const updateData = {
        _rs: "U",
        id: row.id,
        title: exp.title,
        amount: exp.amount,
        date: exp.date,
        category: exp.category,
        creationDate: row.creationDate,
        createdBy: row.createdBy,
        lastUpdateDate: row.lastUpdateDate,
        lastUpdatedBy: row.lastUpdatedBy,
        userId: user?.id ?? row.userId ?? null,
      };

      const updateBody = {
        ExpExpensesAlias: {
          ds: "Expenses",
          data: [updateData],
        },
      };

      // 3) Send update using the same endpoint pattern
      const updateRes = await fetch(
        `https://dev.cloudio.io/v1/api?x=${encodeURIComponent(user.x)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Application": "training",
            Authorization: user.jwt,
          },
          body: JSON.stringify(updateBody),
        }
      );

      if (!updateRes.ok) {
        const txt = await updateRes.text().catch(() => "");
        throw new Error(`Update failed: ${txt || updateRes.status}`);
      }

      const updateJson = await updateRes.json();
      if (updateJson?.status && updateJson.status !== "OK") {
        throw new Error(
          updateJson?.message ?? updateJson?.title ?? "Update failed"
        );
      }

      await fetchExpenses();
    } catch (err: any) {
      console.error("updateExpense error:", err);
      setError(err?.message ?? "Failed to update expense");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // ----------------------------------------
  // 4️. Delete expense
  // ----------------------------------------
  const deleteExpense = async (id: string) => {
    if (!id) throw new Error("Missing id to delete");
    if (!user?.x || !user?.jwt) {
      throw new Error("User session missing. Please login again.");
    }

    setLoading(true);
    setError(null);

    try {
      const fetchBody = {
        ExpExpensesAlias: {
          ds: "Expenses",
          query: {
            filter: [{ id: { is: Number(id) } }],
            projection: { id: 1, lastUpdateDate: 1 },
            limit: 1,
            offset: 0,
          },
        },
      };

      const fetchRes = await fetch(
        `https://dev.cloudio.io/v1/api?x=${encodeURIComponent(String(user.x))}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Application": "training",
            Authorization: `Bearer ${user.jwt}`,
          },
          body: JSON.stringify(fetchBody),
        }
      );

      if (!fetchRes.ok) {
        const txt = await fetchRes.text().catch(() => "");
        throw new Error(`Failed to fetch row: ${txt || fetchRes.status}`);
      }

      const fetchJson = await fetchRes.json();
      const row = fetchJson?.data?.ExpExpensesAlias?.data?.[0];
      if (!row) throw new Error("Row not found on server");

      const deleteBody = {
        ExpExpensesAlias: {
          ds: "Expenses",
          data: [
            {
              _rs: "D",
              id: row.id,
              lastUpdateDate: row.lastUpdateDate,
            },
          ],
        },
      };

      const res = await fetch(
        `https://dev.cloudio.io/v1/api?x=${encodeURIComponent(String(user.x))}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Application": "training",
            Authorization: `Bearer ${user.jwt}`,
          },
          body: JSON.stringify(deleteBody),
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Delete failed: ${txt || res.status}`);
      }

      await fetchExpenses();
    } catch (err: any) {
      console.error("deleteExpense error:", err);
      setError("Failed to delete expense");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // expose functions
  // ----------------------------------------
  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        loading,
        error,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used inside ExpenseProvider");
  return ctx;
};
