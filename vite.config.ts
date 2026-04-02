import { defineConfig } from "vite-plus";
export default defineConfig({
  staged: {
    "*": "vp run -r check --fix",
  },
  fmt: {
    ignorePatterns: ["apps/*/src/routeTree.gen.ts"],
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
