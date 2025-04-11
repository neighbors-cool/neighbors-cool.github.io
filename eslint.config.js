import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "_site/**", "**/*.min.js", "js/vendor/**"]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
        $: true,
        localStorage: true,
        sessionStorage: true,
		workbox: true
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-undef": "warn",
      "no-unused-vars": "warn",
      "no-console": "error",
      "no-mixed-spaces-and-tabs": "warn",
      "no-irregular-whitespace": "warn",
      "no-prototype-builtins": "warn",
      "no-var": "warn",
      "quotes": "warn",
      "semi": "warn",
      "no-redeclare": "warn",
      "no-extra-boolean-cast": "off"
    }
  }
];