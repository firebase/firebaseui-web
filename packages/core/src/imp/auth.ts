import type { signInWithEmailAndPassword, createUserWithEmailAndPassword, isSignInWithEmailLink, linkWithCredential, signInWithCredential, signInWithPhoneNumber, sendSignInLinkToEmail, sendPasswordResetEmail, signInAnonymously, signInWithRedirect, signInWithEmailLink, linkWithRedirect } from 'firebase/auth';
import type { FirebaseUIConfiguration } from '~/config';

export type AuthOverrides = {
  linkWithCredential: typeof linkWithCredential,
  signInWithCredential: typeof signInWithCredential,
  signInWithEmailAndPassword: typeof signInWithEmailAndPassword,
  createUserWithEmailAndPassword: typeof createUserWithEmailAndPassword,
  isSignInWithEmailLink: typeof isSignInWithEmailLink,
  signInWithPhoneNumber: typeof signInWithPhoneNumber,
  sendPasswordResetEmail: typeof sendPasswordResetEmail,
  sendSignInLinkToEmail: typeof sendSignInLinkToEmail,
  signInAnonymously: typeof signInAnonymously,
  signInWithRedirect: typeof signInWithRedirect,
  signInWithEmailLink: typeof signInWithEmailLink,
  linkWithRedirect: typeof linkWithRedirect,
};

// Type for the implementation object that provides the same interface as the overrides
export type AuthImplementation = {
  [K in keyof AuthOverrides]: (...args: Parameters<AuthOverrides[K]>) => Promise<Awaited<ReturnType<AuthOverrides[K]>>>;
};

// Support both individual function overrides and module imports
type OverrideModule = () => Promise<Partial<AuthOverrides>>;

const MODULE_OVERRIDES = new WeakMap<FirebaseUIConfiguration, OverrideModule>();

export function setAuthOverrideModule(ui: FirebaseUIConfiguration, moduleImportResolver: OverrideModule) {
  MODULE_OVERRIDES.set(ui, moduleImportResolver);
}

export function getAuthImp(ui: FirebaseUIConfiguration): AuthImplementation {
  return new Proxy({} as AuthImplementation, {
    get(_, property: keyof AuthOverrides) {
      return async (...args: unknown[]) => {
        const override = await MODULE_OVERRIDES.get(ui)?.();
        const fn = override?.[property];

        if (fn) {
          return (fn as any)(...args);
        }

        // Fall back to default firebase/auth import
        const exported = await import('firebase/auth').then(m => m[property]);

        if (!exported) {
          throw new Error(`Invalid override for ${property}`);
        }

        return (exported as any)(...args);
      };
    },
  });
}
