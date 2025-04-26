import React, { useState, useEffect, FC } from "react";
import { SxProps } from "@mui/system";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  styled,
  useTheme,
  Typography,
  Box,
  SvgIconProps,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { toast } from "react-toastify";

// Interfaces TypeScript
interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  isTablet: boolean;
  sx?: SxProps;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

// Estilos customizados
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: theme.spacing(30),
  flexShrink: 0,
  whiteSpace: "nowrap",
  "& .MuiDrawer-paper": {
    width: theme.spacing(30),
    backgroundColor: theme.palette.background.default,
    borderRight: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const Sidebar: FC<SidebarProps> = ({ open, setOpen, isMobile, isTablet }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const handleLogoutClick = () => {
    setOpenDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setOpenDialog(false);
  };

  const handleCancelLogout = () => {
    setOpenDialog(false);
  };

  // Menu items com tipagem
  const menuItems: MenuItem[] = [
    { text: "Home", icon: <DashboardIcon />, path: "/" },
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      text: "Fornecedores",
      icon: <InventoryIcon color="secondary" />,
      path: "/fornecedores",
    },
    {
      text: "Clientes",
      icon: <PeopleIcon color="secondary" />,
      path: "/clientes",
    },
    {
      text: "Estoque",
      icon: <InventoryIcon color="secondary" />,
      path: "/produtos",
    },
    {
      text: "Vendas",
      icon: <ShoppingCartIcon color="secondary" />,
      path: "/vendas",
    },
    {
      text: "Usuários",
      icon: <ReceiptIcon color="secondary" />,
      path: "/usuarios",
    },
  ];

  // Verificação de autenticação com tipagem
  const checkAuthentication = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setAuthenticated(true);
      } catch (error) {
        console.error("Erro na autenticação:", error);
        localStorage.removeItem("token");
        setAuthenticated(false);
      }
    } else {
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, [location.pathname]);

  const logout = (): void => {
    localStorage.removeItem("token");
    setAuthenticated(false);
    navigate("/login");
    toast.success("Usuário saiu do sistema com sucesso!", {
      icon: <span>👋</span>,
    });
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  // Estilo ativo para menu
  const isActive = (path: string) => location.pathname === path;

  return (
    <StyledDrawer
      variant={isMobile || isTablet ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={() => setOpen(false)}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          minHeight: `${theme.mixins.toolbar.minHeight}px !important`,
        }}
      >
        <IconButton onClick={() => setOpen(false)}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
      </Toolbar>

      <List sx={{ px: 1 }}>
        {authenticated ? (
          <>
            {menuItems.map((item) => (
              <ListItem
                role="button"
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  isMobile && setOpen(false);
                }}
                sx={{
                  cursor: "pointer",
                  borderRadius: 2,
                  mb: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.action.selected,
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {React.cloneElement(
                    item.icon as React.ReactElement<SvgIconProps>,
                    {
                      color: isActive(item.path)
                        ? "primary"
                        : ("action" as const),
                    }
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
            ))}

            <ListItem
              onClick={handleLogoutClick}
              sx={{
                mt: "auto",
                borderRadius: 2,
                cursor: "pointer",
                "&:hover": {
                  // backgroundColor: theme.palette.error.light,
                  backgroundColor: "#E68C55",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Sair"
                primaryTypographyProps={{
                  variant: "body2",
                  color: "error",
                }}
              />
            </ListItem>
          </>
        ) : (
          <ListItem
            onClick={() => navigate("/login")}
            sx={{
              borderRadius: 2,
              cursor: "pointer",
              marginTop: "10px",
              "&:hover": {
                // backgroundColor: theme.palette.primary.light,
                backgroundColor: "#95B7E0",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LoginIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Entrar"
              primaryTypographyProps={{
                variant: "body2",
                color: "primary",
              }}
            />
          </ListItem>
        )}
      </List>

      {/* Diálogo de Confirmação Aprimorado */}
      <Dialog
        open={openDialog}
        onClose={handleCancelLogout}
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.background.paper }}>
          <Box display="flex" alignItems="center" gap={1}>
            <LogoutIcon color="error" />
            Confirmação de Saída
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography>Tem certeza que deseja encerrar sua sessão?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCancelLogout}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmLogout}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
            startIcon={<LogoutIcon />}
          >
            Confirmar Saída
          </Button>
        </DialogActions>
      </Dialog>
    </StyledDrawer>
  );
};

export default Sidebar;
