
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandItem, CommandGroup } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  categories?: { name: string } | null;
};

interface ProductSearchDialogProps {
  open: boolean;
  setOpen: (val: boolean) => void;
}

export default function ProductSearchDialog({ open, setOpen }: ProductSearchDialogProps) {
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Função para buscar produtos do supabase
  const searchProducts = async (term: string) => {
    setLoading(true);
    setResults([]);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, image_url, categories(name)")
      .ilike("name", `%${term}%`)
      .limit(10);

    if (!error && data) {
      setResults(data as Product[]);
    }
    setLoading(false);
  };

  // input de busca com debounce
  const handleInputChange = (val: string) => {
    setTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim() === "") {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      searchProducts(val);
    }, 400);
  };

  const handleSelect = (productId: string) => {
    setOpen(false);
    navigate(`/product/${productId}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        autoFocus
        placeholder="Digite para buscar produtos..."
        value={term}
        onValueChange={handleInputChange}
      />
      <CommandList>
        {loading && (
          <div className="py-4 px-4 text-sm text-muted-foreground">Buscando produtos...</div>
        )}
        <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Produtos">
            {results.map(product => (
              <CommandItem
                key={product.id}
                value={product.name}
                className="gap-2 cursor-pointer"
                onSelect={() => handleSelect(product.id)}
              >
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-8 h-8 rounded object-cover" />
                ) : (
                  <div className="w-8 h-8 bg-gray-100 flex items-center justify-center rounded">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-gray-500">
                    {product.categories?.name || "Sem categoria"} &middot; R$ {Number(product.price).toFixed(2)}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
