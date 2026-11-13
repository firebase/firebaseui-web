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
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from "@angular/core";
import { FirebaseError } from "firebase/app";
import { FirebaseUIError, type CountryData, type FirebaseUI } from "@firebase-oss/ui-core";
import { injectCountries, injectRecaptchaVerifier, injectUI } from "@firebase-oss/ui-angular";

/**
 * Host style for the components that only group markup. The demo CSS lays out its flex rows and
 * stacks by direct children, so these hosts must not add a box of their own.
 */
export const contents = { style: "display: contents" };

/** The page frame of the Doggo, Coffee Spark and Grid themes. Each theme shows a different part of the brand. */
@Component({
  selector: "fc-page",
  host: contents,
  template: `
    <main class="fc-main">
      <div class="fc-headline">
        <span class="fc-icon" aria-hidden="true">coffee</span>
        Coffee Spark
      </div>
      <img class="fc-mascot" src="full-customization-assets/doggo-mascot.svg" alt="" />
      <h1 class="fc-intro">
        <span class="fc-intro__text">{{ title() }}</span>
      </h1>
      <div class="fc-card">
        <p class="fc-prompt">{{ prompt() }}</p>
        <ng-content />
      </div>
    </main>
    <ng-content select="[fcFooter]" />
  `,
})
export class PageComponent {
  /** Shown in the Doggo welcome bubble, and read by screen readers in every theme. */
  title = input.required<string>();
  /** The line above the form. Spark and Grid use it as their visible heading. */
  prompt = input.required<string>();
}

@Component({
  selector: "div[fcField]",
  host: {
    "[class]": "variant() === 'code' ? 'fc-field fc-field--code' : 'fc-field'",
    "[attr.data-invalid]": "invalid() || null",
  },
  template: `
    @if (icon()) {
      <span class="fc-field__icon fc-icon" aria-hidden="true">{{ icon() }}</span>
    }
    <input
      #input
      class="fc-field__input"
      [type]="type() === 'password' && revealed() ? 'text' : type()"
      [placeholder]="placeholderText()"
      [attr.autocomplete]="autocomplete()"
      [attr.inputmode]="inputmode()"
      [attr.aria-label]="label() ?? placeholderText()"
      [attr.aria-invalid]="invalid() || null"
      [attr.aria-describedby]="describedBy()"
      [disabled]="disabled()"
      [value]="value()"
      (input)="onInput(input.value)"
    />
    @if (type() === "password") {
      <button
        type="button"
        class="fc-field__toggle fc-icon"
        (click)="revealed.set(!revealed())"
        [attr.aria-label]="revealed() ? 'Hide password' : 'Show password'"
      >
        {{ revealed() ? "visibility_off" : "visibility" }}
      </button>
    }
  `,
})
export class TextFieldComponent {
  value = model("");
  /** A Material Symbols icon name for the leading slot. */
  icon = input<string>();
  type = input<"text" | "email" | "password" | "tel">("text");
  placeholderText = input("");
  autocomplete = input<string>();
  inputmode = input<string>();
  label = input<string>();
  invalid = input(false);
  disabled = input(false);
  describedBy = input<string>();
  autofocus = input(false);
  variant = input<"code">();
  /** Rewrites what was typed, such as keeping only the digits of a code. */
  normalize = input<(value: string) => string>((value) => value);

  revealed = signal(false);
  private input = viewChild.required<ElementRef<HTMLInputElement>>("input");

  constructor() {
    afterNextRender(() => {
      if (this.autofocus()) this.input().nativeElement.focus();
    });
  }

  onInput(raw: string) {
    const next = this.normalize()(raw);
    // Write the cleaned value back, so a rejected character never shows in the field.
    this.input().nativeElement.value = next;
    this.value.set(next);
  }
}

/** Keeps the digits of a six digit code. Authenticator apps show codes as "123 456". */
export const sixDigits = (value: string) => value.replace(/\D/g, "").slice(0, 6);

/** A country picker and phone number field, fed by the countryCodes behavior configured in initializeUI. */
@Component({
  selector: "div[fcPhoneFields]",
  imports: [TextFieldComponent],
  host: { class: "fc-row" },
  template: `
    <div class="fc-field fc-row__country">
      <select class="fc-field__input" aria-label="Country code" (change)="select(picker.value)" #picker>
        @for (c of countries(); track $index) {
          <option [value]="c.code" [selected]="c.code === country().code">{{ c.emoji }} {{ c.dialCode }}</option>
        }
      </select>
    </div>
    <div
      fcField
      icon="phone"
      type="tel"
      autocomplete="tel-national"
      placeholderText="Phone number"
      [(value)]="phone"
    ></div>
  `,
})
export class PhoneFieldsComponent {
  country = model.required<CountryData>();
  phone = model("");
  countries = injectCountries();

  select(code: string) {
    this.country.set(this.countries().find((c) => c.code === code) ?? this.country());
  }
}

@Component({
  selector: "button[fcButton]",
  host: {
    class: "fc-button",
    "[attr.data-variant]": "variant()",
    "[attr.type]": "type()",
    "[disabled]": "disabled() || loading()",
    "[attr.aria-busy]": "loading() || null",
  },
  template: `<ng-content />`,
})
export class ButtonComponent {
  variant = input<"primary" | "secondary">("primary");
  type = input<"button" | "submit">("button");
  loading = input(false);
  disabled = input(false);
}

@Component({
  selector: "button[fcLink]",
  host: { class: "fc-link", type: "button" },
  template: `<ng-content />`,
})
export class TextLinkComponent {}

@Component({
  selector: "fc-google-logo",
  host: contents,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  `,
})
export class GoogleLogoComponent {}

@Component({
  selector: "button[fcProvider]",
  imports: [GoogleLogoComponent],
  host: { class: "fc-provider", type: "button", "[attr.data-provider]": "provider()" },
  template: `
    @switch (provider()) {
      @case ("google") {
        <fc-google-logo />
      }
      @case ("phone") {
        <span class="fc-icon" aria-hidden="true">phone</span>
      }
      @case ("guest") {
        <span class="fc-icon" aria-hidden="true">person</span>
      }
    }
    <ng-content />
  `,
})
export class ProviderButtonComponent {
  provider = input.required<"google" | "phone" | "guest">();
}

/** Renders one reCAPTCHA into its own element, so a new slot gets a new verifier. */
@Component({ selector: "fc-recaptcha-slot", template: `` })
export class RecaptchaSlotComponent {
  private host = inject<ElementRef<HTMLDivElement>>(ElementRef);
  verifier = injectRecaptchaVerifier(() => this.host);
}

/**
 * injectRecaptchaVerifier, plus a way to start over. A reCAPTCHA token is single use, so after each
 * send (failed, or before a resend) the slot is swapped for a new element with a fresh verifier.
 */
@Component({
  selector: "fc-recaptcha",
  imports: [RecaptchaSlotComponent],
  template: `
    <!-- A one-item list tracked by the key: each reset destroys the slot and renders a new one. -->
    @for (key of [key()]; track key) {
      <fc-recaptcha-slot />
    }
  `,
})
export class RecaptchaComponent {
  private key = signal(0);
  private slot = viewChild(RecaptchaSlotComponent);
  /** Null while a fresh slot renders after each reset. */
  verifier = computed(() => this.slot()?.verifier() ?? null);

  reset() {
    this.key.update((key) => key + 1);
  }
}

/** Thrown when the user dismisses the reauthentication dialog, which is a cancellation rather than a failure. */
export class ReauthCancelledError extends Error {
  constructor() {
    super("Reauthentication cancelled");
  }
}

/**
 * Runs an auth call, tracking whether it is in flight and the message to show if it fails.
 *
 * The ui-core functions throw errors whose message is already translated. Calls made straight to
 * firebase/auth throw a raw FirebaseError, which is translated here with FirebaseUIError.
 */
export class AuthTask {
  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private ui: () => FirebaseUI) {}

  async run<T>(task: () => Promise<T>): Promise<T | undefined> {
    this.pending.set(true);
    this.error.set(null);
    try {
      return await task();
    } catch (e) {
      if (e instanceof FirebaseError && !(e instanceof FirebaseUIError)) {
        this.error.set(new FirebaseUIError(this.ui(), e).message);
      } else if (!(e instanceof ReauthCancelledError)) {
        this.error.set(e instanceof Error ? e.message : String(e));
      }
      return undefined;
    } finally {
      this.pending.set(false);
    }
  }
}

export function injectAuthTask() {
  const ui = injectUI();
  return new AuthTask(ui);
}

/** The six digit code step shared by phone sign in, SMS and TOTP enrollment, and the MFA challenge. */
@Component({
  selector: "fc-code-form",
  imports: [TextFieldComponent, ButtonComponent],
  host: contents,
  template: `
    <form class="fc-form" (submit)="$event.preventDefault(); submit()">
      <div
        fcField
        variant="code"
        inputmode="numeric"
        autocomplete="one-time-code"
        placeholderText="000000"
        label="Verification code"
        [autofocus]="true"
        [normalize]="sixDigits"
        [(value)]="code"
      ></div>
      @if (task().error(); as error) {
        <p class="fc-error" role="alert">{{ error }}</p>
      }
      <div class="fc-links"><ng-content /></div>
      <div class="fc-actions">
        <button fcButton type="submit" [disabled]="code().length !== 6" [loading]="task().pending()">
          {{ submitLabel() }}
        </button>
      </div>
    </form>
  `,
})
export class CodeFormComponent {
  task = input.required<AuthTask>();
  submitCode = input.required<(code: string) => Promise<unknown>>();
  submitLabel = input("Verify");
  code = signal("");
  sixDigits = sixDigits;

  submit() {
    void this.task().run(() => this.submitCode()(this.code()));
  }
}
