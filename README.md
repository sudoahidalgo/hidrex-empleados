# Hidrex Empleados

React application to manage employees.

## Setup

1. Create a `.env` file by copying the provided example:
   ```bash
   cp .env.example .env
   ```
2. Create `public/env.js` for the standalone HTML by copying the provided template:
   ```bash
   cp public/env.example.js public/env.js
   ```
   Then edit `public/env.js` and set `SUPABASE_URL` and `SUPABASE_KEY`.
3. Edit `.env` and set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` with the credentials from your Supabase project.
4. Install dependencies and start the development server:
   ```bash
   npm install
   npm start
   ```
