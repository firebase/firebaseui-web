declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}

declare module "*.jsx" {
  const component: unknown;
  export default component;
}

declare module "veaury/vite/index.js" {
  const plugin: (options?: {
    type?: "vue" | "react" | "custom";
    vueJsxInclude?: RegExp[];
    vueJsxExclude?: RegExp[];
  }) => unknown;
  export default plugin;
}
