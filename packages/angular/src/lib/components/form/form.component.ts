import { Component, HostBinding, input, Input } from '@angular/core'
import { AnyFieldApi, injectField, injectForm } from '@tanstack/angular-form'
import { cn } from '../../utils';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'fui-form-metadata',
  standalone: true,
  template: `
    @if(field.state.meta.isTouched && field.state.meta.errors.length > 0) {
      <div>
        <div role="alert" aria-live="polite" class="fui-form__error">
          {{ field.state.meta.errors.join(", ") }}
        </div>
      </div>
    }
  `,
})
export class FormMetadataComponent {
  @Input() field: AnyFieldApi;
}

@Component({
  selector: 'fui-form-input',
  standalone: true,
  imports: [FormMetadataComponent],
  template: `
    <label [for]="field.api.name">
      <span>{{ label() }}</span>
      <input
        [attr.aria-invalid]="field.api.state.meta.isTouched && field.api.state.meta.errors.length > 0"
        [id]="field.api.name"
        [name]="field.api.name"
        [value]="field.api.state.value"
        (blur)="field.api.handleBlur()"
        (input)="field.api.handleChange($any($event).target.value)"
      />
      <ng-content></ng-content>
      <fui-form-metadata [field]="field"></fui-form-metadata>
    </label>
  `,
})
export class FormInputComponent {
  field = injectField<string>()

  label = input.required<string>();
}

@Component({
  selector: 'button[fui-form-action]',
  standalone: true,
  template: `
    <ng-content></ng-content>
  `,
})
export class FormActionComponent {
  @Input()
  @HostBinding("class")
  className: string = "";

  @HostBinding("attr.class")
  get getButtonClasses(): string {
    return cn("fui-form__action", this.className);
  }

  @HostBinding('attr.type')
  readonly type = 'button';

  field = injectField<string>()
}

@Component({
  selector: 'fui-form-submit',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <button fui-button [class]="buttonClasses" [disabled]="isSubmitting">
      <ng-content></ng-content>
    </button>
  `,
})
export class FormSubmitComponent {
  @Input()
  className: string = "";

  @HostBinding('attr.type')
  readonly type = 'submit';

  form = injectForm()

  get buttonClasses(): string {
    return cn("fui-form__action", this.className);
  }

  get isSubmitting(): boolean {
    return this.form.state.isSubmitting;
  }
}

@Component({
  selector: 'fui-form-error-message',
  standalone: true,
  template: `
    @if (form.state.errorMap.onSubmit) {
      <div class="fui-form__error">
        {{ form.state.errorMap.onSubmit.toString() }}
      </div>
    }
  `,
})
export class FormErrorMessageComponent {
    form = injectForm()
}