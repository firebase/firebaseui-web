/*
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

declare namespace firebaseui {}

export as namespace firebaseui;

type CredentialHelperType = string;

interface Callbacks {
  signInSuccessWithAuthResult?(
    // tslint:disable-next-line:no-any firebase dependency not available.
    authResult: any,
    redirectUrl?: string
  ): boolean;
  signInFailure?(error: firebaseui.auth.AuthUIError): Promise<void>;
  uiShown?(): void;
}

interface SignInOption {
  provider: string;
  authMethod?: string;
  clientId?: string;
  scopes?: string[];
  customParameters?: object;
  requireDisplayName?: boolean;
  recaptchaParameters?: {
    type?: string;
    size?: string;
    badge?: string;
  };
  defaultCountry?: string;
  defaultNationalNumber?: string;
  loginHint?: string;
}

declare namespace firebaseui.auth {
  interface Config {
    acUiConfig?: object;
    autoUpgradeAnonymousUsers?: boolean;
    callbacks?: Callbacks;
    credentialHelper?: CredentialHelperType;
    popupMode?: boolean;
    queryParameterForSignInSuccessUrl?: string;
    queryParameterForWidgetMode?: string;
    signInFlow?: string;
    signInOptions?: Array<string | SignInOption>;
    signInSuccessUrl?: string;
    siteName?: string;
    tosUrl?: string;
    widgetUrl?: string;
  }

  class AuthUI {
    static getInstance(appId?: string): AuthUI | null;
    // tslint:disable-next-line:no-any firebase dependency not available.
    constructor(auth: any, appId?: string);
    disableAutoSignIn(): void;
    start(element: string | Element, config: firebaseui.auth.Config);
    setConfig(config: firebaseui.auth.Config);
    signIn(): void;
    reset(): void;
    delete(): Promise<void>;
    isPendingRedirect(): boolean;
  }

  class AuthUIError {
    private constructor();
    code: string;
    message: string;
    // tslint:disable-next-line:no-any firebase dependency not available.
    credential: any | null;
    toJSON(): object;
  }

  class CredentialHelper {
    private constructor();
    static ACCOUNT_CHOOSER_COM: CredentialHelperType;
    static GOOGLE_YOLO: CredentialHelperType;
    static NONE: CredentialHelperType;
  }
}

export = firebaseui;
