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
import { MultiFactorAuthEnrollmentScreenComponent } from "./multi-factor-auth-enrollment-screen";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "../../components/card";
import { FactorId } from "firebase/auth";

@Component({
  selector: "fui-multi-factor-auth-enrollment-form",
  template: '<div class="fui-content">MFA Enrollment Form</div>',
  standalone: true,
})
class MockMultiFactorAuthEnrollmentFormComponent {}

@Component({
  template: `<fui-multi-factor-auth-enrollment-screen></fui-multi-factor-auth-enrollment-screen>`,
  standalone: true,
  imports: [MultiFactorAuthEnrollmentScreenComponent],
})
class TestHostWithoutContentComponent {}

describe("<fui-multi-factor-auth-enrollment-screen>", () => {
  beforeEach(() => {
    const { injectTranslation } = require("../../../provider");
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          multiFactorEnrollment: "Multi-Factor Enrollment",
        },
        prompts: {
          mfaEnrollmentPrompt: "Set up multi-factor authentication for your account",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });
  });

  it("renders with correct title and subtitle", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        MultiFactorAuthEnrollmentScreenComponent,
        MockMultiFactorAuthEnrollmentFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(screen.getByRole("heading", { name: "Multi-Factor Enrollment" })).toBeInTheDocument();
    expect(screen.getByText("Set up multi-factor authentication for your account")).toBeInTheDocument();
  });

  it("includes the MultiFactorAuthEnrollmentForm component", async () => {
    await render(TestHostWithoutContentComponent, {
      imports: [
        MultiFactorAuthEnrollmentScreenComponent,
        MockMultiFactorAuthEnrollmentFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const form = screen.getByRole("button", { name: "labels.mfaTotpVerification" });
    expect(form).toBeInTheDocument();
    expect(form.parentElement).toHaveTextContent("labels.mfaTotpVerification labels.mfaSmsVerification");
  });

  it("has correct CSS classes", async () => {
    const { container } = await render(TestHostWithoutContentComponent, {
      imports: [
        MultiFactorAuthEnrollmentScreenComponent,
        MockMultiFactorAuthEnrollmentFormComponent,
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
        MultiFactorAuthEnrollmentScreenComponent,
        MockMultiFactorAuthEnrollmentFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    expect(injectTranslation).toHaveBeenCalledWith("labels", "multiFactorEnrollment");
    expect(injectTranslation).toHaveBeenCalledWith("prompts", "mfaEnrollmentPrompt");
  });

  it("passes hints to the form component", async () => {
    const { fixture } = await render(MultiFactorAuthEnrollmentScreenComponent, {
      imports: [
        MultiFactorAuthEnrollmentScreenComponent,
        MockMultiFactorAuthEnrollmentFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
      componentInputs: {
        hints: [FactorId.TOTP, FactorId.PHONE],
      },
    });

    const component = fixture.componentInstance;
    expect(component.hints()).toEqual([FactorId.TOTP, FactorId.PHONE]);
  });

  it("emits onEnrollment event", async () => {
    const { fixture } = await render(MultiFactorAuthEnrollmentScreenComponent, {
      imports: [
        MultiFactorAuthEnrollmentScreenComponent,
        MockMultiFactorAuthEnrollmentFormComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardSubtitleComponent,
        CardContentComponent,
      ],
    });

    const component = fixture.componentInstance;
    const enrollmentSpy = jest.spyOn(component.onEnrollment, "emit");

    component.onEnrollment.emit();
    expect(enrollmentSpy).toHaveBeenCalled();
  });
});
