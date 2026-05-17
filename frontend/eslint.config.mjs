import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["**/app/(admin)/**"],
            message: "Admin modules must not be imported from student routes.",
          },
          {
            group: ["**/app/(student)/**"],
            message: "Student modules must not be imported from admin routes.",
          },
        ],
      }],
    },
  },
];

export default eslintConfig;
