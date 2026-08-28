import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    alias: [
      { find: /^wasp\/server(\/.*)?$/, replacement: path.resolve(__dirname, 'test-stubs/wasp-server.mjs') }
    ],
  },
});
