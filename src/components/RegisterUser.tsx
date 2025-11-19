import {
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../img.jpg";

const RegisterUser = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<"success" | "error">(
    "success"
  );
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSnackOpen(false);

    if (!name.trim() || !email.trim() || !password) {
      setSnackMsg("Please fill all fields");
      setSnackSeverity("error");
      setSnackOpen(true);
      return;
    }

    const body = {
      ExpUsersAlias: {
        ds: "ExpUsers",
        data: [
          {
            _rs: "I",
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          },
        ],
      },
    };

    const API_BASE = process.env.REACT_APP_CLOUDIO_BASE;
    const AUTH_TOKEN = process.env.REACT_APP_CLOUDIO_AUTH_TOKEN;
    const XAPI_KEY = process.env.REACT_APP_CLOUDIO_XAPIKEY;
    const APP_NAME = process.env.REACT_APP_CLOUDIO_APPNAME || "Training";

    if (!API_BASE || !AUTH_TOKEN || !XAPI_KEY) {
      setSnackMsg("App configuration missing. Contact admin.");
      setSnackSeverity("error");
      setSnackOpen(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: AUTH_TOKEN,
          "x-api-key": XAPI_KEY,
          "X-Application": APP_NAME,
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("Raw response:", response);

      if (!response.ok) {
        console.log("Hiii")
        const text = await response.text();
        console.error("Error response:", text);
        throw new Error(`HTTP ${response.status}`);
      }

      console.log("Before Resp")
      const json = await response.json();
      console.log("SUCCESS! CloudIO response →", json);

      //const inserted = json?.data?.length > 0;

       setSnackMsg("Registration successful! 🎉");
        setSnackSeverity("success");
        setSnackOpen(true);
        setTimeout(() => navigate("/"), 1500);

      // if (inserted) {
      //   setSnackMsg("Registration successful! 🎉");
      //   setSnackSeverity("success");
      //   setSnackOpen(true);
      //   setTimeout(() => navigate("/"), 1500);
      // } else {
      //   throw new Error("User not created on server");
      // }
    } catch (err: any) {
      console.error("Registration error:", err);
      setSnackMsg(
        err.message.includes("Failed to fetch")
          ? "Cannot reach server. Check internet or CORS settings."
          : err.message || "Registration failed. Try again."
      );
      setSnackSeverity("error");
      setSnackOpen(true);
    } finally {
      setLoading(false);
    }
  };

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
      }}
    >
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.92)",
          p: 4,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          width: 420,
          maxWidth: "95%",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={3}
          color="#263238"
        >
          Create Account
        </Typography>

        <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              backgroundColor: "#263238",
              "&:hover": { bgcolor: "#1c2429" },
            }}
          >
            {loading ? "Creating Account..." : "Register"}
          </Button>
        </Box>

        <Typography textAlign="center" color="text.secondary">
          Already have an account?{" "}
          <span
            style={{ color: "#1976d2", cursor: "pointer", fontWeight: 500 }}
            onClick={() => navigate("/")}
          >
            Sign in
          </span>
        </Typography>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackSeverity}
          sx={{ width: "100%" }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RegisterUser;
