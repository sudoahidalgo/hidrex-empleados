# Hidrex Empleados

React application to manage employees.

## Setup

1. Use Node.js 18.19.0 (e.g., run `nvm use`).
2. Create a `.env` file by copying the provided example:
   ```bash
   cp .env.example .env
   ```
3. Create `public/env.js` for the standalone HTML by copying the provided template:
   ```bash
   cp public/env.example.js public/env.js
   ```
   Then edit `public/env.js` and set `SUPABASE_URL` and `SUPABASE_KEY`.
   The standalone `index.html` checks for this file and displays an error message if it is missing.
4. Edit `.env` and set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` with the credentials from your Supabase project.
5. Install dependencies and start the development server:
   ```bash
   npm install
   npm start
   ```

## Building

Tailwind CSS is compiled using PostCSS during the build process. Generate a production build with:

```bash
npm run build
```

## Serving `index.html` in Production

There are two ways to deploy this project:

### 1. React build

1. Run `npm run build` to generate the production React bundle inside the
   `build/` folder.
2. Serve the `build/` directory with any static server or hosting provider.

### 2. Plain HTML version

The repository also includes a standalone `index.html` that does not use React
bundling. To serve this file directly:

1. Copy the runtime configuration:
   ```bash
   cp public/env.example.js public/env.js
   ```
   Edit `public/env.js` with your Supabase credentials.
2. Serve `index.html` (and the `public/env.js` file) with any static HTTP server.

### Troubleshooting

* **Missing `public/env.js`** &ndash; If the browser console shows
  `window._env_ is undefined`, make sure `public/env.js` exists relative to
  `index.html` and defines `window._env_`.

* **404 for `public/env.js`** &ndash; Verify that `public/env.js` was copied from
  `public/env.example.js` to your production directory.

The React build uses environment variables from `.env` at build time, whereas
 the plain HTML version reads its configuration at runtime from `public/env.js`.
