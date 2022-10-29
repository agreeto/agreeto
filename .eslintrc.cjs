module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-agreeto`
  // https://turbo.build/repo/docs/getting-started/create-new#understanding-eslint-config-custom
  extends: ["agreeto"],
  settings: {
    next: {
      rootDir: ["apps/nextjs/"],
    },
  },
};
