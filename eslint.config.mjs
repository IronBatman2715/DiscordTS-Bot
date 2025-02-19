import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  {
    ignores: ["*.env", "build/**", "logs/**", "eslint.config.mjs"], // would like to lint last file, but can not figure it out
  },
  {
    files: ["src/**"],
  },
  eslint.configs.recommended,
  ...tsEslint.configs.strictTypeChecked, // includes deprecation lints
  ...tsEslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
  },
  eslintPluginImport.flatConfigs.recommended,
  eslintPluginImport.flatConfigs.typescript,
  eslintPluginPrettierRecommended,
  {
    rules: {
      "no-unused-vars": "off",
      "no-fallthrough": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-var-requires": "warn",
      "@typescript-eslint/restrict-template-expressions": [
        "warn",
        {
          allowBoolean: true,
          allowNullish: false,
          allowNumber: false, // manually disable to ensure floating point numbers are properly handled
        },
      ],

      "import/no-dynamic-require": "warn",
    },
  }
);
