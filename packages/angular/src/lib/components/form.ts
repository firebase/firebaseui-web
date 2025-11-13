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

import { Component, computed, input } from "@angular/core";
import { AnyFieldApi, AnyFormState, injectField } from "@tanstack/angular-form";
import { ButtonComponent } from "./button";

@Component({
  selector: "fui-form-metadata",
  standalone: true,
  host: {
    style: "display: block;",
  },
  template: `
    @if (field().state.meta.isTouched && errors().length > 0) {
      <div>
        <div role="alert" aria-live="polite" class="fui-error">
          {{ errors() }}
        </div>
      </div>
    }
  `,
})
/**
 * A component that displays form field metadata, such as validation errors.
 */
export class FormMetadataComponent {
  /** The form field API instance. */
  field = input.required<AnyFieldApi>();
  errors = computed(() =>
    this.field()
      .state.meta.errors.map((error) => error.message)
      .join(", ")
  );
}

@Component({
  selector: "fui-form-input",
  standalone: true,
  imports: [FormMetadataComponent],
  host: {
    style: "display: block;",
  },
  template: `
    <label [for]="field.api.name">
      <div data-input-label>
        <div>{{ label() }}</div>
        <div><ng-content select="input-action" /></div>
      </div>
      @if (description()) {
        <div data-input-description>{{ description() }}</div>
      }
      <div data-input-group>
        <ng-content select="input-before" />
        <input
          [attr.aria-invalid]="field.api.state.meta.isTouched && field.api.state.meta.errors.length > 0"
          [id]="field.api.name"
          [name]="field.api.name"
          [value]="field.api.state.value"
          (blur)="field.api.handleBlur()"
          (input)="field.api.handleChange($any($event).target.value)"
          [type]="type()"
        />
      </div>
      <ng-content></ng-content>
      <fui-form-metadata [field]="field.api"></fui-form-metadata>
    </label>
  `,
})
/**
 * A form input component with label, description, and validation support.
 */
export class FormInputComponent {
  field = injectField<string>();
  /** The label text for the input field. */
  label = input.required<string>();
  /** The input type (e.g., "text", "email", "password"). */
  type = input<string>("text");
  /** Optional description text displayed below the label. */
  description = input<string>();
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
    <button fui-button class="fui-form__action" [class]="class()" [disabled]="isSubmitting()">
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

  isSubmitting = computed(() => this.state().isSubmitting);
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
