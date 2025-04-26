import React, { FC } from "react";
import {
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
} from "@mui/icons-material";
const Home: FC = () => {
  interface ActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    primaryAction: {
      text: string;
      onClick?: () => void;
      component?: React.ElementType;
      href?: string;
      target?: string;
      rel?: string;
    };
  }

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
          <Typography variant="h4" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h5" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="medium"
          startIcon={<AddIcon />}
          onClick={primaryAction.onClick}
          component={primaryAction.component || "button"}
          href={primaryAction.href}
          target={primaryAction.target}
          rel={primaryAction.rel}
        >
          {primaryAction.text}
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Grid container sx={{ position: "relative", height: "100vh" }}>
      <img
        src="/img/logo.jpg"
        alt="Background"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      <Grid item sx={{ position: "relative", zIndex: 1 }}>
        <ActionCard
          title="Sistema de Vendas"
          description="Desenvolvido por Robson Guedes Ferreira."
          icon={<ShoppingCartIcon sx={{ fontSize: 40 }} />}
          primaryAction={{
            component: "a",
            href: "https://www.google.com.br/",
            target: "_blank",
            rel: "noopener noreferrer",
            text: "Ver GitHub",
          }}
        />
      </Grid>
    </Grid>
  );
};

export default Home;
