import { createApp } from "vue";
import { createRoot } from "react-dom/client";
import { setVeauryOptions } from "veaury";
import "./index.css";
import App from "./App.vue";

// Required for React 19 compatibility in veaury.
setVeauryOptions({
  react: { createRoot },
});

createApp(App).mount("#app");
