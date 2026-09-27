# Deploying FinanceFlow

This repository is prepared for Netlify static hosting. No site has been published and no hosting account has been created as part of this project.

## Local verification

Use Node 22.12+ (22.x) or 24+:

```sh
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run preview
```

The build command is `npm run build`; the output directory is `dist`. Open the preview URL, visit `/transactions` directly, then refresh. Check the browser console and network panel for missing assets.

## Netlify setup

1. When you are ready to publish, push the repository to a Git host you control.
2. In your Netlify account, import that repository as a project.
3. Keep the project root as the base directory, `npm run build` as the build command and `dist` as the publish directory. `netlify.toml` records these settings and selects Node 22.
4. Review hosting terms and account limits before deploying. This project does not need paid add-ons or environment secrets.
5. Deploy and use the actual URL Netlify provides. This document intentionally contains no invented live URL.

For a manual deploy, build locally and upload the contents of `dist` using Netlify's deploy interface.

## Routing and HTTPS

`public/_redirects` is copied into `dist/_redirects`:

```text
/* /index.html 200
```

This fallback serves the application for nested routes so React Router can select the page. Real static assets are still served normally. The rule follows [Netlify's SPA rewrite documentation](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/).

Netlify provides HTTPS on its generated site URL; custom domains require correct DNS configuration. Check the deployed certificate and HTTPS redirect, following the [official HTTPS documentation](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/).

## After publishing

- Open every route, including a direct `/transactions` URL, and reload it.
- Check the unknown-route screen and favicon.
- Add a transaction, reload, edit and delete it.
- Test at 375, 768, 1024 and 1440 pixels; check keyboard dialog focus and Escape.
- Verify the daily rate or its visible fallback. Test local edits while offline after the app has loaded.
- Make sure no private data or secrets were added to the repository. This application requires no API keys.

`localStorage` belongs to an origin: protocol, hostname and port. Data entered at `http://127.0.0.1:5173` will not automatically appear at the deployed HTTPS domain. A different browser/profile also has separate data. This version has no data transfer feature.

Official references checked during implementation: [Vite getting started](https://vite.dev/guide/), [Frankfurter API](https://frankfurter.dev/), and the Netlify pages above.
