import { createApp } from "vue";
import { createRoot } from "react-dom/client";
import { setVeauryOptions } from "veaury";
import App from "./App.vue";

// react-dom 19+ requires explicit createRoot configuration
setVeauryOptions({ react: { createRoot } });

createApp(App).mount("#app");
