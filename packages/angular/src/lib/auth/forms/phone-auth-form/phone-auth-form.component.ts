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
  Component,
  OnInit,
  ElementRef,
  effect,
  input,
  signal,
  output,
  computed,
  viewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { injectForm, injectStore, TanStackAppField, TanStackField } from "@tanstack/angular-form";
import { injectPhoneAuthFormSchema, injectTranslation, injectUI } from "../../../provider";
import { ConfirmationResult, RecaptchaVerifier, UserCredential } from "@angular/fire/auth";
import { PoliciesComponent } from "../../../components/policies/policies.component";
import { CountrySelectorComponent } from "../../../components/country-selector/country-selector.component";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
} from "../../../components/form/form.component";
import {
  countryData,
  FirebaseUIError,
  formatPhoneNumberWithCountry,
  confirmPhoneNumber,
  signInWithPhoneNumber,
  CountryCode,
} from "@firebase-ui/core";

@Component({
  selector: "fui-phone-number-form",
  standalone: true,
  imports: [
    CommonModule,
    TanStackField,
    TanStackAppField,
    PoliciesComponent,
    FormInputComponent,
    FormSubmitComponent,
    FormErrorMessageComponent,
    CountrySelectorComponent,
  ],
  template: `
    <form (submit)="handleSubmit($event)" class="fui-form">
      <fieldset>
        <fui-country-selector [(value)]="country"></fui-country-selector>
        <fui-form-input
          name="phoneNumber"
          tanstack-app-field
          [tanstackField]="form"
          label="{{ phoneNumberLabel() }}"
        ></fui-form-input>
      </fieldset>
      <fieldset>
        <div class="fui-recaptcha-container" #recaptchaContainer></div>
      </fieldset>
      <fui-policies />
      <fieldset>
        <fui-form-submit [state]="state()">
          {{ sendCodeLabel() }}
        </fui-form-submit>
        <fui-form-error-message [state]="state()" />
      </fieldset>
    </form>
  `,
})
export class PhoneNumberFormComponent implements OnInit {
  private ui = injectUI();
  private formSchema = injectPhoneAuthFormSchema();
  private phoneFormSchema: ReturnType<typeof this.pickPhoneFormSchema>;

  onSubmit = output<ConfirmationResult>();
  country = signal<CountryCode>(countryData[0].code);

  phoneNumberLabel = injectTranslation("labels", "phoneNumber");
  sendCodeLabel = injectTranslation("labels", "sendCode");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  recaptchaContainer = viewChild.required<ElementRef<HTMLDivElement>>("recaptchaContainer");

  recaptchaVerifier = computed(() => {
    return new RecaptchaVerifier(this.ui().auth, this.recaptchaContainer().nativeElement, {
      size: "normal", // TODO(ehesp): Get this from the ui behavior
    });
  });

  form = injectForm({
    defaultValues: {
      phoneNumber: "",
    },
  });

  state = injectStore(this.form, (state) => state);

  async ngOnInit() {
    this.phoneFormSchema = this.pickPhoneFormSchema();

    effect(() => {
      this.form.update({
        validators: {
          onBlur: this.phoneFormSchema(),
          onSubmit: this.phoneFormSchema(),
          onSubmitAsync: async ({ value }) => {
            const formattedNumber = formatPhoneNumberWithCountry(value.phoneNumber, this.country());

            try {
              const result = await signInWithPhoneNumber(this.ui(), formattedNumber, this.recaptchaVerifier());
              this.onSubmit.emit(result);
            } catch (error) {
              if (error instanceof FirebaseUIError) {
                return error.message;
              }

              return this.unknownErrorLabel();
            }
          },
        },
      });
    });

    effect((onCleanup) => {
      const verifier = this.recaptchaVerifier();

      onCleanup(() => {
        verifier.clear();
      });
    });
  }

  private pickPhoneFormSchema() {
    return computed(() =>
      this.formSchema().pick({
        phoneNumber: true,
      })
    );
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.form.handleSubmit();
  }
}

@Component({
  selector: "fui-verification-form",
  standalone: true,
  imports: [
    CommonModule,
    TanStackField,
    TanStackAppField,
    PoliciesComponent,
    FormInputComponent,
    FormSubmitComponent,
    FormErrorMessageComponent,
  ],
  template: `
    <form (submit)="handleSubmit($event)" class="fui-form">
      <fieldset>
        <fui-form-input
          name="verificationCode"
          tanstack-app-field
          [tanstackField]="form"
          label="{{ verificationCodeLabel() }}"
        ></fui-form-input>
      </fieldset>

      <fui-policies />

      <fieldset>
        <fui-form-submit [state]="state()">
          {{ verifyCodeLabel() }}
        </fui-form-submit>
        <fui-form-error-message [state]="state()" />
      </fieldset>

      <fieldset>
        <button fui-form-action (click)="onResend()">
          @if (isResending()) {
            {{ sendingLabel() }}
          } @else {
            {{ resendCodeLabel() }}
          }
        </button>
      </fieldset>
    </form>
  `,
})
export class VerificationFormComponent implements OnInit {
  private ui = injectUI();
  private formSchema = injectPhoneAuthFormSchema();
  private verificationFormSchema: ReturnType<typeof this.pickVerificationFormSchema>;

  confirmationResult = input.required<ConfirmationResult>();
  resendDelay = input<number>(30);
  signIn = output<UserCredential>();

  isResending = signal<boolean>(false);

  verificationCodeLabel = injectTranslation("labels", "verificationCode");
  verifyCodeLabel = injectTranslation("labels", "verifyCode");
  resendCodeLabel = injectTranslation("labels", "resendCode");
  sendingLabel = injectTranslation("labels", "sending");
  unknownErrorLabel = injectTranslation("errors", "unknownError");

  // @Input() onSubmit!: (code: string) => Promise<void>;
  // @Input() onResend!: () => Promise<void>;
  // @Input() formError: string | null = null;
  // @Input() showTerms = false;
  // @Input() isResending = false;
  // @Input() canResend = false;
  // @Input() timeLeft = 0;
  // @ViewChild("recaptchaContainer", { static: true })
  // recaptchaContainer!: ElementRef<HTMLDivElement>;

  // private formSchema: any;
  // private config: any;

  form = injectForm({
    defaultValues: {
      verificationCode: "",
    },
  });

  state = injectStore(this.form, (state) => state);

  async ngOnInit() {
    this.verificationFormSchema = this.pickVerificationFormSchema();

    effect(() => {
      this.form.update({
        validators: {
          onBlur: this.verificationFormSchema(),
          onSubmit: this.verificationFormSchema(),
          onSubmitAsync: async ({ value }) => {
            try {
              const credential = await confirmPhoneNumber(this.ui(), this.confirmationResult(), value.verificationCode);
              this.signIn.emit(credential);
            } catch (error) {
              if (error instanceof FirebaseUIError) {
                return error.message;
              }

              return this.unknownErrorLabel();
            }
          },
        },
      });
    });
  }

  private pickVerificationFormSchema() {
    return computed(() =>
      this.formSchema().pick({
        verificationCode: true,
      })
    );
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.form.handleSubmit();
  }

  async onResend() {
    alert("TODO: Implement resend code");
  }
}

@Component({
  selector: "fui-phone-auth-form",
  standalone: true,
  imports: [CommonModule, PhoneNumberFormComponent, VerificationFormComponent],
  template: `
    <div class="fui-form-container">
      @if (confirmationResult()) {
        <fui-verification-form [confirmationResult]="confirmationResult()" [resendDelay]="resendDelay()" />
      } @else {
        <fui-phone-number-form (onSubmit)="confirmationResult.set($event)" />
      }
    </div>
  `,
})
export class PhoneAuthFormComponent {
  confirmationResult = signal<ConfirmationResult | null>(null);
  resendDelay = input<number>(30);
}
