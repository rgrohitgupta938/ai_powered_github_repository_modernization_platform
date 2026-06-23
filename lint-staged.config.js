export default {
  "*.{js,cjs,mjs,ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{json,jsonc,yml,yaml,md,mdx,css,scss,html}": ["prettier --write"],
};
