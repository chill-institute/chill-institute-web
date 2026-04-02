import { defineConfig } from "vite-plus";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { execSync } from "node:child_process";

function resolveRelease() {
  const explicit = process.env.VITE_PUBLIC_RELEASE?.trim();
  if (explicit) {
    return explicit;
  }

  const ciSha = process.env.CF_PAGES_COMMIT_SHA?.trim() || process.env.GITHUB_SHA?.trim();
  if (ciSha) {
    return ciSha.slice(0, 7);
  }

  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

const release = resolveRelease();

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts", "dist/**"],
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
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    viteReact(),
  ],
  define: {
    "import.meta.env.VITE_PUBLIC_RELEASE": JSON.stringify(release),
  },
});
