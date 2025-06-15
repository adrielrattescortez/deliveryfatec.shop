
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// TODO: Modifique para buscar sua chave secreta (API secret!) do OpenRouteService nas secrets do Supabase!
const OPENROUTESERVICE_KEY = Deno.env.get("OPENROUTESERVICE_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storeLat, storeLng, customerAddress } = await req.json();

    if (!storeLat || !storeLng || !customerAddress) {
      return new Response(JSON.stringify({ error: "Dados incompletos" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Geocodificar endereço do cliente
    const geoRes = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${OPENROUTESERVICE_KEY}&text=${encodeURIComponent(customerAddress)}&size=1`
    );
    const geoData = await geoRes.json();
    const coords = geoData.features?.[0]?.geometry?.coordinates;
    if (!coords) {
      return new Response(JSON.stringify({ error: "Endereço do cliente não encontrado" }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    const [lng, lat] = coords;

    // Calcular a distância
    const distancia = haversine(Number(storeLat), Number(storeLng), Number(lat), Number(lng));
    let deliveryFee = 0;

    if (distancia <= 2) deliveryFee = 5.0;
    else if (distancia <= 4) deliveryFee = 6.0;
    else if (distancia <= 6) deliveryFee = 8.0;
    else if (distancia <= 8) deliveryFee = 10.0;
    else if (distancia <= 10) deliveryFee = 12.0;
    else
      return new Response(
        JSON.stringify({
          error: "Fora da área",
          distance: distancia,
        }),
        { status: 403, headers: corsHeaders }
      );

    return new Response(
      JSON.stringify({
        distance: distancia,
        deliveryFee,
      }),
      { headers: corsHeaders }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "Falha no cálculo da taxa" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
