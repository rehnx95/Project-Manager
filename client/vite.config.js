import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function spaNavigation(req) {
  if (req.method !== "GET" || !req.headers.accept?.includes("text/html")) return;
  const pathname = req.url.split("?")[0];
  if (
    pathname === "/dashboard" ||
    /^\/projects\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/i.test(pathname) ||
    /^\/tasks\/[1-9]\d*\/?$/.test(pathname)
  ) {
    return "/index.html";
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/users": "http://localhost:8000",
      "/projects": { target: "http://localhost:8000", bypass: spaNavigation },
      "/tasks": { target: "http://localhost:8000", bypass: spaNavigation },
      "/dashboard": { target: "http://localhost:8000", bypass: spaNavigation },
      "/database": "http://localhost:8000",
      "/testing": "http://localhost:8000",
    },
  },
});
