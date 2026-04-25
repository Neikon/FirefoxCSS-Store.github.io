# Persistent Memory

This file stores durable project context so future conversations can resume work with less re-discovery.

## Project Summary

- Repository: `FirefoxCSS-Store.github.io`
- Purpose: static community hub for discovering and sharing Firefox `userChrome.css` themes
- Product direction: user/author-submitted hub that links to original repositories; no scraping, crawling, or automatic theme discovery
- Main data source: one structured JSON entry per theme under `src/content/themes/`
- Site source: Astro app under `src/`
- Generated site output: `dist/` during build; generated files are not committed

## Tooling And Validation

- Package manager: `npm`
- Build command: `npm run build`
- Test command: `npm test`
- Build system: Astro + TypeScript
- Theme validation script: `scripts/validate-themes.mjs`
- Repository metadata refresh script: `scripts/refresh-theme-stats.mjs`; it only enriches repositories already present in submitted theme entries
- Monthly repository audit script: `scripts/audit-theme-repositories.mjs`; it only checks repositories already present in submitted theme entries, including archived entries so deleted archived repositories can still be proposed for removal
- Dev container config: `.devcontainer/devcontainer.json`
- Devcontainer bootstrap script: `.devcontainer/post-create.sh`
- Devcontainer automation runs `.devcontainer/post-create.sh` from `postCreateCommand` to install project dependencies after container creation/rebuild
- The build toolchain runs on Node 24 with Astro 6
- `npm audit` is currently clean after adding a targeted `yaml` override for the Astro check toolchain

## Automation Context

- Active rebuild branch for the community hub: `rebuild-astro-community-hub`
- Fork deployment config currently targets `Neikon/FirefoxCSS-Store.github.io` as a GitHub Pages project site
- Existing GitHub Actions:
- `.github/workflows/build.yml`
- `.github/workflows/check-themes.yml`
- `.github/workflows/create-theme-submission.yml`
- `.github/workflows/publish-approved-theme-submission.yml`
- `.github/workflows/close-merged-theme-submission.yml`
- CI workflows now opt into Node 24 for JavaScript actions explicitly and use `actions/checkout@v6` plus `actions/setup-node@v6`
- Build workflow runs automatically on pushes to `main` that affect Astro site/build inputs and deploys `dist/` through GitHub Pages artifacts
- PR validation runs `npm test` and `npm run build` for site-related changes
- Theme submission automation uses GitHub Issue Forms plus `.github/workflows/create-theme-submission.yml`; it creates candidate PRs from complete submission issues without Decap or external auth hosting
- Approved submission PRs are finalized by `.github/workflows/publish-approved-theme-submission.yml`, which sets `status: "published"` and assigns the next available low `catalogIndex`; maintainers still merge the PR explicitly
- Merged submission PRs close their source issue through `.github/workflows/close-merged-theme-submission.yml`; new generated PR bodies also include `Closes #<issue>`
- The build workflow syntax also requires `workflow_dispatch:` with a trailing colon; missing it makes GitHub mark the workflow file as invalid even if other checks still pass

## Repo Notes

- Local `.codex` file is ignored in `.gitignore`
- Build workflow now deploys the Astro `dist/` artifact to GitHub Pages and does not commit generated files back to the branch
- Fork-specific values to revert before merging upstream: `astro.config.mjs` uses `site: https://neikon.github.io` and `base: /FirefoxCSS-Store.github.io`; `src/layouts/BaseLayout.astro` links to the fork repo; `src/pages/submit.astro` links to the fork's theme submission issue form
- Pull requests touching catalog or site files trigger validation via `npm test` and `npm run build`
- Site pages are authored as Astro routes in `src/pages/`
- Client behavior for catalog search/filter/sort is implemented in `src/scripts/hub.ts`
- Styles are authored in `src/styles/global.css`
- Public static assets live under `public/`
- Local containerized development is configured to install Node, npm, and `jq`; Nushell is no longer required for catalog refresh
- The devcontainer also runs `npm ci` automatically, so rebuilds recreate `node_modules` without manual setup
- Optimized legacy screenshots were moved into `public/assets/img/themes/`
- Project-facing text should be written in English by default; chat replies should mirror the user's language

## Architecture Snapshot

- `src/content/themes/*.json` is the catalog source of truth; only `published` entries render publicly
- Astro content collections validate the theme schema during build
- The home page renders all published theme cards statically and uses small client-side TypeScript for search, tag filters, and sorting
- Each published theme gets a `/themes/[slug]/` detail page and the site also generates `/themes.json`
- Archived-but-existing repositories are preserved under `/archive/` with unsupported messaging; unavailable/deleted repositories are proposed for removal by PR
- New theme submissions come through the `Submit a theme` GitHub Issue Form; automation turns them into `candidate` PRs, and they become public only after human review

## Known Technical Risks

- Automatic submission PR creation depends on repository workflow permissions. If `GITHUB_TOKEN` cannot create PRs, the workflow still pushes `submissions/theme-<issue-number>` and reports a manual PR URL; add `SUBMISSION_PR_TOKEN` or enable GitHub Actions PR creation to make it fully automatic.
- `scripts/refresh-theme-stats.mjs` uses external APIs when run manually or in future automation; it should never discover new repositories
- `.github/workflows/audit-theme-repositories.yml` runs monthly and creates a PR when repositories should be archived or removed; it audits both `published` and `archived` entries, but only `published` entries are moved into the archive. If an archived entry later becomes unavailable, it is proposed for removal. If `GITHUB_TOKEN` is blocked from creating PRs, it still pushes the audit branch and reports a manual PR URL. Automatic PR creation requires enabling the repository's "Allow GitHub Actions to create and approve pull requests" setting or adding an `AUDIT_PR_TOKEN` secret with PR creation permission.
- Existing legacy theme entries are marked with `submitterRole: "legacy"` because original submitter relationship is unknown

## Working Agreement For Future Sessions

- Read this file before making assumptions about project state
- Update this file manually when there are relevant decisions, branch changes, automation updates, or persistent blockers
- Keep entries concise and durable; avoid transient noise
- Future agents should create a commit and push after implementing relevant changes or new functionality so work stays traceable and reversible
- Future agents must not merge without explicit user authorization
- Future agents must not take actions that could affect the production main branch without explicit user authorization
