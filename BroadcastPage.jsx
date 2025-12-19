// React hooks
import { useState, useRef } from "react";

// Firebase
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { database, auth } from "./firebase";

// Material UI
import {
  Button,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import {
  LocationOn,
  Send,
  Stop,
  DirectionsWalk,
  Favorite,
  Thermostat,
  Bloodtype,
} from "@mui/icons-material";

// Constants
import {
  DEFAULT_COORDINATES,
  COORDINATE_VARIATION,
  SIMULATION_STEP,
} from "./constants";

// -------------------------------------------------

export default function BroadcastPage() {
  // ---------------- STATE ----------------
  const [name, setName] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulateMovement, setSimulateMovement] = useState(false);

  // Health state (SIMULATED for now)
  const [heartRate, setHeartRate] = useState(90);
  const [spo2, setSpo2] = useState(97);
  const [bodyTemp, setBodyTemp] = useState(36.7);
  const [battery, setBattery] = useState(85);

  // Refs
  const geoWatchIdRef = useRef(null);
  const simulationIntervalRef = useRef(null);
  const healthIntervalRef = useRef(null);

  // -------------------------------------------------
  // FIRESTORE UPDATE
  const updateClimberData = async (uid, coords) => {
    if (!uid || !coords) return;

    await setDoc(doc(database, "climbers", uid), {
      name,
      lastSeen: new Date(),
      battery,

      location: {
        lat: coords.latitude,
        lng: coords.longitude,
      },

      health: {
        heartRate,
        spo2,
        bodyTemp,
      },

      isSimulated: simulateMovement,
    });
  };

  // -------------------------------------------------
  // REAL GPS
  const startRealLocationUpdates = (uid) => {
    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateClimberData(uid, position.coords);
      },
      (error) => console.error("GPS error:", error),
      { enableHighAccuracy: true }
    );
  };

  // -------------------------------------------------
  // SIMULATED MOVEMENT
  const startSimulatedMovement = (uid) => {
    let currentPos = {
      latitude:
        DEFAULT_COORDINATES.latitude +
        (Math.random() * COORDINATE_VARIATION -
          COORDINATE_VARIATION / 2),
      longitude:
        DEFAULT_COORDINATES.longitude +
        (Math.random() * COORDINATE_VARIATION -
          COORDINATE_VARIATION / 2),
    };

    updateClimberData(uid, currentPos);

    simulationIntervalRef.current = setInterval(() => {
      currentPos = {
        latitude:
          currentPos.latitude +
          (Math.random() * SIMULATION_STEP -
            SIMULATION_STEP / 2),
        longitude:
          currentPos.longitude +
          (Math.random() * SIMULATION_STEP -
            SIMULATION_STEP / 2),
      };

      updateClimberData(uid, currentPos);
    }, 3000);
  };

  // -------------------------------------------------
  // SIMULATED HEALTH DATA
  const startHealthSimulation = () => {
    healthIntervalRef.current = setInterval(() => {
      setHeartRate((v) => Math.max(60, Math.min(160, v + (Math.random() * 6 - 3))));
      setSpo2((v) => Math.max(85, Math.min(100, v + (Math.random() * 2 - 1))));
      setBodyTemp((v) =>
        Math.max(35.5, Math.min(39, v + (Math.random() * 0.3 - 0.15)))
      );
      setBattery((v) => Math.max(0, v - 0.1));
    }, 4000);
  };

  // -------------------------------------------------
  // START BROADCAST
  const startBroadcasting = async () => {
    if (!name) return;

    setLoading(true);

    try {
      const { user } = await signInAnonymously(auth);
      setUserId(user.uid);

      startHealthSimulation();

      simulateMovement
        ? startSimulatedMovement(user.uid)
        : startRealLocationUpdates(user.uid);

      setIsBroadcasting(true);
    } catch (err) {
      console.error("Broadcast error:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // STOP BROADCAST
  const stopBroadcasting = async () => {
    if (userId) {
      await deleteDoc(doc(database, "climbers", userId));
    }

    if (geoWatchIdRef.current)
      navigator.geolocation.clearWatch(geoWatchIdRef.current);

    if (simulationIntervalRef.current)
      clearInterval(simulationIntervalRef.current);

    if (healthIntervalRef.current)
      clearInterval(healthIntervalRef.current);

    setIsBroadcasting(false);
    setUserId(null);
  };

  // -------------------------------------------------
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card sx={{ maxWidth: 520, width: "100%" }}>
        <CardContent>
          <Box textAlign="center" mb={2}>
            <Avatar sx={{ bgcolor: "#764ba2", mx: "auto", mb: 1 }}>
              <LocationOn />
            </Avatar>
            <Typography variant="h5">
              {isBroadcasting ? "Climber Broadcasting" : "Start Climber Device"}
            </Typography>
          </Box>

          <TextField
            label="Climber Name"
            fullWidth
            value={name}
            disabled={isBroadcasting}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={simulateMovement}
                onChange={() => setSimulateMovement(!simulateMovement)}
                disabled={isBroadcasting}
              />
            }
            label="Simulate Movement"
          />

          <Divider sx={{ my: 2 }} />

          {/* HEALTH DISPLAY */}
          <Typography variant="body2">
            ❤️ Heart Rate: {heartRate.toFixed(0)} bpm
          </Typography>
          <Typography variant="body2">
            🩸 SpO₂: {spo2.toFixed(0)} %
          </Typography>
          <Typography variant="body2">
            🌡️ Body Temp: {bodyTemp.toFixed(1)} °C
          </Typography>
          <Typography variant="body2">
            🔋 Battery: {battery.toFixed(0)} %
          </Typography>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={isBroadcasting ? stopBroadcasting : startBroadcasting}
            startIcon={loading ? <CircularProgress size={20} /> : isBroadcasting ? <Stop /> : <Send />}
            disabled={loading || (!isBroadcasting && !name)}
          >
            {isBroadcasting ? "Stop Broadcasting" : "Start Broadcasting"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
