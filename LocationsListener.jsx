// src/LocationsListener.jsx

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { database, auth } from "./firebase";

import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { LocationOn, DirectionsWalk } from "@mui/icons-material";

export default function LocationsListener() {
  // -------------------- STATE --------------------
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -------------------- FIRESTORE LISTENER --------------------
  useEffect(() => {
    let unsubscribe;

    const init = async () => {
      try {
        // Ensure auth (important for Firestore rules)
        await signInAnonymously(auth);

        const locationsRef = collection(database, "locations");

        unsubscribe = onSnapshot(
          locationsRef,
          (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setLocations(data);
            setLoading(false);
          },
          (err) => {
            console.error("Listener error:", err);
            setError("Failed to load locations");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Auth error:", err);
        setError("Authentication failed");
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // -------------------- UI --------------------
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 600,
          p: 3,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Realtime Location Listener
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}

        {!loading && locations.length === 0 && (
          <Typography align="center" color="text.secondary">
            No active locations
          </Typography>
        )}

        {!loading && locations.length > 0 && (
          <List>
            {locations.map((loc) => (
              <ListItem key={loc.id} divider>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: loc.isSimulated
                        ? "#4caf50"
                        : "#2196f3",
                    }}
                  >
                    {loc.isSimulated ? (
                      <DirectionsWalk />
                    ) : (
                      <LocationOn />
                    )}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={loc.name || "Anonymous"}
                  secondary={
                    <>
                      {loc.latitude?.toFixed(6)},{" "}
                      {loc.longitude?.toFixed(6)}
                      <br />
                      {loc.isSimulated
                        ? "Simulated location"
                        : "Real location"}
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
