import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@/components/ui/scrollbar.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { app } from "./firebase/config";
import { LoadScript } from "@react-google-maps/api";

console.log("Firebase iniciado:", app.name);

const apiKey = import.meta.env.VITE_MAPS_API_KEY as string;

createRoot(document.getElementById("root")!).render(
  <LoadScript googleMapsApiKey={apiKey}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </LoadScript>
);
