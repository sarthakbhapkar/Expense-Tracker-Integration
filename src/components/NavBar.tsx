import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  const {logout} = useAuth();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (storedUser) {
      setUserName(storedUser.name);
    }
  }, []);

  // const handleLogout = () => {
  //   localStorage.removeItem("isLoggedIn");
  //   localStorage.removeItem("currentUser");
  //   window.dispatchEvent(new Event("currentUserChange"));
  //   navigate("/login");
  // };

  return (
    <AppBar position="static" color="default" sx={{ mb: 4 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            Expense Tracker
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {userName && (
            <Typography variant="h6" sx={{ fontWeight: 500, color: "#333" }}>
              👋 Hello, {userName}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button color="inherit" onClick={() => navigate("/add-expense")}>
            Add Expense
          </Button>
          <Button color="inherit" onClick={() => navigate("/all-expenses")}>
            Show All Expenses
          </Button>
          <Button color="error" variant="outlined" onClick={logout}>
            Sign Out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
