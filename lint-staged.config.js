const micromatch = require("micromatch");
let eslintConfig = require("./.eslintrc.json");

module.exports = {
  "*.{js,jsx,ts,tsx}": (files) => {
    const match = micromatch.not(files, eslintConfig.ignorePatterns, {
      matchBase: true,
    });
    return `eslint ${match.join(" ")} --fix --no-cache --max-warnings=0`;
  },
  "*.{html,json,css,scss,md}": (files) => `prettier ${files.join(" ")} --write`,
};
