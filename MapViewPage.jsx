// @ts-nocheck
// src/MapViewPage.jsx

// React imports
import React, { useEffect, useMemo, useState } from "react";

// Firebase imports
import { collection, onSnapshot } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { auth, database } from "./firebase";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Material UI imports
import {
  Box,
  Typography,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Divider,
} from "@mui/material";

// Constants
import { DEFAULT_COORDINATES } from "./constants";

/* ----------------------------------------
   FIX LEAFLET RESIZE ISSUE
---------------------------------------- */
function ResizeFix() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);

  return null;
}

/* ----------------------------------------
   CUSTOM MAP ICONS
---------------------------------------- */
const markerIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

const realIcon = markerIcon("blue");
const simulatedIcon = markerIcon("green");

/* ----------------------------------------
   MAIN COMPONENT
---------------------------------------- */
export default function MapViewPage() {
  // Store all climbers
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------
     AUTO MAP CENTER CALCULATION
  ---------------------------------------- */
  const center = useMemo(() => {
    const list = Object.values(users);

    if (!list.length) {
      return [DEFAULT_COORDINATES.latitude, DEFAULT_COORDINATES.longitude];
    }

    const latitudes = list.map((u) => u.latitude);
    const longitudes = list.map((u) => u.longitude);

    return [
      (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    ];
  }, [users]);

  /* ----------------------------------------
     FIRESTORE REALTIME LISTENER
  ---------------------------------------- */
  useEffect(() => {
    let unsubscribe;

    const init = async () => {
      await signInAnonymously(auth);

      unsubscribe = onSnapshot(collection(database, "climbers"), (snapshot) => {
        const data = {};
        snapshot.forEach((doc) => {
          const docData = doc.data();
          data[doc.id] = {
            name: docData.name || "Anonymous",
            latitude: docData.location?.lat ?? DEFAULT_COORDINATES.latitude,
            longitude: docData.location?.lng ?? DEFAULT_COORDINATES.longitude,
            heartRate: docData.health?.heartRate ?? "--",
            spo2: docData.health?.spo2 ?? "--",
            bodyTemp: docData.health?.bodyTemp ?? "--",
            battery: docData.battery ?? "--",
            isSimulated: docData.isSimulated ?? false,
          };
        });
        setUsers(data);
        setLoading(false);
      });
    };

    init();

    return () => unsubscribe && unsubscribe();
  }, []);

  /* ----------------------------------------
     UI RENDER
  ---------------------------------------- */
  return (
    <Box sx={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* MAP */}
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <ResizeFix />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />

        {/* MARKERS */}
        {Object.entries(users).map(([id, u]) => (
          <Marker
            key={id}
            position={[u.latitude, u.longitude]}
            icon={u.isSimulated ? simulatedIcon : realIcon}
          >
            <Popup>
              <Typography variant="subtitle1" fontWeight="bold">
                {u.name}
              </Typography>
              <Typography variant="body2">
                📍 {u.latitude.toFixed(5)}, {u.longitude.toFixed(5)}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">❤️ HR: {u.heartRate} bpm</Typography>
              <Typography variant="body2">🫁 SpO₂: {u.spo2} %</Typography>
              <Typography variant="body2">🌡 Temp: {u.bodyTemp} °C</Typography>
              <Typography variant="body2">🔋 Battery: {u.battery} %</Typography>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* SIDE PANEL */}
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          top: "80px",
          left: "16px",
          width: 320,
          maxHeight: "70vh",
          overflow: "auto",
          padding: 2,
          zIndex: 2000,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Typography variant="h6" mb={1}>
          Active Climbers
        </Typography>

        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <List dense>
            {Object.entries(users).map(([id, u]) => (
              <ListItem key={id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>{u.name?.[0]?.toUpperCase() || "?"}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={u.name}
                  secondary={
                    <>
                      📍 {u.latitude.toFixed(4)}, {u.longitude.toFixed(4)}
                      <br />
                      ❤️ HR: {u.heartRate} bpm
                      <br />
                      🫁 SpO₂: {u.spo2} %
                      <br />
                      🌡 Temp: {u.bodyTemp} °C
                      <br />
                      🔋 Battery: {u.battery} %
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
