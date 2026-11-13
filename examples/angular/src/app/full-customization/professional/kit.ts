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

import { afterNextRender, Component, type ElementRef, input, model, output, signal, viewChild } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import type { CountryData } from "@firebase-oss/ui-core";
import { injectCountries, injectPolicies } from "@firebase-oss/ui-angular";

import { contents, sixDigits } from "../components";

let nextId = 0;
/** A page-unique id, like React's useId. */
const uniqueId = () => `pro-${++nextId}`;

@Component({
  selector: "fc-pro-header",
  host: contents,
  template: `
    <header>
      @if (brand()) {
        <div class="pro-brand">
          <span class="pro-tile pro-tile--brand"><span class="fc-icon pro-sym" aria-hidden="true">shield</span></span>
          FirebaseUI Demo
        </div>
      }
      @if (icon()) {
        <span class="pro-tile pro-tile--header">
          <span class="fc-icon pro-sym" aria-hidden="true">{{ icon() }}</span>
        </span>
      }
      @if (level() === "h2") {
        <h2 [id]="titleId()" class="pro-title">{{ title() }}</h2>
      } @else {
        <h1 [id]="titleId()" class="pro-title">{{ title() }}</h1>
      }
      @if (subtitle()) {
        <p [id]="subtitleId()" class="pro-subtitle">{{ subtitle() }}</p>
      }
    </header>
  `,
})
export class ProHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
  /** A Material Symbols icon name for the header tile, shown above the title. */
  icon = input<string>();
  /** The brand row, shown on the first screen only. */
  brand = input(false);
  /** Heading level and ids, for headers inside a dialog. */
  level = input<"h1" | "h2">("h1");
  titleId = input<string>();
  subtitleId = input<string>();
}

/** A flat, left-aligned page: header, content, then a footer pinned to the bottom when content is short. */
@Component({
  selector: "fc-pro-page",
  imports: [ProHeaderComponent],
  host: contents,
  template: `
    <main class="pro-page">
      @if (back()) {
        <button type="button" class="pro-back" (click)="backClick.emit()">
          <span class="fc-icon pro-sym" aria-hidden="true">chevron_left</span>
          Back
        </button>
      }
      <fc-pro-header [title]="title()" [subtitle]="subtitle()" [icon]="icon()" [brand]="brand()" />
      <div class="pro-content"><ng-content /></div>
      <div class="pro-spacer"></div>
      <ng-content select="[proFooter]" />
    </main>
  `,
})
export class ProPageComponent {
  title = input.required<string>();
  subtitle = input<string>();
  icon = input<string>();
  brand = input(false);
  /** Shows the Back button, which emits backClick. */
  back = input(false);
  backClick = output();
}

/** A labelled input, with a show/hide toggle for passwords. */
@Component({
  selector: "fc-pro-field",
  host: contents,
  template: `
    <div>
      <div class="pro-label-row">
        <label class="pro-label" [for]="id">{{ label() }}</label>
        @if (action()) {
          <button type="button" class="pro-label-action" (click)="actionClick.emit()">{{ action() }}</button>
        }
      </div>
      <div class="pro-input-wrap">
        <input
          #input
          [id]="id"
          class="pro-input"
          [type]="type() === 'password' && revealed() ? 'text' : type()"
          [placeholder]="placeholderText()"
          [attr.autocomplete]="autocomplete()"
          [attr.inputmode]="inputmode()"
          [attr.aria-invalid]="invalid() || null"
          [attr.aria-describedby]="hint() ? id + '-hint' : null"
          [value]="value()"
          (input)="onInput(input.value)"
        />
        @if (type() === "password") {
          <button
            type="button"
            class="pro-toggle"
            (click)="revealed.set(!revealed())"
            [attr.aria-label]="revealed() ? 'Hide password' : 'Show password'"
          >
            <span class="fc-icon pro-sym" aria-hidden="true">{{ revealed() ? "visibility_off" : "visibility" }}</span>
          </button>
        }
      </div>
      @if (hint()) {
        <p [id]="id + '-hint'" [class]="invalid() ? 'pro-hint pro-hint--error' : 'pro-hint'">{{ hint() }}</p>
      }
    </div>
  `,
})
export class ProFieldComponent {
  value = model("");
  label = input.required<string>();
  type = input<"text" | "email" | "password">("text");
  placeholderText = input("");
  autocomplete = input<string>();
  inputmode = input<string>();
  invalid = input(false);
  hint = input<string>();
  autofocus = input(false);
  /** A link on the right of the label row, such as "Forgot password?". */
  action = input<string>();
  actionClick = output();
  normalize = input<(value: string) => string>((value) => value);

  protected id = uniqueId();
  protected revealed = signal(false);
  private input = viewChild.required<ElementRef<HTMLInputElement>>("input");

  constructor() {
    afterNextRender(() => {
      if (this.autofocus()) this.input().nativeElement.focus();
    });
  }

  onInput(raw: string) {
    const next = this.normalize()(raw);
    this.input().nativeElement.value = next;
    this.value.set(next);
  }
}

/** The code entry used by phone sign in, MFA setup and the MFA challenge: a labelled six digit field. */
@Component({
  selector: "fc-pro-code-field",
  imports: [ProFieldComponent],
  host: contents,
  template: `
    <fc-pro-field
      label="Verification code"
      placeholderText="6-digit code"
      inputmode="numeric"
      autocomplete="one-time-code"
      [autofocus]="true"
      [normalize]="sixDigits"
      [(value)]="value"
    />
  `,
})
export class ProCodeFieldComponent {
  value = model("");
  protected sixDigits = sixDigits;
}

/** One bordered box holding the country picker and the number, as on Android and iOS. */
@Component({
  selector: "fc-pro-phone-field",
  host: contents,
  template: `
    <div>
      <div class="pro-label-row">
        <label class="pro-label" [for]="id">Phone number</label>
      </div>
      <div class="pro-phone">
        <select class="pro-select" aria-label="Country code" #picker (change)="select(picker.value)">
          @for (c of countries(); track $index) {
            <option [value]="c.code" [selected]="c.code === country().code">{{ c.emoji }} {{ c.dialCode }}</option>
          }
        </select>
        <span class="pro-phone__divider" aria-hidden="true"></span>
        <input
          #number
          [id]="id"
          class="pro-input"
          type="tel"
          autocomplete="tel-national"
          placeholder="555 123 4567"
          [value]="phone()"
          (input)="phone.set(number.value)"
        />
      </div>
    </div>
  `,
})
export class ProPhoneFieldComponent {
  country = model.required<CountryData>();
  phone = model("");
  protected id = uniqueId();
  protected countries = injectCountries();

  select(code: string) {
    this.country.set(this.countries().find((c) => c.code === code) ?? this.country());
  }
}

@Component({
  selector: "button[proBtn]",
  host: {
    "[class]": "'pro-btn pro-btn--' + variant()",
    "[attr.type]": "type()",
    "[disabled]": "disabled() || loading()",
    "[attr.aria-busy]": "loading() || null",
  },
  template: `<ng-content />`,
})
export class ProButtonComponent {
  variant = input<"primary" | "outline" | "text">("primary");
  type = input<"button" | "submit">("button");
  loading = input(false);
  disabled = input(false);
}

@Component({
  selector: "fc-pro-error",
  host: contents,
  template: `
    @if (message()) {
      <p class="pro-error" role="alert">
        <span class="fc-icon pro-sym" aria-hidden="true">error</span>
        {{ message() }}
      </p>
    }
  `,
})
export class ProErrorComponent {
  message = input<string | null>();
}

/** The terms line, from the policies configured with provideFirebaseUIPolicies. */
@Component({
  selector: "fc-pro-legal",
  host: contents,
  template: `
    @if (policies) {
      <p class="pro-legal">
        {{ lead() }}
        <a [href]="policies.termsOfServiceUrl" target="_blank" rel="noreferrer">Terms of Service</a>
        and
        <a [href]="policies.privacyPolicyUrl" target="_blank" rel="noreferrer">Privacy Policy</a>.
      </p>
    }
  `,
})
export class ProLegalComponent {
  lead = input.required<string>();
  protected policies = injectPolicies();
}

type Tone = "muted" | "accent" | "danger";

/** A settings row: icon, title, value, chevron. A button when it is clickable. */
@Component({
  selector: "fc-pro-row",
  imports: [NgTemplateOutlet],
  host: contents,
  template: `
    <ng-template #content>
      @if (icon()) {
        <span class="fc-icon pro-sym" aria-hidden="true">{{ icon() }}</span>
      }
      <span [class]="!value() && tone() !== 'muted' ? 'pro-row__title pro-row__value--' + tone() : 'pro-row__title'">
        {{ title() }}
      </span>
      @if (value()) {
        <span [class]="tone() === 'muted' ? 'pro-row__value' : 'pro-row__value pro-row__value--' + tone()">
          {{ value() }}
        </span>
      }
      @if (chevron()) {
        <span class="pro-chevron"><span class="fc-icon pro-sym" aria-hidden="true">chevron_right</span></span>
      }
    </ng-template>
    @if (clickable()) {
      <button
        type="button"
        [class]="icon() ? 'pro-row' : 'pro-row pro-row--plain'"
        [disabled]="disabled()"
        [attr.aria-expanded]="expanded()"
        (click)="rowClick.emit()"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </button>
    } @else {
      <div [class]="icon() ? 'pro-row' : 'pro-row pro-row--plain'">
        <ng-container [ngTemplateOutlet]="content" />
      </div>
    }
  `,
})
export class ProRowComponent {
  title = input.required<string>();
  icon = input<string>();
  value = input<string>();
  tone = input<Tone>("muted");
  chevron = input(false);
  clickable = input(false);
  disabled = input(false);
  /** For a row that toggles an inline form below it. */
  expanded = input<boolean>();
  rowClick = output();
}

/** A radio row for picking a second factor, built on a native radio for keyboard support. */
@Component({
  selector: "fc-pro-choice",
  host: contents,
  template: `
    <label class="pro-choice">
      <input type="radio" [name]="name()" [checked]="checked()" (change)="selected.emit()" />
      <span class="pro-tile"
        ><span class="fc-icon pro-sym" aria-hidden="true">{{ icon() }}</span></span
      >
      <span class="pro-choice__text">
        <span class="pro-choice__title">{{ title() }}</span>
        <span class="pro-choice__detail">{{ detail() }}</span>
      </span>
      <span class="pro-radio" aria-hidden="true"></span>
    </label>
  `,
})
export class ProChoiceComponent {
  /** Shared by the choices in one group, so the arrow keys move between them. */
  name = input.required<string>();
  icon = input.required<string>();
  title = input.required<string>();
  detail = input.required<string>();
  checked = input(false);
  selected = output();
}

/** A native modal dialog, shown on render; Escape emits closed. */
@Component({
  selector: "fc-pro-dialog",
  imports: [ProHeaderComponent],
  host: contents,
  template: `
    <dialog
      #dialog
      class="pro-dialog"
      [attr.aria-labelledby]="id + '-title'"
      [attr.aria-describedby]="id + '-subtitle'"
      (cancel)="$event.preventDefault(); closed.emit()"
      (click)="onClick($event)"
    >
      <!-- The body fills the dialog, so a click that lands on the dialog itself is on the backdrop. -->
      <div class="pro-dialog__body">
        <fc-pro-header
          level="h2"
          [icon]="icon()"
          [title]="title()"
          [subtitle]="subtitle()"
          [titleId]="id + '-title'"
          [subtitleId]="id + '-subtitle'"
        />
        <div class="pro-content"><ng-content /></div>
      </div>
    </dialog>
  `,
})
export class ProDialogComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
  icon = input<string>();
  /** Whether a click outside closes it. The reauth step keeps it, so the reCAPTCHA popup can't dismiss it. */
  lightDismiss = input(false);
  closed = output();
  protected id = uniqueId();
  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog");

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  // A method rather than an inline `a && b` expression: Angular cancels the event when a handler
  // returns false, which would stop the form inside from submitting.
  protected onClick(event: MouseEvent) {
    if (this.lightDismiss() && event.target === this.dialog().nativeElement) this.closed.emit();
  }
}
