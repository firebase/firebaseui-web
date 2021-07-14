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
  signInFailure?(error: firebaseui.auth.AuthUIError): Promise<void>|void;
  uiShown?(): void;
}

interface SignInOption {
  provider: string;
  providerName?: string;
  fullLabel?: string;
  buttonColor?: string;
  iconUrl?: string;
  hd?: string|RegExp;
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

interface DisableSignUpConfig {
  status: boolean;
  adminEmail?: string;
  helpLink?: string;
}

interface EmailSignInOption extends SignInOption {
  forceSameDevice?: boolean;
  requireDisplayName?: boolean;
  signInMethod?: string;
  emailLinkSignIn?(): ActionCodeSettings;
  disableSignUp?: DisableSignUpConfig;
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
    // This is now a no-op and is deprecated and will be removed by Jan 31st,
    // 2021.
    acUiConfig?: object;
    autoUpgradeAnonymousUsers?: boolean;
    callbacks?: Callbacks;
    credentialHelper?: CredentialHelperType;
    immediateFederatedRedirect?: boolean;
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
    adminRestrictedOperation?: DisableSignUpConfig;
  }

  interface TenantConfig extends firebaseui.auth.Config {
    fullLabel?: string;
    displayName?: string;
    buttonColor?: string;
    iconUrl?: string;
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
    // `ACCOUNT_CHOOSER_COM` is deprecated and will be removed by Jan 31st,
    // 2021.
    static ACCOUNT_CHOOSER_COM: CredentialHelperType;
    static GOOGLE_YOLO: CredentialHelperType;
    static NONE: CredentialHelperType;
  }

  class AnonymousAuthProvider {
    private constructor();
    static PROVIDER_ID: string;
  }

  interface ProjectConfig {
    projectId: string;
    apiKey: string;
  }

  interface SelectedTenantInfo {
    email?: string;
    tenantId: string|null;
    providerIds: string[];
  }

  interface CIAPCallbacks {
    signInUiShown?(tenantId: string|null): void;
    selectTenantUiShown?(): void;
    selectTenantUiHidden?(): void;
    // tslint:disable-next-line:no-any firebase dependency not available.
    beforeSignInSuccess?(currentUser: any): Promise<any>;
  }

  interface CIAPError {
    httpErrorCode?: number;
    code: string;
    message: string;
    reason?: Error;
    retry?(): Promise<void>;
    toJSON(): object;
  }

  interface CIAPHandlerConfig {
    authDomain: string;
    displayMode?: string;
    tosUrl?: (() => void)|string;
    privacyPolicyUrl?: (() => void)|string;
    callbacks?: firebaseui.auth.CIAPCallbacks;
    tenants: {[key: string]: firebaseui.auth.TenantConfig};
  }

  class FirebaseUiHandler {
    constructor(
        element: Element|string,
        configs: {[key: string]: firebaseui.auth.CIAPHandlerConfig});
    selectTenant(
        projectConfig: firebaseui.auth.ProjectConfig,
        tenantIds: string[]): Promise<firebaseui.auth.SelectedTenantInfo>;
    // tslint:disable-next-line:no-any firebase dependency not available.
    getAuth(apiKey: string, tenantId: string|null): any;
    // tslint:disable-next-line:no-any firebase dependency not available.
    startSignIn(auth: any, tenantInfo?: firebaseui.auth.SelectedTenantInfo):
        Promise<any>;  // tslint:disable-line
    reset(): Promise<void>;
    completeSignOut(): Promise<void>;
    showProgressBar(): void;
    hideProgressBar(): void;
    handleError(error: Error|firebaseui.auth.CIAPError): void;
    languageCode: string | null;
    // tslint:disable-next-line:no-any firebase dependency not available.
    processUser(user: any): Promise<any>;
  }
}

export = firebaseui;
