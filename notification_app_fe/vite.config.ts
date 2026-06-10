import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";

import { handleApiRequest } from "./server/api-proxy";

function secureApiPlugin(): Plugin {
  const middleware = () => async (
    request: Parameters<typeof handleApiRequest>[0],
    response: Parameters<typeof handleApiRequest>[1],
    next: () => void,
  ) => {
    if (!(await handleApiRequest(request, response))) next();
  };

  return {
    name: "secure-api-proxy",
    configureServer(server) {
      server.middlewares.use(middleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware());
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(
    process.env,
    loadEnv(mode, fileURLToPath(new URL("..", import.meta.url)), ""),
  );

  return {
    plugins: [react(), secureApiPlugin()],
    server: { port: 3000, strictPort: true },
    preview: { port: 3000, strictPort: true },
  };
});
