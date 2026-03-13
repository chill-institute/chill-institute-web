import { defineConfig } from "vite-plus";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

const usePolling = process.env.CHOKIDAR_USEPOLLING === "true";
const pollingInterval = Number(process.env.CHOKIDAR_INTERVAL ?? "150");

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts"],
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    viteReact(),
  ],
  server: {
    watch: usePolling
      ? {
          usePolling: true,
          interval: Number.isFinite(pollingInterval) ? pollingInterval : 150,
        }
      : undefined,
  },
});
