import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Enforce "import type" syntax
      "@typescript-eslint/consistent-type-imports": "error",
      // Sort imports
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            [
              "^\\u0000", // Side effect imports
              "^node:", // Node.js builtins
              "^react$", // React import
              "^next$", // Next.js import
              "^react-native$", // React Native import
              "^@?\\w", // Packages starting with `@` or plain packages (3rd party)
              "^@", // Scoped packages
              "^[a-z]", // Non-scoped packages
              "^", // Absolute imports
              "^\\.", // Relative imports (both starting with `./` and `../`)
              "^@assets", // Local packages
              "^@app",
              "^@templates",
              "^@utils",
              "^@store",
              "^@components",
              "^@contexts",
              "^@screens",
              "^@navigation",
              "^@styles",
              "^\\.\\.(?!/?$)", // Imports starting with `../`
              "^\\.\\./?$", // Relative imports starting with `../`
              "^\\./(?=.*/)(?!/?$)", // Imports starting with `./` with folders
              "^\\.(?!/?$)", // Imports starting with `.`
              "^\\./?$", // Imports starting with `./`
              "^./styles.ts$", // Styled components imports
              "^./styles.scss$", // Style sass imports
              "^./styles.module.scss$", // Style sass imports
              "^./styles.css$", // Style css imports
              "^./styles.module.css$", // Style css imports
              "^@?\\w.*\\u0000$", // Type imports from other contexts
              "^[^.].*\\u0000$", // Type imports from actual contexts
              "^\\..*\\u0000$", // Type imports from relative paths
            ],
          ],
        },
      ],
      // Naming conventions for interfaces and types
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            regex: "^I[A-Z]",
            match: true,
          },
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
          custom: {
            regex: "^T[A-Z]",
            match: true,
          },
        },
      ],
    },
  },
]);

export default eslintConfig;
