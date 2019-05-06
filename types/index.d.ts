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

declare namespace firebaseui { }

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
}


interface SamlSignInOption extends SignInOption {
  providerName?: string;
  buttonColor: string;
  iconUrl: string;
}


interface FederatedSignInOption extends SignInOption {
  authMethod?: string;
  clientId?: string;
  scopes?: string[];
  customParameters?: object;
}


interface OAuthSignInOption extends SignInOption {
  providerName?: string;
  buttonColor: string;
  iconUrl: string;
  scopes?: string[];
  customParameters?: object;
  loginHintKey?: string;
}


interface OidcSignInOption extends SignInOption {
  providerName?: string;
  buttonColor: string;
  iconUrl: string;
  customParameters?: object;
}


interface ActionCodeSettings {
  url: string;
  handleCodeInApp?: boolean;
  iOS?: {
    bundleId: string;
  };
  android?: {
    packageName: string;
    installApp?: boolean;
    minimumVersion?: string;
  };
  dynamicLinkDomain?: string;
}

interface EmailSignInOption extends SignInOption {
  forceSameDevice?: boolean;
  requireDisplayName?: boolean;
  signInMethod?: string;
  emailLinkSignIn?(): ActionCodeSettings;
}

interface PhoneSignInOption extends SignInOption {
  recaptchaParameters?: {
    type?: string;
    size?: string;
    badge?: string;
  };
  defaultCountry?: string;
  defaultNationalNumber?: string;
  loginHint?: string;
  whitelistedCountries?: string[];
  blacklistedCountries?: string[];
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
    signInOptions?:
        Array<string|FederatedSignInOption|EmailSignInOption|PhoneSignInOption|
              SamlSignInOption|OAuthSignInOption|OidcSignInOption>;
    signInSuccessUrl?: string;
    siteName?: string;
    tosUrl?: (() => void) | string;
    privacyPolicyUrl?: (() => void) | string;
    widgetUrl?: string;
  }

  class AuthUI {
    static getInstance(appId?: string): AuthUI | null;
    // tslint:disable-next-line:no-any firebase dependency not available.
    constructor(auth: any, appId?: string);
    disableAutoSignIn(): void;
    start(element: string | Element, config: firebaseui.auth.Config): void;
    setConfig(config: firebaseui.auth.Config): void;
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

  class AnonymousAuthProvider {
    private constructor();
    static PROVIDER_ID: string;
  }
}

export = firebaseui;
