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

import { Component, computed, DestroyRef, Directive, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter, map } from "rxjs";
import { onIdTokenChanged } from "firebase/auth";
import { completeEmailLinkSignIn } from "@firebase-oss/ui-core";
import { injectUI } from "@firebase-oss/ui-angular";

import { ProAccountComponent } from "./professional/account";
import { ProMfaChallengeComponent } from "./professional/mfa-challenge";
import { ProMfaEnrollmentComponent } from "./professional/mfa-enrollment";
import { ProPhoneComponent } from "./professional/phone";
import { ProSendLinkComponent, ProSignInComponent, ProSignUpComponent } from "./professional/sign-in";
import { Reauth } from "./reauth";
import { ReauthDialogComponent } from "./reauth-dialog";
import { BASE, DemoState, paths, themes } from "./state";
import { AccountStepComponent } from "./steps/account";
import { MfaChallengeComponent } from "./steps/mfa-challenge";
import { MfaEnrollmentStepComponent } from "./steps/mfa-enrollment";
import { PhoneStepComponent } from "./steps/phone";
import { EmailEntryStepComponent, LoginStepComponent, SignUpStepComponent } from "./steps/sign-in";

/** The screens, by their path under /full-customization, and whether they need a signed-in user. */
const screens = {
  "": "signed-out",
  login: "signed-out",
  "sign-up": "signed-out",
  phone: "signed-out",
  "reset-password": "signed-out",
  "email-link": "signed-out",
  account: "signed-in",
  "account/two-factor": "signed-in",
} as const;

type Screen = keyof typeof screens;

/**
 * Owns the sign-in resolver while the challenge is shown. It sits around both themes' challenge
 * screens, so switching theme mid-challenge swaps the screen without cancelling the sign in.
 */
@Directive({ selector: "[fcResolverCleanup]" })
export class ResolverCleanupDirective {
  constructor() {
    const ui = injectUI();
    inject(DestroyRef).onDestroy(() => ui().setMultiFactorResolver());
  }
}

/** The demo CSS is a separate, lazily loaded bundle (see angular.json), so it only applies here. */
let stylesheet: Promise<void> | undefined;

function loadStylesheet(): Promise<void> {
  stylesheet ??= new Promise((resolve) => {
    const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href: "full-customization.css" });
    link.onload = () => resolve();
    // Show the demo unstyled rather than not at all if the stylesheet fails; the next visit tries again.
    link.onerror = () => {
      link.remove();
      stylesheet = undefined;
      resolve();
    };
    document.head.append(link);
  });
  return stylesheet;
}

/**
 * A complete sign in flow with its own UI, where FirebaseUI supplies only the auth logic: the
 * ui-angular injectables and the ui-core functions. Sign in state drives the routing: a signed-in
 * user is sent to the account page, and a pending multi-factor challenge takes over whichever
 * screen raised it.
 */
@Component({
  selector: "fc-full-customization",
  imports: [
    RouterLink,
    ResolverCleanupDirective,
    ReauthDialogComponent,
    EmailEntryStepComponent,
    LoginStepComponent,
    SignUpStepComponent,
    PhoneStepComponent,
    AccountStepComponent,
    MfaEnrollmentStepComponent,
    MfaChallengeComponent,
    ProSignInComponent,
    ProSignUpComponent,
    ProSendLinkComponent,
    ProPhoneComponent,
    ProAccountComponent,
    ProMfaEnrollmentComponent,
    ProMfaChallengeComponent,
  ],
  providers: [DemoState, Reauth],
  template: `
    @if (ready()) {
      <div class="fc-root" [attr.data-theme]="state.theme()">
        <!-- Background art, placed with the offsets of the matching layer in each Figma frame. -->
        <div class="fc-art" aria-hidden="true">
          @switch (state.theme()) {
            @case ("doggo") {
              <img
                src="full-customization-assets/doggo-pattern.svg"
                alt=""
                style="left: -16px; top: -1505px; width: 2366px; height: 2391px"
              />
            }
            @case ("grid") {
              <img
                src="full-customization-assets/grid-pattern.svg"
                alt=""
                style="left: 96px; top: -336px; width: 1585px; height: 1585px"
              />
            }
            @case ("spark") {
              <img
                src="full-customization-assets/spark-blob.webp"
                alt=""
                style="left: 160px; top: -259px; width: 1122px; height: 1096px"
              />
            }
          }
        </div>
        <a class="fc-exit" routerLink="/" aria-label="All examples">
          <span class="fc-icon" aria-hidden="true">arrow_back</span>
          <span class="fc-exit__label">All examples</span>
        </a>
        <div class="fc-theme-switcher" role="group" aria-label="Theme">
          <span class="fc-icon" aria-hidden="true">palette</span>
          @for (theme of themes; track theme.id) {
            <button type="button" [attr.aria-pressed]="state.theme() === theme.id" (click)="state.setTheme(theme.id)">
              {{ theme.label }}
            </button>
          }
        </div>

        <!-- A signed-in user with a resolver is reauthenticating; the reauth dialog completes that one. -->
        @if (challenge()) {
          <ng-container fcResolverCleanup>
            @if (pro()) {
              <fc-pro-mfa-challenge (cancelled)="clearResolver()" />
            } @else {
              <fc-mfa-challenge (cancelled)="clearResolver()" />
            }
          </ng-container>
        } @else {
          @switch (screen()) {
            @case ("") {
              @if (pro()) {
                <fc-pro-sign-in />
              } @else {
                <fc-email-entry />
              }
            }
            @case ("login") {
              @if (pro()) {
                <fc-pro-sign-in />
              } @else {
                <fc-login />
              }
            }
            @case ("sign-up") {
              @if (pro()) {
                <fc-pro-sign-up />
              } @else {
                <fc-sign-up />
              }
            }
            @case ("phone") {
              @if (pro()) {
                <fc-pro-phone />
              } @else {
                <fc-phone />
              }
            }
            @case ("reset-password") {
              @if (pro()) {
                <fc-pro-send-link kind="reset" />
              } @else {
                <fc-login />
              }
            }
            @case ("email-link") {
              @if (pro()) {
                <fc-pro-send-link kind="link" />
              } @else {
                <fc-login />
              }
            }
            @case ("account") {
              @if (pro()) {
                <fc-pro-account />
              } @else {
                <fc-account />
              }
            }
            @case ("account/two-factor") {
              @if (pro()) {
                <fc-pro-mfa-enrollment />
              } @else {
                <fc-mfa-enrollment />
              }
            }
          }
        }

        @if (reauth.pending(); as pending) {
          <fc-reauth-dialog [reason]="pending.reason" />
        }
      </div>
    }
  `,
})
export class FullCustomizationComponent {
  private ui = injectUI();
  private router = inject(Router);
  protected state = inject(DemoState);
  protected reauth = inject(Reauth);
  protected themes = themes;
  protected pro = computed(() => this.state.theme() === "professional");

  private authReady = signal(false);
  private styled = signal(false);
  protected ready = computed(() => this.authReady() && this.styled());

  private url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );
  /** The path under /full-customization, without the query string or a trailing slash. */
  private path = computed(() =>
    this.url()
      .split(/[?#]/)[0]!
      .slice(BASE.length)
      .replace(/^\/|\/$/g, "")
  );

  protected challenge = computed(() => Boolean(this.ui().multiFactorResolver) && !this.state.user());

  /** The screen to show, or null while a redirect is on its way. */
  protected screen = computed<Screen | null>(() => {
    const path = this.path();
    if (!(path in screens)) return null;
    const access = screens[path as Screen];
    const signedIn = Boolean(this.state.user());
    if (access === "signed-out" && signedIn) return null;
    if (access === "signed-in" && !signedIn) return null;
    return path as Screen;
  });

  constructor() {
    void loadStylesheet().then(() => this.styled.set(true));

    const auth = this.ui().auth;
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      this.state.user.set(user);
      this.authReady.set(true);
    });
    inject(DestroyRef).onDestroy(unsubscribe);

    // Completes sign in when the page is opened from a link sent by "Send login link", and shows an
    // expired or used link on the login screen.
    completeEmailLinkSignIn(this.ui(), window.location.href).catch((error) =>
      this.state.linkError.set(error instanceof Error ? error.message : String(error))
    );

    // Unknown paths go to the first screen; a signed-in user goes to the account page and a signed-out one leaves it.
    effect(() => {
      if (!this.authReady() || this.challenge() || this.screen() !== null) return;
      const path = this.path();
      const target = path in screens && this.state.user() ? paths.account : paths.email;
      void this.router.navigateByUrl(target, { replaceUrl: true });
    });
  }

  clearResolver() {
    this.ui().setMultiFactorResolver();
  }
}
