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
import { getTranslation } from '../../src/translations';
import { english } from '@firebase-ui/translations';

describe('getTranslation', () => {
  it('should return default English translation when no custom translations provided', () => {
    const mockUi = {
      translations: { 'en-US': english.translations },
      locale: 'en-US',
    };

    const translation = getTranslation(mockUi as any, 'errors', 'userNotFound');
    expect(translation).toBe('No account found with this email address');
  });

  it('should use custom translation when provided', () => {
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

    const translation = getTranslation(mockUi as any, 'errors', 'userNotFound');
    expect(translation).toBe('Usuario no encontrado');
  });

  it('should use custom translation in specified language', () => {
    const mockUi = {
      translations: {
        'es-ES': {
          errors: {
            userNotFound: 'Usuario no encontrado',
          },
        },
        'en-US': english.translations,
      },
      locale: 'es-ES',
    };

    const translation = getTranslation(mockUi as any, 'errors', 'userNotFound');
    expect(translation).toBe('Usuario no encontrado');
  });

  it('should fallback to English when specified language is not available', () => {
    const mockUi = {
      translations: {
        'en-US': english.translations,
      },
      locale: 'fr-FR',
    };

    const translation = getTranslation(mockUi as any, 'errors', 'userNotFound');
    expect(translation).toBe('No account found with this email address');
  });

  it('should fallback to default English when no custom translations match', () => {
    const mockUi = {
      translations: {
        'es-ES': {
          errors: {},
        },
      },
      locale: 'es-ES',
    };

    const translation = getTranslation(mockUi as any, 'errors', 'userNotFound');
    expect(translation).toBe('No account found with this email address');
  });

  it('should work with different translation categories', () => {
    const mockUi = {
      translations: {
        'en-US': english.translations,
      },
      locale: 'en-US',
    };

    const errorTranslation = getTranslation(mockUi as any, 'errors', 'userNotFound');
    const labelTranslation = getTranslation(mockUi as any, 'labels', 'signIn');

    expect(errorTranslation).toBe('No account found with this email address');
    expect(labelTranslation).toBe('Sign In');
  });

  it('should handle partial custom translations', () => {
    const mockUi = {
      translations: {
        'es-ES': {
          errors: {
            userNotFound: 'Usuario no encontrado',
          },
        },
        'en-US': english.translations,
      },
      locale: 'es-ES',
    };

    const translation1 = getTranslation(mockUi as any, 'errors', 'userNotFound');
    const translation2 = getTranslation(mockUi as any, 'errors', 'unknownError');

    expect(translation1).toBe('Usuario no encontrado');
    expect(translation2).toBe('An unexpected error occurred');
  });

  it('should handle empty custom translations object', () => {
    const mockUi = {
      translations: {},
      locale: 'en-US',
    };

    const translation = getTranslation(mockUi as any, 'errors', 'userNotFound');
    expect(translation).toBe('No account found with this email address');
  });

  it('should handle undefined custom translations', () => {
    const mockUi = {
      translations: undefined,
      locale: 'en-US',
    };

    const translation = getTranslation(mockUi as any, 'errors', 'userNotFound');
    expect(translation).toBe('No account found with this email address');
  });
});
