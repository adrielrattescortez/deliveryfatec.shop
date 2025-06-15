
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStore } from "@/contexts/StoreContext";
import { useGeocode } from "@/hooks/useGeocode";

// O API key do OpenRouteService deverá ser configurado como secret, pois não é seguro expor no frontend.
const OPENROUTESERVICE_KEY = ""; // Deixe vazio; avisaremos o admin para configurar nas secrets (proxy via edge function futuramente)

const StoreAddressForm: React.FC = () => {
  const { storeInfo, updateStoreInfo } = useStore();
  const [address, setAddress] = useState(storeInfo.address || "");
  const [saving, setSaving] = useState(false);

  const { geocodeAddress, loading, error } = useGeocode();

  async function handleSave() {
    if (!address) {
      toast.error("Digite o endereço.");
      return;
    }
    setSaving(true);

    try {
      // Solicitar a geocodificação do endereço
      if (!OPENROUTESERVICE_KEY) {
        toast.error("API Key do OpenRouteService não configurada. Acesse o painel de secrets do Supabase.");
        setSaving(false);
        return;
      }

      const coords = await geocodeAddress(address, OPENROUTESERVICE_KEY);
      if (!coords) {
        toast.error(error || "Não foi possível buscar coordenadas.");
        setSaving(false);
        return;
      }

      await updateStoreInfo({
        address,
        lat: coords.lat,
        lng: coords.lng,
      });
      toast.success("Endereço e coordenadas salvos!");
    } catch (err) {
      toast.error("Erro ao salvar endereço.");
    }
    setSaving(false);
  }

  return (
    <div>
      <h3 className="font-semibold mb-2 text-lg">Endereço do estabelecimento</h3>
      <div className="flex gap-2 items-end">
        <Input
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Ex: Rua Principal, 123, Centro, Cidade"
          className="flex-1"
        />
        <Button type="button" onClick={handleSave} disabled={saving || loading}>
          {saving || loading ? "Salvando..." : "Salvar Endereço"}
        </Button>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Este endereço será usado como base para o cálculo automático da taxa de entrega por distância.
      </div>
    </div>
  );
};

export default StoreAddressForm;
