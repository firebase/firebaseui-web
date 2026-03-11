declare module "veaury/vite/index.js" {
  const plugin: (options?: {
    type?: "vue" | "react" | "custom";
    vueJsxInclude?: RegExp[];
    vueJsxExclude?: RegExp[];
    reactOptions?: Record<string, unknown>;
  }) => unknown;
  export default plugin;
}
