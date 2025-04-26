import React from 'react';
import { Grid, Typography, Button, SxProps, Theme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface HeaderSectionProps {
  title: string;
  buttonLabel?: string;
  onButtonClick: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  buttonLabel = "Novo Item",
  onButtonClick
}) => {
  const gridStyles: SxProps<Theme> = {
    bgcolor: "#d7dacf",
    // bgcolor: "background.paper",
    marginLeft: 3,
    marginTop: 3,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    animation: "fadeIn 0.5s ease-in",
    p: { xs: 1.5, sm: 3 },
    borderRadius: 2,
    boxShadow: 1,
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: 3,
      bgcolor: "#c0c3bb",
    },
    "@media (max-width: 600px)": {
      flexDirection: "row",
      gap: 1,
      px: 1,
    },
  };

  const titleStyles: SxProps<Theme> = {
    background: "linear-gradient(45deg, #1976d2 30%, #4dabf5 90%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "bold",
    letterSpacing: "-0.5px",
    animation: "slideInLeft 0.5s ease-out",
    fontSize: { xs: "1.5rem", sm: "2rem" },
    "@keyframes slideInLeft": {
      "0%": { transform: "translateX(-20px)", opacity: 0 },
      "100%": { transform: "translateX(0)", opacity: 1 },
    },
  };

  const buttonStyles: SxProps<Theme> = {
    borderRadius: "8px",
    py: { xs: 0.5, sm: 1.5 },
    px: { xs: 2, sm: 4 },
    minWidth: "auto",
    fontSize: { xs: "0.875rem", sm: "1rem" },
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: "translateY(0)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: 3,
      bgcolor: "primary.dark",
    },
    animation: "slideInRight 0.5s ease-out",
    "@keyframes slideInRight": {
      "0%": { transform: "translateX(20px)", opacity: 0 },
      "100%": { transform: "translateX(0)", opacity: 1 },
    },
  };

  return (
    <Grid item xs={12} sx={gridStyles}>
      {/* Título */}
      <Typography
        variant="h4"
        gutterBottom
        sx={titleStyles}
      >
        {title}
      </Typography>

      {/* Botão */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={onButtonClick}
        sx={buttonStyles}
      >
        {buttonLabel}
      </Button>

      {/* Estilos globais */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Grid>
  );
};

export default HeaderSection;