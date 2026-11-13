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

import { Component, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { GoogleAuthProvider, updateProfile } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithProvider,
} from "@firebase-oss/ui-core";
import { injectEmailLinkAuthFormSchema, injectUI } from "@firebase-oss/ui-angular";

import {
  ButtonComponent,
  contents,
  injectAuthTask,
  PageComponent,
  ProviderButtonComponent,
  TextFieldComponent,
  TextLinkComponent,
} from "../components";
import { DemoState, paths } from "../state";

/** The landing screen from the web Figma frames: one email field, then the chosen next step. */
@Component({
  selector: "fc-email-entry",
  imports: [PageComponent, TextFieldComponent, ButtonComponent, ProviderButtonComponent],
  host: contents,
  template: `
    <fc-page title="Hey there, Welcome" prompt="Enter your email address to continue.">
      <form class="fc-form" (submit)="$event.preventDefault(); next()">
        <div
          fcField
          icon="alternate_email"
          type="email"
          autocomplete="email"
          placeholderText="Email address"
          [(value)]="state.email"
        ></div>
        <div class="fc-actions">
          <button fcButton type="submit" [disabled]="!validEmail()">Continue</button>
          <button fcButton variant="secondary" (click)="router.navigateByUrl(paths.signUp)">Create account</button>
        </div>
      </form>
      <footer fcFooter class="fc-footer">
        <p class="fc-footer__label">Other sign in methods</p>
        <div class="fc-providers">
          <button fcProvider provider="google" (click)="google()" [disabled]="busy()">Sign in with Google</button>
          <button fcProvider provider="phone" (click)="router.navigateByUrl(paths.phone)" [disabled]="busy()">
            Sign in with phone
          </button>
          <button fcProvider provider="guest" (click)="guest()" [disabled]="busy()">Sign in as a guest</button>
        </div>
        @if (task.error(); as error) {
          <p class="fc-error" role="alert">{{ error }}</p>
        }
      </footer>
    </fc-page>
  `,
})
export class EmailEntryStepComponent {
  private ui = injectUI();
  protected router = inject(Router);
  protected state = inject(DemoState);
  protected paths = paths;
  private schema = injectEmailLinkAuthFormSchema();
  protected validEmail = computed(() => this.schema().safeParse({ email: this.state.email() }).success);
  protected busy = computed(() => this.ui().state !== "idle");
  protected task = injectAuthTask();

  next() {
    if (this.validEmail()) void this.router.navigateByUrl(paths.login);
  }

  google() {
    void this.task.run(() => signInWithProvider(this.ui(), new GoogleAuthProvider()));
  }

  guest() {
    void this.task.run(() => signInAnonymously(this.ui()));
  }
}

/**
 * Password sign in, with the password reset and email link modes inline, as in the Android demo.
 * Signing in is picked up by the demo root, which moves to the account page or the MFA challenge.
 */
@Component({
  selector: "fc-login",
  imports: [PageComponent, TextFieldComponent, ButtonComponent, TextLinkComponent],
  host: contents,
  template: `
    <fc-page title="Login" prompt="Enter your password to continue.">
      <form class="fc-form" (submit)="$event.preventDefault(); signIn()">
        <div
          fcField
          icon="alternate_email"
          type="email"
          autocomplete="email"
          placeholderText="Email address"
          [disabled]="emailLocked"
          [(value)]="state.email"
        ></div>
        <div
          fcField
          icon="lock"
          type="password"
          autocomplete="current-password"
          placeholderText="Password"
          [(value)]="password"
        ></div>
        <div class="fc-links">
          <button fcLink [disabled]="resetSent()" (click)="withEmail(sendReset)">
            {{ resetSent() ? "Reset link sent!" : "Forgot password?" }}
          </button>
          <button fcLink (click)="router.navigateByUrl(paths.email)">Use a different email</button>
        </div>
        @if (task.error() ?? state.linkError(); as error) {
          <p class="fc-error" role="alert">{{ error }}</p>
        }
        <div class="fc-actions">
          <button fcButton type="submit" [disabled]="!password() || !state.email()" [loading]="task.pending()">
            Login
          </button>
          <button fcButton variant="secondary" [disabled]="linkSent()" (click)="withEmail(sendLink)">
            {{ linkSent() ? "Login link sent!" : "Send login link" }}
          </button>
        </div>
      </form>
    </fc-page>
  `,
})
export class LoginStepComponent {
  private ui = injectUI();
  protected router = inject(Router);
  protected state = inject(DemoState);
  protected paths = paths;
  private schema = injectEmailLinkAuthFormSchema();
  protected task = injectAuthTask();
  // Arriving here without an address (a refresh or a direct visit) makes the field editable.
  protected emailLocked = this.state.email().length > 0;
  protected password = signal("");
  protected resetSent = signal(false);
  protected linkSent = signal(false);

  protected sendReset = () =>
    sendPasswordResetEmail(this.ui(), this.state.email()).then(() => this.resetSent.set(true));
  protected sendLink = () => sendSignInLinkToEmail(this.ui(), this.state.email()).then(() => this.linkSent.set(true));

  signIn() {
    void this.task.run(() => signInWithEmailAndPassword(this.ui(), this.state.email(), this.password()));
  }

  /** Both links need an address. Rather than disabling them silently, say what is missing. */
  withEmail(send: () => Promise<void>) {
    const result = this.schema().safeParse({ email: this.state.email() });
    if (!result.success) {
      this.task.error.set(result.error.issues[0]?.message ?? null);
      return;
    }
    void this.task.run(send);
  }
}

@Component({
  selector: "fc-sign-up",
  imports: [PageComponent, TextFieldComponent, ButtonComponent, TextLinkComponent],
  host: contents,
  template: `
    <fc-page title="Sign up" prompt="Create an account to continue.">
      <form class="fc-form" (submit)="$event.preventDefault(); signUp()">
        <div class="fc-row">
          <div fcField autocomplete="given-name" placeholderText="First name" [(value)]="firstName"></div>
          <div fcField autocomplete="family-name" placeholderText="Last name" [(value)]="lastName"></div>
        </div>
        <div
          fcField
          icon="alternate_email"
          type="email"
          autocomplete="email"
          placeholderText="Email address"
          [(value)]="state.email"
        ></div>
        <div
          fcField
          icon="lock"
          type="password"
          autocomplete="new-password"
          placeholderText="Password"
          [(value)]="password"
        ></div>
        <div
          fcField
          icon="lock"
          type="password"
          autocomplete="new-password"
          placeholderText="Confirm password"
          [invalid]="mismatch()"
          [describedBy]="mismatch() ? 'fc-sign-up-mismatch' : undefined"
          [(value)]="confirmPassword"
        ></div>
        @if (mismatch()) {
          <p id="fc-sign-up-mismatch" class="fc-error" role="alert">Passwords don't match</p>
        } @else if (task.error(); as error) {
          <p class="fc-error" role="alert">{{ error }}</p>
        }
        <div class="fc-links">
          <button fcLink (click)="router.navigateByUrl(paths.login)">Already have an account?</button>
          <button fcLink (click)="router.navigateByUrl(paths.email)">Use a different email</button>
        </div>
        <div class="fc-actions">
          <button fcButton type="submit" [disabled]="!complete()" [loading]="task.pending()">Sign up</button>
        </div>
      </form>
    </fc-page>
  `,
})
export class SignUpStepComponent {
  private ui = injectUI();
  protected router = inject(Router);
  protected state = inject(DemoState);
  protected paths = paths;
  protected task = injectAuthTask();
  protected firstName = signal("");
  protected lastName = signal("");
  protected password = signal("");
  protected confirmPassword = signal("");

  protected mismatch = computed(() => this.confirmPassword().length > 0 && this.password() !== this.confirmPassword());
  protected complete = computed(
    () =>
      Boolean(this.firstName().trim() && this.lastName().trim() && this.state.email() && this.password()) &&
      this.password() === this.confirmPassword()
  );

  signUp() {
    const displayName = `${this.firstName().trim()} ${this.lastName().trim()}`;
    void this.task.run(() => createAccount(this.ui, this.state, this.password(), displayName));
  }
}

/** Creates the account and saves the name, shared with the Professional sign up screen. */
export async function createAccount(
  ui: ReturnType<typeof injectUI>,
  state: DemoState,
  password: string,
  displayName: string
) {
  const credential = await createUserWithEmailAndPassword(ui(), state.email(), password, displayName);
  if (!credential) return;
  // Core only saves the name when the requireDisplayName behavior is configured, which this example doesn't use.
  await updateProfile(credential.user, { displayName });
  // The id token listener already ran on sign in, before the name was saved, so show the name now.
  state.refreshUser();
}
