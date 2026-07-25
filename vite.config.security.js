import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    root: 'apps/security',
    envDir: path.resolve(__dirname),
    base: '/',
    plugins: [vue(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
    define: { 
      VITE_API_URL: JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_APP_MODE': JSON.stringify('security')
    },
    build: { outDir: path.resolve(__dirname, 'dist/security'), emptyOutDir: true },
    server: { port: 5175, host: "0.0.0.0", watch: { usePolling: true } }
  };
});