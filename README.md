# Hidrex Empleados

React application to manage employees.

## Setup

1. Use Node.js 18.19.0 (e.g., run `nvm use`).
2. Create a `.env` file by copying the provided example:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` with the credentials from your Supabase project.
   The build script automatically creates `public/env.js` using these variables, so you no longer need to copy it manually.
4. Install dependencies and start the development server:
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

1. Ensure `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` are set in the environment.
   The `npm run build` command (and the included script) will create `public/env.js` automatically.
2. Serve `index.html` (and the generated `public/env.js` file) with any static HTTP server.

### Troubleshooting

* **Missing `public/env.js`** – The build step should generate this file.
  Ensure `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` are defined when
  running `npm run build`.
* **404 for `public/env.js`** – Confirm that Netlify (or your server) is
  serving the generated file alongside `index.html`.

The React build uses environment variables from `.env` at build time, whereas
 the plain HTML version reads its configuration at runtime from `public/env.js`.

## License

This project is licensed under the [MIT License](LICENSE).
