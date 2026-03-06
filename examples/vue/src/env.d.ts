declare module "*.jsx" {
  const component: unknown;
  export default component;
}

declare module "veaury/vite/index.js" {
  const plugin: (options?: { type?: string }) => unknown;
  export default plugin;
}
