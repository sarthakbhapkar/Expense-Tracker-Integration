import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import type { Expense } from "../types/types";
import Navbar from "./NavBar";

const categories = ["Food", "Travel", "Bills", "Entertainment", "Other"];

const ExpenseForm: React.FC = () => {
  const { index } = useParams<{ index?: string }>();
  const navigate = useNavigate();
  const { expenses, addExpense, updateExpense } = useExpenses();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = index !== undefined;

  useEffect(() => {
    if (isEdit) {
      const idx = parseInt(index!, 10);
      const expense = expenses[idx];
      if (expense) {
        setTitle(expense.title);
        setAmount(expense.amount);
        setDate(expense.date);
        setCategory(expense.category);
      }
    }
  }, [index, expenses, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !amount || !date || !category) {
      setError("Please fill all fields");
      return;
    }

    const newExpense: Expense = {
      id: isEdit ? expenses[parseInt(index!, 10)].id : crypto.randomUUID(),
      title,
      amount: Number(amount),
      date,
      category,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateExpense(newExpense);
      } else {
        await addExpense(newExpense);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/all-expenses");
      }, 800);
    } catch (err: any) {
      console.error("Expense save error:", err);
      setError(err?.message ?? "Failed to save expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Navbar />
      <Box
        sx={{
          maxWidth: 500,
          mx: "auto",
          mt: 8,
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "white",
        }}
      >
        <Typography variant="h5" gutterBottom>
          {isEdit ? "✏️ Edit Expense" : "➕ Add Expense"}
        </Typography>

        {showSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Expense {isEdit ? "updated" : "added"} successfully.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            select
            fullWidth
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            margin="normal"
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <Button
            type="submit"
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            fullWidth
            disabled={submitting}
          >
            {isEdit ? (submitting ? "Saving..." : "Save Changes") : (submitting ? "Saving..." : "Save Expense")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ExpenseForm;
