
import { useState } from "react";
import axios from "axios";

export type GeocodeResult = {
  lat: number;
  lng: number;
};

export function useGeocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function geocodeAddress(address: string, apiKey: string): Promise<GeocodeResult | null> {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("https://api.openrouteservice.org/geocode/search", {
        params: {
          api_key: apiKey,
          text: address,
          size: 1,
        },
      });

      const coords = response.data.features?.[0]?.geometry?.coordinates;
      if (coords && coords.length === 2) {
        return { lng: coords[0], lat: coords[1] };
      } else {
        setError("Endereço não encontrado");
        return null;
      }
    } catch (err: any) {
      setError("Erro ao buscar coordenadas");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { geocodeAddress, loading, error };
}
