// @ts-check
import withTM from "next-transpile-modules";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. Usage: `SKIP_ENV_VALIDATION=1 pnpm lint`.
 * This is especially useful for Docker builds or linting.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
};

export default withTM(["@agreeto/api", "@agreeto/auth", "@agreeto/db"])(config);
