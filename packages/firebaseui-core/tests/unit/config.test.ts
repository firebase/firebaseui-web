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
import { initializeUI, $config } from '../../src/config';
import { english } from '@firebase-ui/translations';
import { onAuthStateChanged } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

describe('Config', () => {
  describe('initializeUI', () => {
    it('should initialize config with default name', () => {
      const config = {
        app: {
          name: 'test',
          options: {},
          automaticDataCollectionEnabled: false,
        },
      };

      const store = initializeUI(config);
      expect(store.get()).toEqual({
        app: config.app,
        getAuth: expect.any(Function),
        locale: 'en-US',
        setLocale: expect.any(Function),
        state: 'idle',
        setState: expect.any(Function),
        translations: {
          'en-US': english.translations,
        },
        behaviors: {},
        recaptchaMode: 'normal',
      });
      expect($config.get()['[DEFAULT]']).toBe(store);
    });

    it('should initialize config with custom name', () => {
      const config = {
        app: {
          name: 'test',
          options: {},
          automaticDataCollectionEnabled: false,
        },
      };

      const store = initializeUI(config, 'custom');
      expect(store.get()).toEqual({
        app: config.app,
        getAuth: expect.any(Function),
        locale: 'en-US',
        setLocale: expect.any(Function),
        state: 'idle',
        setState: expect.any(Function),
        translations: {
          'en-US': english.translations,
        },
        behaviors: {},
        recaptchaMode: 'normal',
      });
      expect($config.get()['custom']).toBe(store);
    });

    it('should setup auto anonymous login when enabled', () => {
      const config = {
        app: {
          name: 'test',
          options: {},
          automaticDataCollectionEnabled: false,
        },
        behaviors: [
          {
            autoAnonymousLogin: vi.fn().mockImplementation(async (ui) => {
              ui.setState('idle');
              return {};
            }),
          },
        ],
      };

      const store = initializeUI(config);
      expect(store.get().behaviors.autoAnonymousLogin).toBeDefined();
      expect(store.get().behaviors.autoAnonymousLogin).toHaveBeenCalled();
      expect(store.get().state).toBe('idle');
    });

    it('should not setup auto anonymous login when disabled', () => {
      const config = {
        app: {
          name: 'test',
          options: {},
          automaticDataCollectionEnabled: false,
        },
      };

      const store = initializeUI(config);
      expect(store.get().behaviors.autoAnonymousLogin).toBeUndefined();
    });

    it('should handle both auto features being enabled', () => {
      const config = {
        app: {
          name: 'test',
          options: {},
          automaticDataCollectionEnabled: false,
        },
        behaviors: [
          {
            autoAnonymousLogin: vi.fn().mockImplementation(async (ui) => {
              ui.setState('idle');
              return {};
            }),
            autoUpgradeAnonymousCredential: vi.fn(),
          },
        ],
      };

      const store = initializeUI(config);
      expect(store.get()).toEqual({
        app: config.app,
        getAuth: expect.any(Function),
        locale: 'en-US',
        setLocale: expect.any(Function),
        state: 'idle',
        setState: expect.any(Function),
        translations: {
          'en-US': english.translations,
        },
        behaviors: {
          autoAnonymousLogin: expect.any(Function),
          autoUpgradeAnonymousCredential: expect.any(Function),
        },
        recaptchaMode: 'normal',
      });
      expect(store.get().behaviors.autoAnonymousLogin).toHaveBeenCalled();
    });
  });
});
