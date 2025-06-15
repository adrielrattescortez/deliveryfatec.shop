import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Adicione o middleware para spa fallback para rotas desconhecidas (resolve erro ao atualizar em páginas dinâmicas)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // Necessário para evitar erro 404 ao atualizar rotas client-side
    historyApiFallback: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          ui: ["@/components/ui/button", "@/components/ui/card"],
        },
      },
    },
  },
});
