import React, { useEffect, useState } from "react";
import { GoogleMap, DirectionsRenderer } from "@react-google-maps/api";

interface MapComponentProps {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  onDistanceCalculated?: (distanceKm: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  start,
  end,
  onDistanceCalculated,
}) => {
  const mapStyles = {
    height: "400px",
    width: "100%",
  };

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>("");
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapLoaded || !start || !end || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const leg = result.routes[0].legs[0];
          if (leg.distance) {
            const km = leg.distance.value / 1000;
            setDistance(km.toFixed(2) + " km");
            onDistanceCalculated?.(km);
          }
        } else {
          console.error("Erro ao calcular rota:", status);
          setDirections(null);
          setDistance("Não foi possível calcular a distância");
          onDistanceCalculated?.(0);
        }
      }
    );
  }, [mapLoaded, start, end, onDistanceCalculated]);

  // O script do Google Maps já é carregado globalmente pelo LoadScript em main.tsx
  // Usamos mapLoaded apenas para garantir que o Google Maps está disponível
  useEffect(() => {
    if (window.google) setMapLoaded(true);
  }, []);

  return (
    <>
      <div style={{ marginBottom: 8, color: "#fff" }}>
        Distância: {distance}
      </div>
      <GoogleMap mapContainerStyle={mapStyles} zoom={6} center={start}>
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </>
  );
};

export default MapComponent;
