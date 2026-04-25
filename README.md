# FirefoxCSS Hub

FirefoxCSS Hub is a static community catalog for discovering and sharing Firefox `userChrome.css` themes. It does not scrape, crawl, or auto-discover themes. Every public entry points back to the original repository submitted by an author, maintainer, or community user.

## What This Project Publishes

- A searchable theme gallery built with Astro and TypeScript.
- One public detail page per published theme.
- A generated `/themes.json` endpoint for lightweight integrations.
- A Decap CMS submission form at `/admin/` for PR-based community submissions.
- Validation scripts that keep catalog entries structured, reviewable, and safe to publish.

## Local Development

```sh
npm ci
npm test
npm run build
npm run dev
```

## Theme Data

Theme entries live in `src/content/themes/*.json`. New submissions should start with:

- `status: "candidate"`
- `submitterRole: "author"`, `"user"`, or `"maintainer"`
- the original `repository` URL
- at least one screenshot in `public/assets/img/themes/`
- normalized lowercase tags

Only entries with `status: "published"` are rendered in the public catalog and exported through `/themes.json`.

## Metadata Refresh

`npm run refresh:themes` updates only basic repository metadata for repositories already present in the catalog:

- stars
- last update date
- owner avatar
- accessibility status

It does not search for new themes, crawl topics, or change editorial fields such as title, description, tags, screenshots, or publication status.

## Deployment

GitHub Actions validates PRs with:

```sh
npm test
npm run build
```

The production workflow builds Astro into `dist/` and deploys that artifact to GitHub Pages. Generated site files are not committed back to the repository.

## Fork Deployment Notes

This branch is currently configured to run as a GitHub Pages project site from the fork:

- `astro.config.mjs`
  - `site: "https://neikon.github.io"`
  - `base: "/FirefoxCSS-Store.github.io"`
- `public/admin/config.yml`
  - `backend.repo: "Neikon/FirefoxCSS-Store.github.io"`
- `src/layouts/BaseLayout.astro`
  - GitHub navigation link points to `https://github.com/Neikon/FirefoxCSS-Store.github.io`

When this work is moved back to the original organization repository, update those values to:

- `astro.config.mjs`
  - `site: "https://firefoxcss-store.github.io"`
  - remove `base` if the site is served from the domain root
- `public/admin/config.yml`
  - `backend.repo: "FirefoxCSS-Store/FirefoxCSS-Store.github.io"`
- `src/layouts/BaseLayout.astro`
  - GitHub navigation link should point back to `https://github.com/FirefoxCSS-Store/FirefoxCSS-Store.github.io`
