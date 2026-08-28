import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    alias: {
      "wasp/server/operations": path.resolve(__dirname, "./src/__mocks__/wasp-server.ts"),
      "wasp/server": path.resolve(__dirname, "./src/__mocks__/wasp-server.ts"),
    },
  },
});
