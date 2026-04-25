# Deploying OPIc Memorizer

## GitHub Pages

This app is configured for GitHub Pages under the repository URL:

`https://sonwy2.github.io/opic_agent/`

After these files are pushed to `main`, enable Pages once in GitHub:

1. Open repository settings.
2. Go to `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Run the `Deploy OPIc Memorizer` workflow or push to `main`.

The workflow builds only `apps/opic-memorizer` and publishes the generated `dist` folder.

## Reflecting Main Updates on Hosting

The hosting page is updated by the GitHub Actions workflow:

`.github/workflows/deploy-opic-memorizer.yml`

Automatic deploy:

1. Merge or push the app changes into `main`.
2. GitHub Actions runs `Deploy OPIc Memorizer` when files under `apps/opic-memorizer/**`, `outputs/opic/2026-04-22/**`, or the deploy workflow change.
3. When the workflow succeeds, GitHub Pages serves the new build at `https://sonwy2.github.io/opic_agent/`.

Manual deploy after `main` changes:

1. Open `https://github.com/SonWY2/opic_agent/actions/workflows/deploy-opic-memorizer.yml`.
2. Click `Run workflow`.
3. Select branch `main`.
4. Click `Run workflow`.
5. Wait for the `deploy` job to finish, then refresh `https://sonwy2.github.io/opic_agent/`.

If the page still shows the old UI, hard refresh the browser or open the page in a private window. GitHub Pages can also take a short time to serve the newest artifact after the workflow succeeds.

## Local Commands

```bash
npm ci
npm run validate:data
npm test
npm run build
```

For a GitHub Pages-compatible local build:

```bash
VITE_BASE_PATH=/opic_agent/ npm run build
```
