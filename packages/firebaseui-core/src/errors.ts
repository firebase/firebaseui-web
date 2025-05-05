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

import {
  english,
  ERROR_CODE_MAP,
  ErrorCode,
  getTranslation,
  Locale,
  TranslationsConfig,
} from '@firebase-ui/translations';
import { FirebaseUIConfiguration } from './config';
export class FirebaseUIError extends Error {
  code: string;

  constructor(error: any, translations?: TranslationsConfig, locale?: Locale) {
    const errorCode: ErrorCode = error?.customData?.message?.match?.(/\(([^)]+)\)/)?.at(1) || error?.code || 'unknown';
    const translationKey = ERROR_CODE_MAP[errorCode] || 'unknownError';
    const message = getTranslation('errors', translationKey, translations, locale ?? english.locale);

    super(message);
    this.name = 'FirebaseUIError';
    this.code = errorCode;
  }
}

export function handleFirebaseError(
  ui: FirebaseUIConfiguration,
  error: any,
  opts?: {
    enableHandleExistingCredential?: boolean;
  }
): never {
  const { translations, locale: defaultLocale } = ui;
  if (error?.code === 'auth/account-exists-with-different-credential') {
    if (opts?.enableHandleExistingCredential && error.credential) {
      window.sessionStorage.setItem('pendingCred', JSON.stringify(error.credential));
    } else {
      window.sessionStorage.removeItem('pendingCred');
    }

    throw new FirebaseUIError(
      {
        code: 'auth/account-exists-with-different-credential',
        customData: {
          email: error.customData?.email,
        },
      },
      translations,
      defaultLocale
    );
  }

  // TODO: Debug why instanceof FirebaseError is not working
  if (error?.name === 'FirebaseError') {
    throw new FirebaseUIError(error, translations, defaultLocale);
  }
  throw new FirebaseUIError({ code: 'unknown' }, translations, defaultLocale);
}
