// src/NavBar.jsx

import { Link, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { LocationOn, Map, Visibility } from "@mui/icons-material";

export default function NavBar() {
  const location = useLocation();

  return (
    <>
      {/* FIXED NAVBAR */}
      <AppBar
        position="fixed" // ✅ prevents layout jump
        elevation={0}
        sx={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          {/* LOGO */}
          <Box
            display="flex"
            alignItems="center"
            flexGrow={1}
            fontWeight="bold"
            letterSpacing={0.5}
          >
            <LocationOn sx={{ mr: 1 }} />
            Health & GPS Tracker
          </Box>

          {/* NAV BUTTONS */}
          <Box display="flex" gap={1}>
            <Button
              component={Link}
              to="/"
              startIcon={<LocationOn />}
              sx={{
                color: "white",
                opacity: location.pathname === "/" ? 1 : 0.8,
              }}
            >
              Broadcast
            </Button>

            <Button
              component={Link}
              to="/map"
              startIcon={<Map />}
              sx={{
                color: "white",
                opacity: location.pathname === "/map" ? 1 : 0.8,
              }}
            >
              Map
            </Button>

            <Button
              component={Link}
              to="/listener"
              startIcon={<Visibility />}
              sx={{
                color: "white",
                opacity:
                  location.pathname === "/listener" ? 1 : 0.8,
              }}
            >
              Health 
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* SPACER so content is not hidden under navbar */}
      <Toolbar />
    </>
  );
}
