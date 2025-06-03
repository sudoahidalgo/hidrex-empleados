# Hidrex Empleados

React application to manage employees.

## Setup

1. Create a `.env` file by copying the provided example:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` with the credentials from your Supabase project.
3. Install dependencies and start the development server:
   ```bash
   npm install
   npm start
   ```

## Building

Tailwind CSS is compiled using PostCSS during the build process. Generate a production build with:

```bash
npm run build
```
