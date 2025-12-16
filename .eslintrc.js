module.exports = {
  "parser": "@typescript-eslint/parser",
  "extends": [
    "airbnb-base",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": ["@typescript-eslint"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "off",
    "arrow-parens": "off",
    "max-len": "off",
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "no-plusplus": "off",
    "no-continue": "off",
    "no-restricted-syntax": "off",
    "no-await-in-loop": "off"
  },
  "globals": {
    "Long": true,
  },
  "env": {
    "browser": true,
    "node": true,
    "jest": true,
  },
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".ts"]
      }
    }
  }
};
