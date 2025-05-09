module.exports = {
  ignorePatterns: ["node_modules/**", "_site/**", "**/*.min.js", "js/vendor/**"],
  env: {
    browser: true,
    es2021: true,
    node: true,
    jquery: true // Allow jQuery globals
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module"
  },
  rules: {
    "no-undef": "warn", // Downgrade from error to warning
    "no-unused-vars": "warn", // Warn about unused variables instead of error
    "no-console": "error", // Don't allow console.log statements
    "no-mixed-spaces-and-tabs": "warn",
    "no-irregular-whitespace": "warn",
    "no-prototype-builtins": "warn", // Don't allow direct prototype method calls
    "no-var": "warn", // Don't allow var declarations
    "quotes": "off", // Don't enforce quote style
    "semi": "warn", // Enforce semicolons
  },
  globals: {
    // Add any global variables your scripts might use
    "window": true,
    "document": true,
    "$": true,
    "localStorage": true,
    "sessionStorage": true,
	"workbox": true
  }
};
