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
export class FormMetadataComponent {
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
export class FormInputComponent {
  field = injectField<string>();
  label = input.required<string>();
  type = input<string>("text");
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
export class FormSubmitComponent {
  class = input<string>();
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
export class FormErrorMessageComponent {
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
