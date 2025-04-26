import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const [dadoFormulario, setDadoFormulario] = useState({
    login: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [mostraSenha, setMostraSenha] = useState(false);
  const { login } = useUserContext();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDadoFormulario((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    const credentials = {
      login: dadoFormulario.login,
      senha: dadoFormulario.senha
    };
    
    await login(credentials);
    setLoading(false);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              backgroundColor: "primary.main",
              borderRadius: "50%",
              padding: 2,
              marginBottom: 2,
            }}
          >
            <LockOutlined sx={{ color: "white", fontSize: 30 }} />
          </Box>

          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Login
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="login"
              label="Nome"
              name="login"
              autoComplete="login"
              autoFocus
              value={dadoFormulario.login}
              onChange={handleChange}
              disabled={loading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="senha"
              label="Senha"
              type={mostraSenha ? "text" : "password"}
              id="senha"
              autoComplete="current-password"
              value={dadoFormulario.senha}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setMostraSenha(!mostraSenha)}
                      edge="end"
                    >
                      {mostraSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Entrar"
              )}
            </Button>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Não tem uma conta?{" "}
                <Button
                  color="primary"
                  onClick={() => navigate("/registrar")}
                  sx={{ textTransform: "none" }}
                >
                  Registre-se
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
