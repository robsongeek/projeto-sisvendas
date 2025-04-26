import React from "react";
import { Box, Grid, Paper, Typography, SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";

type BoxCountProps = {
  title: string;
  count: number;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string };
};

const BoxCount: React.FC<BoxCountProps> = ({ title, count, icon: Icon }) => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ marginTop: 4 }}
    >
      <Grid item xs={12} sm={6} md={6} lg={5} xl={3}>
        <Paper
          sx={{
            p: 3,
            bgcolor: "#d7dacf",
            textAlign: "center",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "#c0c3bb",
              transform: "translateY(-4px)",
              boxShadow: 3,
            },
            borderRadius: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box>
            <Icon
              sx={{
                fontSize: 40,
                color: "primary.main",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{
              mb: 1,
              color: "text.secondary",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {count}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default BoxCount;
