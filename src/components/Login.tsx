import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import bg from "../img.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dashboard from "./Dashboard";


const Login = () => {
  const navigate = useNavigate();
  const { login,user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitLoading(true);

    try {
      await login(email, password);
      setSnackOpen(true);
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err: any) {
      console.error("Login error", err);
      setErrorMsg(
        err?.message?.includes("Failed to fetch")
          ? "Cannot reach server. Check internet or CORS settings."
          : err.message || "Login failed. Check credentials."
      );
    } finally {
      setSubmitLoading(false);
    }
  };
if(user){
   <Dashboard />
}
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <Box
        sx={{
          backgroundColor: "rgba(255,255,255,0.85)",
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          width: 400,
          maxWidth: "90%",
        }}
        mt={8}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Typography component="h1" variant="h5" mb={2} fontWeight={600}>
          🔐 Expense Tracker Login
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            label="Email"
            type="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPass(!showPass)}
                      edge="end"
                    >
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ mt: 2 }}>
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {errorMsg}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ mt: 1, backgroundColor: "#263238" }}
              disabled={submitLoading || loading}
              startIcon={(submitLoading || loading) && <CircularProgress size={20} />}
            >
              {submitLoading || loading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnackOpen(false)}>
          Login successful 🎉
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
