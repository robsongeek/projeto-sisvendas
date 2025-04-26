import React, { useState, useEffect, FC } from "react";
import { api } from "../../../utils/api";
import { IVenda } from "../../../interfaces/IVenda";
import { IProduto } from "../../../interfaces/IProduto";
import { ICliente } from "../../../interfaces/ICliente";
import { IUsuario } from "../../../interfaces/IUsuario";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Add as AddIcon,
  List as ListIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
const Dashboard: FC = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [fornecedores, setFornecedores] = useState<IProduto[]>([]);
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [vendas, setVendas] = useState<IVenda[]>([]);

  interface ErrorResponse {
    message: string;
  }

  const handleApiError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as ErrorResponse;
      toast.error(serverError?.message || "Erro desconhecido na API");
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Ocorreu um erro inesperado");
    }
  };

  const currencyFormatter = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);

  const calculateSubTotal = (arrayProdutos: IVenda[]): number => {
    const total = arrayProdutos.reduce((soma: number, produto: IVenda) => {
      const totalVerificado = Number(produto.valor_pago) || 0;

      if (totalVerificado > 0) {
        return soma + totalVerificado;
      }

      return soma;
    }, 0);

    return total;
  };

  const fetchData = async () => {
    try {
      const responseProdutos = await api.get<IProduto[]>("/produtos");
      const responseUsuarios = await api.get<IUsuario[]>("/usuarios");
      const responseClientes = await api.get<ICliente[]>("/clientes");
      const responseVendas = await api.get<IVenda[]>("/vendas");
      const responseFornecedores = await api.get<IProduto[]>("/fornecedores");
      setProdutos(responseProdutos.data);
      setUsuarios(responseUsuarios.data);
      setClientes(responseClientes.data);
      setVendas(responseVendas.data);
      setFornecedores(responseFornecedores.data);
    } catch (error) {
      handleApiError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  interface DashboardCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }

  interface ActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    primaryAction: {
      onClick: () => void;
      text: string;
    };
  }

  const DashboardCard = ({ title, value, icon, color }: DashboardCardProps) => (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: 140,
        bgcolor: color,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" component="div" color="white">
          {title}
        </Typography>
        {icon}
      </Box>
      <Typography variant="h4" component="div" color="white">
        {value}
      </Typography>
    </Paper>
  );

  const ActionCard = ({
    title,
    description,
    icon,
    primaryAction,
  }: ActionCardProps) => (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={primaryAction.onClick}
        >
          {primaryAction.text}
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Produtos"
            value={produtos.length}
            icon={<InventoryIcon sx={{ color: "white", fontSize: 40 }} />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Clientes"
            value={clientes.length}
            icon={<PeopleIcon sx={{ color: "white", fontSize: 40 }} />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Fornecedores"
            value={fornecedores.length}
            icon={<CategoryIcon sx={{ color: "white", fontSize: 40 }} />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Usuarios"
            value={usuarios.length}
            icon={<PeopleIcon sx={{ color: "white", fontSize: 40 }} />}
            color="#9f9400"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Vendas"
            value={
              currencyFormatter(calculateSubTotal(vendas)) as unknown as number
            }
            icon={<ShoppingCartIcon sx={{ color: "white", fontSize: 40 }} />}
            color="#f44336"
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <ActionCard
            title="Vendas"
            description="Gerencie suas vendas aqui."
            icon={<ShoppingCartIcon sx={{ fontSize: 40 }} />}
            primaryAction={{
              onClick: () => navigate("/vendas"),
              text: "Ver Vendas",
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <ActionCard
            title="Produtos"
            description="Gerencie seus produtos aqui."
            icon={<InventoryIcon sx={{ fontSize: 40 }} />}
            primaryAction={{
              onClick: () => navigate("/produtos"),
              text: "Ver Produtos",
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <ActionCard
            title="Clientes"
            description="Gerencie seus clientes aqui."
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            primaryAction={{
              onClick: () => navigate("/clientes"),
              text: "Ver Clientes",
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <ActionCard
            title="Fornecedores"
            description="Gerencie seus fornecedores aqui."
            icon={<BusinessIcon sx={{ fontSize: 40 }} />}
            primaryAction={{
              onClick: () => navigate("/fornecedores"),
              text: "Ver Fornecedores",
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
