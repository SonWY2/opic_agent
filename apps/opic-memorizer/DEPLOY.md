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

