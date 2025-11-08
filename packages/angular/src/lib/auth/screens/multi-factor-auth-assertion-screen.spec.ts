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

import { render, screen } from "@testing-library/angular";
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { MultiFactorAuthAssertionScreenComponent } from "./multi-factor-auth-assertion-screen";
import { MultiFactorAuthAssertionFormComponent } from "../forms/multi-factor-auth-assertion-form";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";

@Component({
  template: `<fui-multi-factor-auth-assertion-screen></fui-multi-factor-auth-assertion-screen>`,
  standalone: true,
  imports: [MultiFactorAuthAssertionScreenComponent],
})
class TestHostWithoutContentComponent {}

describe("<fui-multi-factor-auth-assertion-screen>", () => {
  beforeEach(() => {
    const { injectTranslation, injectUI } = require("../../../provider");
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          multiFactorAssertion: "Multi-Factor Assertion",
        },
        prompts: {
          mfaAssertionPrompt: "Verify your multi-factor authentication",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });

    injectUI.mockImplementation(() => () => ({
      multiFactorResolver: {
        auth: {},
        session: null,
        hints: [],
      },
    }));
  });

  it("renders with correct title and subtitle", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(screen.getByRole("heading", { name: "Multi-Factor Assertion" })).toBeInTheDocument();
    expect(screen.getByText("Verify your multi-factor authentication")).toBeInTheDocument();
  });

  it("includes the MultiFactorAuthAssertionForm component", async () => {
    TestBed.overrideComponent(MultiFactorAuthAssertionFormComponent, {
      set: {
        template: '<div data-testid="mfa-assertion-form">MFA Assertion Form</div>',
      },
    });

    await render(TestHostWithoutContentComponent, {
      imports: [
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const form = screen.getByTestId("mfa-assertion-form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveTextContent("MFA Assertion Form");
  });

  it("has correct CSS classes", async () => {
    const { container } = await render(TestHostWithoutContentComponent, {
      imports: [
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(container.querySelector(".fui-screen")).toBeInTheDocument();
    expect(container.querySelector(".fui-card")).toBeInTheDocument();
    expect(container.querySelector(".fui-card__header")).toBeInTheDocument();
    expect(container.querySelector(".fui-card__title")).toBeInTheDocument();
    expect(container.querySelector(".fui-card__subtitle")).toBeInTheDocument();
    expect(container.querySelector(".fui-card__content")).toBeInTheDocument();
  });

  it("calls injectTranslation with correct parameters", async () => {
    const { injectTranslation } = require("../../../provider");
    await render(TestHostWithoutContentComponent, {
      imports: [
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(injectTranslation).toHaveBeenCalledWith("labels", "multiFactorAssertion");
    expect(injectTranslation).toHaveBeenCalledWith("prompts", "mfaAssertionPrompt");
  });

  it("emits onSuccess event when form emits onSuccess", async () => {
    TestBed.overrideComponent(MultiFactorAuthAssertionFormComponent, {
      set: {
        template: '<div data-testid="mfa-assertion-form">MFA Assertion Form</div>',
      },
    });

    const { fixture } = await render(TestHostWithoutContentComponent, {
      imports: [
        MultiFactorAuthAssertionScreenComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const component = fixture.debugElement.query(
      (el) => el.name === "fui-multi-factor-auth-assertion-screen"
    ).componentInstance;
    const onSuccessSpy = jest.spyOn(component.onSuccess, "emit");

    const formComponent = fixture.debugElement.query(
      (el) => el.name === "fui-multi-factor-auth-assertion-form"
    ).componentInstance;
    formComponent.onSuccess.emit({ user: { uid: "mfa-user" } });

    expect(onSuccessSpy).toHaveBeenCalledTimes(1);
    expect(onSuccessSpy).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ uid: "mfa-user" }) })
    );
  });
});

