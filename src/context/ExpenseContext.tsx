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

  const API_BASE = process.env.REACT_APP_CLOUDIO_BASE;
  const AUTH_TOKEN = process.env.REACT_APP_CLOUDIO_AUTH_TOKEN;
  const XAPI_KEY = process.env.REACT_APP_CLOUDIO_XAPIKEY;
  const APP_NAME = process.env.REACT_APP_CLOUDIO_APPNAME || "Training";

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

      const res = await fetch(API_BASE!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: AUTH_TOKEN!,
          "x-api-key": XAPI_KEY!,
          "X-Application": APP_NAME,
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

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

    await fetch(API_BASE!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN!,
        "x-api-key": XAPI_KEY!,
        "X-Application": APP_NAME,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    fetchExpenses();
  };

  // ----------------------------------------
  // 3️. Edit expense
  // ----------------------------------------
  const updateExpense = async (exp: Expense) => {
    if (!exp?.id) throw new Error("Missing expense id");
    if (!API_BASE || !AUTH_TOKEN || !XAPI_KEY)
      throw new Error("App configuration missing");

    try {
      const fetchBody = {
        ExpExpensesAlias: {
          ds: "Expenses",
          query: {
            filter: [{ id: { is: Number(exp.id) } }],
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

      const fetchRes = await fetch(API_BASE!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: AUTH_TOKEN!,
          "x-api-key": XAPI_KEY!,
          "X-Application": APP_NAME,
          Accept: "application/json",
        },
        body: JSON.stringify(fetchBody),
      });

      if (!fetchRes.ok) {
        const txt = await fetchRes.text().catch(() => "");
        throw new Error(`Failed to fetch row: ${txt || fetchRes.status}`);
      }

      const fetchJson = await fetchRes.json();
      const row = fetchJson?.data?.ExpExpensesAlias?.data?.[0];
      if (!row) throw new Error("Row not found on server");

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

      const updateRes = await fetch(API_BASE!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: AUTH_TOKEN!,
          "x-api-key": XAPI_KEY!,
          "X-Application": APP_NAME,
          Accept: "application/json",
        },
        body: JSON.stringify(updateBody),
      });

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
    } catch (err) {
      console.error("updateExpense error:", err);
      throw err;
    }
  };

  // ----------------------------------------
  // 4️. Delete expense
  // ----------------------------------------
  const deleteExpense = async (id: string) => {
    const body = {
      ExpExpensesAlias: {
        ds: "Expenses",
        data: [{ _rs: "D", id }],
      },
    };

    await fetch(API_BASE!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN!,
        "x-api-key": XAPI_KEY!,
        "X-Application": APP_NAME,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    fetchExpenses();
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
