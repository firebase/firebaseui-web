/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it, expect, vi } from 'vitest';
import { FirebaseUIError, handleFirebaseError } from '../../src/errors';
import { english } from '@firebase-ui/translations';

describe('FirebaseUIError', () => {
  describe('constructor', () => {
    it('should extract error code from Firebase error message', () => {
      const error = new FirebaseUIError({
        customData: { message: 'Firebase: Error (auth/wrong-password).' },
      });
      expect(error.code).toBe('auth/wrong-password');
    });

    it('should use error code directly if available', () => {
      const error = new FirebaseUIError({ code: 'auth/user-not-found' });
      expect(error.code).toBe('auth/user-not-found');
    });

    it('should fallback to unknown if no code is found', () => {
      const error = new FirebaseUIError({});
      expect(error.code).toBe('unknown');
    });

    it('should use custom translations if provided', () => {
      const translations = {
        'es-ES': {
          errors: {
            userNotFound: 'Usuario no encontrado',
          },
        },
      };
      const error = new FirebaseUIError({ code: 'auth/user-not-found' }, translations, 'es-ES');
      expect(error.message).toBe('Usuario no encontrado');
    });

    it('should fallback to default translation if language is not found', () => {
      const error = new FirebaseUIError({ code: 'auth/user-not-found' }, undefined, 'fr-FR');
      expect(error.message).toBe('No account found with this email address');
    });

    it('should handle malformed error objects gracefully', () => {
      const error = new FirebaseUIError(null);
      expect(error.code).toBe('unknown');
      expect(error.message).toBe('An unexpected error occurred');
    });

    it('should set error name to FirebaseUIError', () => {
      const error = new FirebaseUIError({});
      expect(error.name).toBe('FirebaseUIError');
    });
  });

  describe('handleFirebaseError', () => {
    const mockUi = {
      translations: {
        'es-ES': {
          errors: {
            userNotFound: 'Usuario no encontrado',
          },
        },
      },
      locale: 'es-ES',
    };

    it('should throw FirebaseUIError for Firebase errors', () => {
      const firebaseError = {
        name: 'FirebaseError',
        code: 'auth/user-not-found',
      };

      expect(() => {
        handleFirebaseError(mockUi as any, firebaseError);
      }).toThrow(FirebaseUIError);

      try {
        handleFirebaseError(mockUi as any, firebaseError);
      } catch (e) {
        expect(e).toBeInstanceOf(FirebaseUIError);
        expect(e.code).toBe('auth/user-not-found');
        expect(e.message).toBe('Usuario no encontrado');
      }
    });

    it('should throw FirebaseUIError with unknown code for non-Firebase errors', () => {
      const error = new Error('Random error');

      expect(() => {
        handleFirebaseError(mockUi as any, error);
      }).toThrow(FirebaseUIError);

      try {
        handleFirebaseError(mockUi as any, error);
      } catch (e) {
        expect(e).toBeInstanceOf(FirebaseUIError);
        expect(e.code).toBe('unknown');
      }
    });

    it('should pass translations and language to FirebaseUIError', () => {
      const firebaseError = {
        name: 'FirebaseError',
        code: 'auth/user-not-found',
      };

      expect(() => {
        handleFirebaseError(mockUi as any, firebaseError);
      }).toThrow(FirebaseUIError);

      try {
        handleFirebaseError(mockUi as any, firebaseError);
      } catch (e) {
        expect(e).toBeInstanceOf(FirebaseUIError);
        expect(e.message).toBe('Usuario no encontrado');
      }
    });

    it('should handle null/undefined errors', () => {
      expect(() => {
        handleFirebaseError(mockUi as any, null);
      }).toThrow(FirebaseUIError);

      try {
        handleFirebaseError(mockUi as any, null);
      } catch (e) {
        expect(e).toBeInstanceOf(FirebaseUIError);
        expect(e.code).toBe('unknown');
      }
    });

    it('should preserve the error code in thrown error', () => {
      const firebaseError = {
        name: 'FirebaseError',
        code: 'auth/wrong-password',
      };

      expect(() => {
        handleFirebaseError(mockUi as any, firebaseError);
      }).toThrow(FirebaseUIError);

      try {
        handleFirebaseError(mockUi as any, firebaseError);
      } catch (e) {
        expect(e).toBeInstanceOf(FirebaseUIError);
        expect(e.code).toBe('auth/wrong-password');
      }
    });

    describe('account exists with different credential handling', () => {
      it('should store credential and throw error when enableHandleExistingCredential is true', () => {
        const mockCredential = { type: 'google.com' };
        const error = {
          code: 'auth/account-exists-with-different-credential',
          credential: mockCredential,
          customData: { email: 'test@test.com' },
        };

        expect(() => {
          handleFirebaseError(mockUi as any, error, { enableHandleExistingCredential: true });
        }).toThrow(FirebaseUIError);

        try {
          handleFirebaseError(mockUi as any, error, { enableHandleExistingCredential: true });
        } catch (e) {
          expect(e).toBeInstanceOf(FirebaseUIError);
          expect(e.code).toBe('auth/account-exists-with-different-credential');
          expect(window.sessionStorage.getItem('pendingCred')).toBe(JSON.stringify(mockCredential));
        }
      });

      it('should not store credential when enableHandleExistingCredential is false', () => {
        const mockCredential = { type: 'google.com' };
        const error = {
          code: 'auth/account-exists-with-different-credential',
          credential: mockCredential,
        };

        expect(() => {
          handleFirebaseError(mockUi as any, error);
        }).toThrow(FirebaseUIError);

        try {
          handleFirebaseError(mockUi as any, error);
        } catch (e) {
          expect(window.sessionStorage.getItem('pendingCred')).toBeNull();
        }
      });

      it('should not store credential when no credential in error', () => {
        const error = {
          code: 'auth/account-exists-with-different-credential',
        };

        expect(() => {
          handleFirebaseError(mockUi as any, error, { enableHandleExistingCredential: true });
        }).toThrow(FirebaseUIError);

        try {
          handleFirebaseError(mockUi as any, error, { enableHandleExistingCredential: true });
        } catch (e) {
          expect(window.sessionStorage.getItem('pendingCred')).toBeNull();
        }
      });

      it('should include email in error and use translations when provided', () => {
        const error = {
          code: 'auth/account-exists-with-different-credential',
          customData: { email: 'test@test.com' },
        };

        const customUi = {
          translations: {
            'es-ES': {
              errors: {
                accountExistsWithDifferentCredential: 'La cuenta ya existe con otras credenciales',
              },
            },
          },
          locale: 'es-ES',
        };

        expect(() => {
          handleFirebaseError(customUi as any, error, { enableHandleExistingCredential: true });
        }).toThrow(FirebaseUIError);

        try {
          handleFirebaseError(customUi as any, error, { enableHandleExistingCredential: true });
        } catch (e) {
          expect(e).toBeInstanceOf(FirebaseUIError);
          expect(e.code).toBe('auth/account-exists-with-different-credential');
          expect(e.message).toBe('La cuenta ya existe con otras credenciales');
        }
      });
    });
  });
});
