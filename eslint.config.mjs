import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["*.env", "build/**", "logs/**", "eslint.config.mjs", "loader.js"], // would like to lint last two files, but can not figure it out
  },
  {
    files: ["src/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked, // includes deprecation lints
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
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
          allowNumber: false, // manually disable to ensure floating point numbers are properly handled
          allowBoolean: true,
        },
      ],

      "import/no-dynamic-require": "warn",
    },
  }
);
