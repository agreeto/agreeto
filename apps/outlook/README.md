# AgreeTo for Outlook

This is the [Microsoft Outlook Add-in](https://docs.microsoft.com/office/dev/add-ins/outlook/apis) from AgreeTo. 

## What's inside?

This app is a React app built with [ViteJS](https://vitejs.dev/).

## Particularities

A Microsoft Add-in An Outlook add-in consists of two components: 
1. the XML add-in manifest, and
2. a web page (supported by Microsoft's OfficeJS API).
   
The [XML manifest](https://docs.microsoft.com/office/dev/add-ins/outlook/manifests) describes how the add-in integrates across Outlook clients.

It's stored in the src as [`manifest.dev.xml`](./src/manifest.dev.xml).

The `build:manifest` script replaces the development host with the production host and stores the file in the [`public/`](./public/) folder. This is a [special folder for vite](https://vitejs.dev/guide/assets.html#the-public-directory) as it serves at the root path `/` during dev, and copied to the root of the `dist/` directory as-is.

### Scripts

This set up means that there are some particularities for the scripts (all commands from workspace root):
- `pnpm outlook dev` starts the dev server
- `pnpm outlook build` builds for production
- `pnpm outlook serve` serves the `/dist` folder with hot reload
  *NB*: This command requires the `/dist` folder to have been built. To enable HMR on that, run `build:dev` in a secomand terminal window.****