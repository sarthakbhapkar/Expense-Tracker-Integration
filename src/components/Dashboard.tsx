import React from "react";
import { Box, Typography, Paper, Grid, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "./NavBar";
import useExpenseStats from "../hooks/useExpenseStats";
import ExpensePieChart from "./ExpensePieChart";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { total, mostSpentCategory, recentCount } = useExpenseStats();
  
  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} mb={4}>
          <Button
            variant="outlined"
            onClick={() => navigate("/add-expense")}
            color="error"
          >
            ➕ Add Expense
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/all-expenses")}
            color="error"
          >
            📄 Show All Expenses
          </Button>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Total Expenses</Typography>
              <Typography variant="h5" color="primary">
                {total !== null ? `₹${total.toFixed(2)}` : "-"}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Most Spent Category</Typography>
              <Typography variant="body1">
                {mostSpentCategory || "-"}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Recent Activity</Typography>
              <Typography variant="body2">
                {recentCount !== null
                  ? `${recentCount} expense(s) this week`
                  : "-"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <ExpensePieChart />
    </Box>
  );
};

export default Dashboard;
