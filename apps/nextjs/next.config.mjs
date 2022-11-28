// @ts-check
import withTM from "next-transpile-modules";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. Usage: `SKIP_ENV_VALIDATION=1 pnpm lint`.
 * This is especially useful for Docker builds or linting.
 * We also skip validating in CI since that's not necessary for now.
 */
!process.env.SKIP_ENV_VALIDATION &&
  !process.env.CI &&
  (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // We lint as a separate pipeline step, so we don't need to do it here.
    ignoreDuringBuilds: !!process.env.CI,
  },
};

export default withTM(["@agreeto/api", "@agreeto/auth", "@agreeto/db"])(config);
