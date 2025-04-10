module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true, // Add this to define Node.js globals like 'module'
	},
	extends: [
		'eslint:recommended',
	],
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module',
	},
	rules: {
		'no-undef': 'error', // Ensure undeclared variables are disallowed
	},
};