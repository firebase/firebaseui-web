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

import { Component, computed, inject, input, signal } from "@angular/core";
import { Router } from "@angular/router";
import { GoogleAuthProvider } from "firebase/auth";
import {
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithProvider,
} from "@firebase-oss/ui-core";
import { injectEmailLinkAuthFormSchema, injectUI } from "@firebase-oss/ui-angular";

import { contents, GoogleLogoComponent, injectAuthTask } from "../components";
import { DemoState, paths } from "../state";
import { createAccount } from "../steps/sign-in";
import {
  ProButtonComponent,
  ProDialogComponent,
  ProErrorComponent,
  ProFieldComponent,
  ProHeaderComponent,
  ProLegalComponent,
  ProPageComponent,
} from "./kit";

function injectValidEmail(state: DemoState) {
  const schema = injectEmailLinkAuthFormSchema();
  return computed(() => schema().safeParse({ email: state.email() }).success);
}

/** Providers first, then email and password on the same screen; there is no email-first step. */
@Component({
  selector: "fc-pro-sign-in",
  imports: [
    ProPageComponent,
    ProButtonComponent,
    ProFieldComponent,
    ProErrorComponent,
    ProLegalComponent,
    ProDialogComponent,
    GoogleLogoComponent,
  ],
  host: contents,
  template: `
    <fc-pro-page
      [brand]="true"
      title="Sign in to your account"
      subtitle="Welcome back. Choose how you'd like to continue."
    >
      <div class="pro-stack pro-stack--tight">
        <button proBtn variant="outline" (click)="google()" [disabled]="busy()">
          <fc-google-logo />
          Continue with Google
        </button>
        <button proBtn variant="outline" (click)="router.navigateByUrl(paths.phone)" [disabled]="busy()">
          <span class="fc-icon pro-sym" aria-hidden="true">phone</span>
          Continue with phone
        </button>
        <button proBtn variant="outline" (click)="moreOpen.set(true)" [disabled]="busy()">
          <span class="fc-icon pro-sym" aria-hidden="true">more_horiz</span>
          More sign-in options
        </button>
      </div>
      <div class="pro-divider">or continue with email</div>
      <form class="pro-stack" (submit)="$event.preventDefault(); signIn()">
        <fc-pro-field
          label="Email"
          type="email"
          autocomplete="email"
          placeholderText="name@company.com"
          [(value)]="state.email"
        />
        <fc-pro-field
          label="Password"
          type="password"
          autocomplete="current-password"
          placeholderText="Enter your password"
          action="Forgot password?"
          (actionClick)="router.navigateByUrl(paths.resetPassword)"
          [(value)]="password"
        />
        <fc-pro-error [message]="task.error() ?? state.linkError()" />
        <button proBtn type="submit" [disabled]="!validEmail() || !password()" [loading]="task.pending()">
          Sign in
        </button>
      </form>
      <button proBtn variant="text" (click)="router.navigateByUrl(paths.emailLink)">Email me a sign-in link</button>
      <p class="pro-prompt">
        Don't have an account?
        <button type="button" (click)="router.navigateByUrl(paths.signUp)">Create account</button>
      </p>

      @if (moreOpen()) {
        <fc-pro-dialog
          title="Other sign in methods"
          subtitle="Try the demo without creating an account."
          [lightDismiss]="true"
          (closed)="moreOpen.set(false)"
        >
          <div class="pro-stack pro-stack--tight">
            <button proBtn variant="outline" (click)="guest()">
              <span class="fc-icon pro-sym" aria-hidden="true">person</span>
              Continue as guest
            </button>
            <button proBtn variant="text" (click)="moreOpen.set(false)">Cancel</button>
          </div>
        </fc-pro-dialog>
      }
      <fc-pro-legal proFooter lead="By continuing, you agree to the" />
    </fc-pro-page>
  `,
})
export class ProSignInComponent {
  private ui = injectUI();
  protected router = inject(Router);
  protected state = inject(DemoState);
  protected paths = paths;
  protected password = signal("");
  protected moreOpen = signal(false);
  protected validEmail = injectValidEmail(this.state);
  protected busy = computed(() => this.ui().state !== "idle");
  protected task = injectAuthTask();

  signIn() {
    void this.task.run(() => signInWithEmailAndPassword(this.ui(), this.state.email(), this.password()));
  }

  google() {
    void this.task.run(() => signInWithProvider(this.ui(), new GoogleAuthProvider()));
  }

  guest() {
    this.moreOpen.set(false);
    void this.task.run(() => signInAnonymously(this.ui()));
  }
}

@Component({
  selector: "fc-pro-sign-up",
  imports: [ProPageComponent, ProButtonComponent, ProFieldComponent, ProErrorComponent, ProLegalComponent],
  host: contents,
  template: `
    <fc-pro-page
      [back]="true"
      (backClick)="router.navigateByUrl(paths.email)"
      title="Create your account"
      subtitle="Sign up with your email. It takes less than a minute."
    >
      <form class="pro-stack" (submit)="$event.preventDefault(); signUp()">
        <fc-pro-field label="Name" autocomplete="name" placeholderText="Jane Doe" [(value)]="name" />
        <fc-pro-field
          label="Email"
          type="email"
          autocomplete="email"
          placeholderText="name@company.com"
          [(value)]="state.email"
        />
        <fc-pro-field
          label="Password"
          type="password"
          autocomplete="new-password"
          placeholderText="Create a password"
          [(value)]="password"
        />
        <fc-pro-field
          label="Confirm password"
          type="password"
          autocomplete="new-password"
          placeholderText="Repeat your password"
          [invalid]="mismatch()"
          [hint]="mismatch() ? 'Passwords don\\'t match' : undefined"
          [(value)]="confirmPassword"
        />
        <fc-pro-error [message]="task.error()" />
        <button proBtn type="submit" [disabled]="!complete()" [loading]="task.pending()">Create account</button>
      </form>
      <p class="pro-prompt">
        Already have an account?
        <button type="button" (click)="router.navigateByUrl(paths.email)">Sign in</button>
      </p>
      <fc-pro-legal proFooter lead="By creating an account, you agree to the" />
    </fc-pro-page>
  `,
})
export class ProSignUpComponent {
  private ui = injectUI();
  protected router = inject(Router);
  protected state = inject(DemoState);
  protected paths = paths;
  protected name = signal("");
  protected password = signal("");
  protected confirmPassword = signal("");
  protected validEmail = injectValidEmail(this.state);
  protected task = injectAuthTask();
  protected mismatch = computed(() => this.confirmPassword().length > 0 && this.password() !== this.confirmPassword());
  protected complete = computed(
    () =>
      Boolean(this.name().trim() && this.validEmail() && this.password()) && this.password() === this.confirmPassword()
  );

  signUp() {
    void this.task.run(() => createAccount(this.ui, this.state, this.password(), this.name().trim()));
  }
}

/** The password reset and email link screens: an email field, then a "check your inbox" page. */
@Component({
  selector: "fc-pro-send-link",
  imports: [ProPageComponent, ProHeaderComponent, ProButtonComponent, ProFieldComponent, ProErrorComponent],
  host: contents,
  template: `
    @if (sent()) {
      <main class="pro-page">
        <fc-pro-header icon="drafts" title="Check your inbox" [subtitle]="sentSubtitle()" />
        <div class="pro-content">
          @if (kind() === "reset") {
            <button proBtn (click)="router.navigateByUrl(paths.email)">Back to sign in</button>
          } @else {
            <button proBtn variant="text" (click)="sent.set(false)">Use a different email</button>
          }
        </div>
      </main>
    } @else {
      <fc-pro-page
        [back]="true"
        (backClick)="router.navigateByUrl(paths.email)"
        [icon]="kind() === 'reset' ? 'lock' : 'mail'"
        [title]="kind() === 'reset' ? 'Reset your password' : 'Sign in with a link'"
        [subtitle]="
          kind() === 'reset'
            ? 'Enter the email you sign in with and we\\'ll send you a link to choose a new password.'
            : 'We\\'ll email you a link that signs you in, no password needed.'
        "
      >
        <form class="pro-stack" (submit)="$event.preventDefault(); send()">
          <fc-pro-field
            label="Email"
            type="email"
            autocomplete="email"
            placeholderText="name@company.com"
            [(value)]="state.email"
          />
          <fc-pro-error [message]="task.error() ?? (kind() === 'link' ? state.linkError() : null)" />
          <button proBtn type="submit" [disabled]="!validEmail()" [loading]="task.pending()">
            {{ kind() === "reset" ? "Send reset link" : "Send link" }}
          </button>
        </form>
      </fc-pro-page>
    }
  `,
})
export class ProSendLinkComponent {
  private ui = injectUI();
  protected router = inject(Router);
  protected state = inject(DemoState);
  protected paths = paths;
  protected sent = signal(false);
  protected validEmail = injectValidEmail(this.state);
  protected task = injectAuthTask();

  kind = input.required<"reset" | "link">();
  protected sentSubtitle = computed(() =>
    this.kind() === "reset"
      ? `We sent a link to reset your password to ${this.state.email()}.`
      : `We sent a sign-in link to ${this.state.email()}. Open it on this device to finish signing in.`
  );

  send() {
    const email = this.state.email();
    void this.task.run(async () => {
      await (this.kind() === "reset"
        ? sendPasswordResetEmail(this.ui(), email)
        : sendSignInLinkToEmail(this.ui(), email));
      this.sent.set(true);
    });
  }
}
