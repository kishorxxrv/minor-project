// src/App.jsx

// React Router
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import BroadcastPage from "./BroadcastPage";
import MapViewPage from "./MapViewPage";
import LocationsListener from "./LocationsListener";

// Components
import NavBar from "./NavBar";

// Material-UI
import { Box } from "@mui/material";

// ------------------------
// Main App Component
// ------------------------
export default function App() {
  return (
    <Router>
      {/* Full-page wrapper */}
      <Box
        sx={{
          height: "100vh",       // Full viewport height
          width: "100%",         // Full width
          display: "flex",       // Flex layout
          flexDirection: "column", // Vertical stacking
        }}
      >
        {/* Navigation Bar */}
        <NavBar />

        {/* Main Page Content */}
        <Box
          sx={{
            flex: 1,           // Take remaining space
            width: "100%",     // Full width
            minHeight: 0,      // Important for children flex containers (like Leaflet)
            overflow: "hidden" // Prevent scrolling issues for Leaflet maps
          }}
        >
          <Routes>
            <Route path="/" element={<BroadcastPage />} />
            <Route path="/map" element={<MapViewPage />} />
            <Route path="/listener" element={<LocationsListener />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}
