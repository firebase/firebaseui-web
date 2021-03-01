import { Config } from '@stencil/core';
import { angularOutputTarget, ValueAccessorConfig } from '@stencil/angular-output-target';
import { reactOutputTarget } from '@stencil/react-output-target';
import { svelteOutputTarget } from '@stencil/svelte-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  namespace: 'firebaseui',
  buildEs5: true,
  outputTargets: [
    angularOutputTarget({
      componentCorePackage: 'firebaseui',
      directivesProxyFile: 'frameworks/angular/src/directives/proxies.ts',
    }),
    reactOutputTarget({
      componentCorePackage: 'firebaseui',
      proxiesFile: 'frameworks/react/src/components.ts',
    }),
    svelteOutputTarget({
      componentCorePackage: 'firebaseui',
      proxiesFile: 'frameworks/svelte/src/proxies.ts',
    }),
    vueOutputTarget({
      componentCorePackage: 'firebaseui',
      proxiesFile: 'frameworks/vue/src/proxies.ts',
    }),
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
      footer: '*Built with love!*',
      dir: 'docs',
    },
  ],
};
