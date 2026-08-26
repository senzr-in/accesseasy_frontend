import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    root: 'apps/patrol',
    envDir: path.resolve(__dirname),
    base: '/',
    plugins: [vue(), tailwindcss()],
    resolve: { 
      alias: { 
        "@": path.resolve(__dirname, "./src"),
        "@tensorflow/tfjs-tflite": path.resolve(__dirname, "./node_modules/@tensorflow/tfjs-tflite/dist/tf-tflite.fesm.js")
      } 
    },
    define: { 
      VITE_API_URL: JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_APP_MODE': JSON.stringify('patrol')
    },
    build: { 
      outDir: path.resolve(__dirname, 'dist/patrol'), 
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ['@tensorflow/tfjs-tflite']
    },
    server: { 
      port: 5176, 
      host: "0.0.0.0", 
      watch: { usePolling: true },
      hmr: { overlay: false }
    }
  };
});
