import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "wasp/client/operations": path.resolve(__dirname, "./src/wasp-mock/client/operations.ts"),
      "wasp/client/router": path.resolve(__dirname, "./src/wasp-mock/client/router.ts"),
      "wasp/client/auth": path.resolve(__dirname, "./src/wasp-mock/client/auth.ts"),
      "wasp/server": path.resolve(__dirname, "./src/wasp-mock/server/index.ts"),
      "wasp/entities": path.resolve(__dirname, "./src/wasp-mock/store.ts"),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
