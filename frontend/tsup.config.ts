import { defineConfig } from "tsup";
import path from "node:path";

// Library build for the shadcn/ui component set, consumed by design tooling
// (e.g. /design-sync). Entirely separate from the Next.js build:
//   - output goes to dist/ (next build -> .next/)
//   - run only via the explicit "build:lib" script
//   - no CSS/Tailwind processing here; components ship Tailwind utility class
//     strings that the host app compiles. Tailwind is never invoked by tsup.
export default defineConfig({
  entry: { index: "src/components/ui/index.ts" },
  outDir: "dist",
  format: ["esm"],
  // Use a dedicated tsconfig for .d.ts emit (disables incremental + baseUrl
  // deprecation that break tsc's DTS step). The app tsconfig stays untouched.
  tsconfig: "tsconfig.build.json",
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Peers — provided by the consumer, never bundled into dist/.
  external: [
    "react",
    "react-dom",
    /^@radix-ui\//,
    "radix-ui",
    "lucide-react",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
  ],
  // Resolve the "@/*" tsconfig path alias (used by "@/lib/utils" and the
  // internal "@/components/ui/*" imports). esbuild doesn't read tsconfig paths.
  esbuildOptions(options) {
    options.alias = {
      "@": path.resolve(__dirname, "src"),
    };
  },
});
