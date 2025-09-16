import type { signInWithEmailAndPassword, createUserWithEmailAndPassword, isSignInWithEmailLink } from 'firebase/auth';
import type { FirebaseUI } from '~/config';

type Overrides = {
  signInWithEmailAndPassword: typeof signInWithEmailAndPassword,
  createUserWithEmailAndPassword: typeof createUserWithEmailAndPassword,
  isSignInWithEmailLink: typeof isSignInWithEmailLink,
};

// Type for the implementation object that provides the same interface as the overrides
type Imp = {
  [K in keyof Overrides]: Overrides[K];
};

const OVERRIDES = new WeakMap<FirebaseUI, Partial<Overrides>>();

export function setOverrides(ui: FirebaseUI, overrides: Partial<Overrides>) {
  OVERRIDES.set(ui, overrides);
}

export function getImp(ui: FirebaseUI): Imp {
  return new Proxy({} as Imp, {
    get(_, property: keyof Overrides) {
      return async (...args: any[]) => {
        const override = OVERRIDES.get(ui)?.[property];
  
        if (override) {
          return (override as any)(...args);
        }
  
        const exported = await import('firebase/auth').then(m => m[property]);

        if (!exported) {
          throw new Error(`Invalid override for ${property}`);
        }

        return (exported as any)(...args);
      };
    },
  });
}
