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
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnChanges,
  signal,
  SimpleChanges,
  viewChild,
} from "@angular/core";
import { AnyFormState, injectField } from "@tanstack/angular-form";
import { ButtonComponent } from "./button";

@Component({
  selector: "fui-form-metadata",
  standalone: true,
  host: {
    style: "display: block;",
  },
  template: `
    @if (isTouched() && errors().length > 0) {
      <div>
        <div role="alert" aria-live="polite" class="fui-error" [attr.id]="errorId()">
          {{ errorMessage() }}
        </div>
      </div>
    }
  `,
})
/**
 * A component that displays form field metadata, such as validation errors.
 */
export class FormMetadataComponent {
  isTouched = input.required<boolean>();
  errors = input.required<Array<{ message: string }>>();
  /** Optional id for the error element, so the input can reference it with `aria-describedby`. */
  errorId = input<string>();

  errorMessage(): string {
    return this.errors()
      .map((error) => error.message)
      .join(", ");
  }
}

@Component({
  selector: "fui-form-input",
  standalone: true,
  imports: [FormMetadataComponent],
  host: {
    style: "display: block;",
  },
  template: `
    <div data-input-field>
      <div data-input-label>
        <label [for]="field.api.name">{{ label() }}</label>
        <div><ng-content select="input-action" /></div>
      </div>
      @if (description()) {
        <div data-input-description [id]="field.api.name + '-description'">{{ description() }}</div>
      }
      <div data-input-group>
        <ng-content select="input-before" />
        <input
          #inputElement
          [attr.aria-invalid]="field.api.state.meta.isTouched && field.api.state.meta.errors.length > 0"
          [attr.aria-describedby]="describedBy()"
          [id]="field.api.name"
          [name]="field.api.name"
          [value]="field.api.state.value"
          (input)="handleInput($event)"
          [type]="inputType()"
          [attr.autocomplete]="autocomplete()"
          [attr.placeholder]="placeholder()"
          [attr.maxlength]="maxlength()"
          [attr.spellcheck]="hasPasswordToggle() ? 'false' : null"
          [attr.autocapitalize]="hasPasswordToggle() ? 'off' : null"
          [attr.autocorrect]="hasPasswordToggle() ? 'off' : null"
        />
        @if (hasPasswordToggle()) {
          <button
            type="button"
            class="fui-form__password-toggle"
            [attr.aria-label]="passwordVisible() ? hidePasswordLabel() : showPasswordLabel()"
            [attr.aria-controls]="field.api.name"
            (click)="togglePasswordVisibility()"
          >
            <!-- Icon paths from Lucide (ISC). -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              @if (passwordVisible()) {
                <path
                  d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
                />
                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                <path
                  d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
                />
                <path d="m2 2 20 20" />
              } @else {
                <path
                  d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                />
                <circle cx="12" cy="12" r="3" />
              }
            </svg>
          </button>
        }
      </div>
      <ng-content></ng-content>
      <fui-form-metadata
        [isTouched]="field.api.state.meta.isTouched"
        [errors]="field.api.state.meta.errors"
        [errorId]="field.api.name + '-error'"
      ></fui-form-metadata>
    </div>
  `,
})
/**
 * A form input component with label, description, and validation support.
 */
export class FormInputComponent implements OnChanges, AfterViewInit {
  field = injectField<string>();
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  /** The label text for the input field. */
  label = input.required<string>();
  /** The input type (e.g., "text", "email", "password"). */
  type = input<string>("text");
  /** Optional description text displayed below the label. */
  description = input<string>();
  /** The autocomplete hint forwarded to the underlying input (e.g. "username", "current-password"). */
  autocomplete = input<string>();
  /** Optional placeholder shown while the input is empty. */
  placeholder = input<string>();
  /** Optional maximum character count accepted by the input. */
  maxlength = input<string | number>();
  /** Accessible label for the show password button. With `type="password"`, setting it renders the toggle. */
  showPasswordLabel = input<string>();
  /** Accessible label for the hide password button. */
  hidePasswordLabel = input<string>();

  private inputElement = viewChild.required<ElementRef<HTMLInputElement>>("inputElement");

  passwordVisible = signal(false);
  hasPasswordToggle = computed(
    () => this.type() === "password" && !!this.showPasswordLabel() && !!this.hidePasswordLabel()
  );
  inputType = computed(() => (this.hasPasswordToggle() && this.passwordVisible() ? "text" : this.type()));

  togglePasswordVisibility() {
    this.passwordVisible.update((visible) => !visible);
  }

  ngAfterViewInit(): void {
    // Hide the password again on submit, so it is not left on screen and password managers see a password field.
    if (!this.hasPasswordToggle()) return;
    const input = this.inputElement().nativeElement;
    const form = input.form;
    if (!form) return;

    const hide = () => {
      if (!this.passwordVisible()) return;
      input.type = "password";
      this.passwordVisible.set(false);
      this.cdr.markForCheck();
    };
    form.addEventListener("submit", hide, { capture: true });
    this.destroyRef.onDestroy(() => form.removeEventListener("submit", hide, { capture: true }));
  }

  describedBy(): string | null {
    const meta = this.field.api.state.meta;
    const ids = [
      this.description() ? `${this.field.api.name}-description` : null,
      meta.isTouched && meta.errors.length > 0 ? `${this.field.api.name}-error` : null,
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : null;
  }

  handleInput(event: Event) {
    const value = (event.target as HTMLInputElement | null)?.value ?? "";
    this.field.api.handleChange(value);

    // Clear form-level submission errors when user starts typing
    const form = (this.field.api as any)?.form;
    const errorMap = form?.state?.errorMap;
    if (errorMap?.onSubmit) {
      form?.setErrorMap?.({});
    }
  }

  ngOnChanges(_changes: SimpleChanges): void {
    // Trigger change detection when any input changes
    this.cdr.markForCheck();
  }
}

@Component({
  selector: "button[fui-form-action]",
  standalone: true,
  host: {
    class: "fui-form__action",
    type: "button",
  },
  template: `<ng-content></ng-content> `,
})
/**
 * A button component for form actions (e.g., "Forgot Password?" link).
 */
export class FormActionComponent {}

@Component({
  selector: "fui-form-submit",
  standalone: true,
  imports: [ButtonComponent],
  host: {
    type: "submit",
    style: "display: block;",
  },
  template: `
    <button fui-button class="fui-form__action" [class]="class()" [disabled]="isDisabled()">
      <ng-content></ng-content>
    </button>
  `,
})
/**
 * A submit button component for forms.
 *
 * Automatically disables when the form is submitting.
 */
export class FormSubmitComponent {
  /** Optional additional CSS classes. */
  class = input<string>();
  /** The form state for tracking submission status. */
  state = input.required<AnyFormState>();
  /** Optional additional disabled condition. */
  disabled = input<boolean>(false);

  isSubmitting = computed(() => this.state().isSubmitting);
  isDisabled = computed(() => this.isSubmitting() || this.disabled());
}

@Component({
  selector: "fui-form-error-message",
  standalone: true,
  host: {
    style: "display: block;",
  },
  template: `
    @if (errorMessage()) {
      <div class="fui-error">
        {{ errorMessage() }}
      </div>
    }
  `,
})
/**
 * A component that displays form-level error messages.
 *
 * Shows errors from form submission, not validation errors.
 */
export class FormErrorMessageComponent {
  /** The form state containing error information. */
  state = input.required<AnyFormState>();

  errorMessage = computed(() => {
    const error = this.state().errorMap?.onSubmit;

    // We only care about errors thrown from the form submission, rather than validation errors
    if (error && typeof error === "string") {
      return error;
    }

    return undefined;
  });
}
