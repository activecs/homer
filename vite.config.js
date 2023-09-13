import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  build: {
    assetsDir: "resources",
  },
  server: {
    proxy: {
      "/cf": {
        target: "https://api.cloudflare.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cf/, ""),
      },
      "/ts": {
        target: "https://api.tailscale.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ts/, ""),
      },
      "/nc": {
        target: "http://homer.dereza.home",
        changeOrigin: true,
        secure: false
      },
      "/ppngx": {
        target: "http://homer.dereza.home",
        changeOrigin: true,
        secure: false
      },
      "/pxbck": {
        target: "http://homer.dereza.home",
        changeOrigin: true,
        secure: false
      },
    },
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      useCredentials: true,
      manifestFilename: "assets/manifest.json",
      manifest: {
        name: "Homer dashboard",
        short_name: "Homer",
        description: "Home Server Dashboard",
        theme_color: "#3367D6",
        start_url: "../",
        scope: "../",
        icons: [
          {
            src: "./icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        navigateFallback: null,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
