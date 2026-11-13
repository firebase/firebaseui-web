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

import { afterNextRender, Component, DestroyRef, type ElementRef, inject, input, viewChild } from "@angular/core";
import { injectUI } from "@firebase-oss/ui-angular";

import {
  ButtonComponent,
  contents,
  ProviderButtonComponent,
  TextFieldComponent,
  TextLinkComponent,
} from "./components";
import { ProReauthDialogComponent } from "./professional/reauth";
import { Reauth, ReauthFlow } from "./reauth";
import { DemoState } from "./state";
import { MfaChallengeComponent } from "./steps/mfa-challenge";

@Component({
  selector: "fc-themed-reauth-dialog",
  imports: [MfaChallengeComponent, TextFieldComponent, ButtonComponent, TextLinkComponent, ProviderButtonComponent],
  host: contents,
  template: `
    <dialog
      #dialog
      class="fc-dialog"
      aria-labelledby="fc-reauth-title"
      (cancel)="$event.preventDefault(); flow().cancel()"
    >
      @if (flow().secondFactor()) {
        <div class="fc-card">
          <fc-mfa-challenge [dialog]="true" (cancelled)="flow().cancel()" (resolved)="flow().confirmed()" />
        </div>
      } @else {
        <form class="fc-card" (submit)="$event.preventDefault(); flow().confirmPassword()">
          <p id="fc-reauth-title" class="fc-prompt">Confirm it's you</p>
          <p class="fc-body">{{ reason() }}</p>
          @if (flow().hasPassword) {
            <div
              fcField
              icon="lock"
              type="password"
              autocomplete="current-password"
              placeholderText="Password"
              [autofocus]="true"
              [value]="flow().password()"
              (valueChange)="flow().password.set($event)"
            ></div>
          }
          @if (flow().hasGoogle) {
            <button fcProvider provider="google" (click)="flow().confirmGoogle()">Continue with Google</button>
          }
          @if (!flow().hasPassword && !flow().hasGoogle) {
            <p class="fc-body">Sign out and sign back in to continue.</p>
          }
          @if (flow().task.error(); as error) {
            <p class="fc-error" role="alert">{{ error }}</p>
          }
          <div class="fc-links">
            <button fcLink (click)="flow().cancel()">Cancel</button>
          </div>
          @if (flow().hasPassword) {
            <div class="fc-actions">
              <button fcButton type="submit" [disabled]="!flow().password()" [loading]="flow().task.pending()">
                Confirm
              </button>
            </div>
          }
        </form>
      }
    </dialog>
  `,
})
export class ThemedReauthDialogComponent {
  reason = input.required<string>();
  flow = input.required<ReauthFlow>();
  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog");

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }
}

/** Rendered by the demo root while a withReauth call waits for the user to confirm who they are. */
@Component({
  selector: "fc-reauth-dialog",
  imports: [ThemedReauthDialogComponent, ProReauthDialogComponent],
  host: contents,
  template: `
    @if (pro) {
      <fc-pro-reauth-dialog [reason]="reason()" [flow]="flow" />
    } @else {
      <fc-themed-reauth-dialog [reason]="reason()" [flow]="flow" />
    }
  `,
})
export class ReauthDialogComponent {
  reason = input.required<string>();
  private ui = injectUI();
  // The dialog is modal, so the theme switcher can't change the theme while it is open.
  protected pro = inject(DemoState).theme() === "professional";
  protected flow = new ReauthFlow(this.ui, inject(Reauth));

  constructor() {
    // The dialog owns any resolver raised by reauth, so closing it never leaves one behind.
    inject(DestroyRef).onDestroy(() => this.ui().setMultiFactorResolver());
  }
}
