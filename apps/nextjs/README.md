# @agreeto/nextjs

## Get started

In order to get [`@agreeto/outlook`](../outlook/) to play nice, we need to run Next.js with https, which requires you to generate certificates for `localhost`. We'll do this with [`mkcert`](https://github.com/FiloSottile/mkcert). From the next.js directory, run:

```bash
mkcert -install

mkcert localhost
```

to generate the necessary certificates. You should now have a `localhost.pem` and `localhost-key.pem` file in the next.js directory and they should be gitignored by default.

Then, start the dev server with:

```bash
pnpm dev
# or from repo root
pnpm --filter nextjs dev
```
