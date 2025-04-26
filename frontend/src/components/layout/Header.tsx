import React, { useState, useEffect, FC } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  styled,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { jwtDecode } from "jwt-decode";

// Interface para as props
interface HeaderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
}

// Interface para o token JWT
interface JwtPayload {
  login?: string;
}

// Componente estilizado para gradiente
const GradientAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
  boxShadow: theme.shadows[4],
}));

const Header: FC<HeaderProps> = ({ open, setOpen, isMobile }) => {
  const [userName, setUserName] = useState<string>("");
  const theme = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        setUserName(decodedToken.login || "Usuário");
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  return (
    <GradientAppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ minHeight: 64 }}>
        <IconButton
          color="inherit"
          aria-label="abrir/fechar menu"
          onClick={() => setOpen(!open)}
          edge="start"
          sx={{
            mr: 2,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <MenuIcon fontSize="medium" />
        </IconButton>

        <Typography
          variant="h5"
          component="h1"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: 1.2,
            [theme.breakpoints.down("sm")]: {
              fontSize: "1.25rem",
            },
          }}
        >
          🏗️ Sistema de Estoque
        </Typography>

        {userName && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <Avatar
              sx={{
                bgcolor: theme.palette.secondary.main,
                width: 40,
                height: 40,
              }}
            >
              {userName[0].toUpperCase()}
            </Avatar>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                display: { xs: "none", sm: "block" },
              }}
            >
              Olá, {userName}
            </Typography>
          </Box>
        )}
      </Toolbar>
    </GradientAppBar>
  );
};

export default Header;
