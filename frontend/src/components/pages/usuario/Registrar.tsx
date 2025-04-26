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
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonAddOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { IUsuario } from "../../../interfaces/IUsuario";
import { api } from "../../../utils/api";
import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";

const Registrar = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<IUsuario>({
    login: "",
    email: "",
    senha: "",
    confirmacao_senha: "",
    nivel_acesso: "user",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApiError = (error: unknown) => {
    let errorMessage = "Ocorreu um erro inesperado";

    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error(errorMessage);
    setError(errorMessage);
  };

  const validateForm = (): boolean => {
    if (usuario.senha !== usuario.confirmacao_senha) {
      setError("As senhas não coincidem");
      toast.error("As senhas não coincidem");
      return false;
    }
    if (usuario.senha.length <= 3) {
      toast.error("A senha deve ter pelo menos 3 caracteres");
      setError("A senha deve ter pelo menos 3 caracteres");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/usuarios/create", usuario);
      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
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
            <PersonAddOutlined sx={{ color: "white", fontSize: 30 }} />
          </Box>

          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Criar Conta
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="login"
              label="Nome de login"
              name="login"
              autoComplete="login"
              autoFocus
              value={usuario.login}
              onChange={handleChange}
              disabled={loading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              type="email"
              value={usuario.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="senha"
              label="Senha"
              type={showPassword ? "text" : "password"}
              id="password"
              value={usuario.senha}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmacao_senha"
              label="Confirmar Senha"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={usuario.confirmacao_senha}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="nivel_acesso"
              label="Nível de Acesso"
              type="text"
              id="nivel_acesso"
              sx={{ display: "none" }}
              inputProps={{
                "aria-hidden": true,
              }}
              value={usuario.nivel_acesso}
              onChange={handleChange}
              disabled={loading}
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
                "Registrar"
              )}
            </Button>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Já tem uma conta?{" "}
                <Button
                  color="primary"
                  onClick={() => navigate("/login")}
                  sx={{ textTransform: "none" }}
                >
                  Faça login
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Registrar;
