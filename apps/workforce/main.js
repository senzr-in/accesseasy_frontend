import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/styles/variables.css";
import "@/assets/styles/typography.css";

const app = createApp(App);
app.use(router);

// GA4 Route change tracking
router.afterEach((to) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: to.fullPath,
      page_title: document.title || "AccessEasy Workforce",
      send_to: "G-B70SCFTR40"
    });
  }
});

app.mount("#app");
