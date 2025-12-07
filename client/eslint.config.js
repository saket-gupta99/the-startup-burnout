import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    // ✅ NEW RULES SECTION
    rules: {
      // 1. Unused Variables: Change to Warning (Recommended for dev)
      //    We use the TS version as it's smarter than the base JS version.
      "@typescript-eslint/no-unused-vars": "warn",

      // 2. Fast Refresh Warning Fix: Allow non-component exports in TSX files
      //    This is needed to suppress the warning when exporting utilities/constants.
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true }, // The key change
      ],
    },
    // ----------------------
  },
]);
