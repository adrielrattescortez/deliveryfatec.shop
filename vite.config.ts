
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Corrigido para usar apenas propriedades válidas no Vite e garantir SPA fallback automaticamente
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "::",
    port: 8080, // conforme instruções, garantir porta 8080
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
