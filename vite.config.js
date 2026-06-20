import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Single-page React app for the VarAInce site.
// The legacy *.html pages (about/events/team/contact) are superseded by the
// in-app sections and are intentionally not wired as Vite entry points.
export default defineConfig({
  plugins: [react()],
  server: { host: "127.0.0.1", port: 5173 },
  build: { outDir: "dist", assetsInlineLimit: 0 },
});
