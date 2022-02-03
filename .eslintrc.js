module.exports = {
  "extends": "airbnb-base",
  "rules": {
    "no-console": "off",
    "arrow-parens": "off",
    "max-len": "off",
  },
  "globals": {
    "Long": true,
  },
  "env": {
    "browser": true,
    "node": true,
    "jest": true,
  },
  "overrides": [
    {
      "files": ["**/tests/**/*.js"],
      "rules": {
        "import/no-unresolved": "off",
        "class-methods-use-this": "off",
      }
    }
  ]
};
