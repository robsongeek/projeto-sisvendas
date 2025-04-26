import React, { useState, useEffect, FC, ReactNode } from "react";
import {
  Box,
  CssBaseline,
  useMediaQuery,
  useTheme,
  styled,
} from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: theme.mixins.toolbar.minHeight,

  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: theme.palette.background.default,
  backgroundImage:
    "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
}));
const Layout: FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), {
    noSsr: true,
  });
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));
  // const isTablet = useMediaQuery(theme.breakpoints.between(600, 1200));
  const [open, setOpen] = useState(!isMobile);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflowY: "hidden" }}>
      <CssBaseline enableColorScheme />
      <Header open={open} setOpen={setOpen} isMobile={isMobile} />
      <Sidebar
        open={open}
        setOpen={setOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <MainContent
        sx={{
          marginLeft: {
            lg: open ? 0 : -30,
          },
          flex: 1,
          overflowY: "auto",
          padding: {
            xs: theme.spacing(1),
            sm: theme.spacing(2),
            md: theme.spacing(3),
          },
          boxSizing: "border-box",

          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box
          sx={{
            borderRadius: 4,
            minHeight: "calc(100vh - 40px)",
            padding: theme.spacing(3),
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            transition: theme.transitions.create("all", {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
            "&:hover": {
              boxShadow: theme.shadows[4],
            },
          }}
        >
          {children}
        </Box>
      </MainContent>
    </Box>
  );
};

export default Layout;
