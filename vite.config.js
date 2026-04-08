import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      VITE_API_URL: JSON.stringify(env.VITE_API_URL),
    },
    server: {
      port: 8080,
      host: "0.0.0.0", // Required for Docker/Cloud Run
    },
    preview: {
      port: 8080,
      host: "0.0.0.0",
    },
  };
});