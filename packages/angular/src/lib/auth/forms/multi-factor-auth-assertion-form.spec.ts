/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { render, screen, fireEvent } from "@testing-library/angular";
import { TestBed } from "@angular/core/testing";
import { PhoneMultiFactorGenerator, TotpMultiFactorGenerator } from "firebase/auth";

import { MultiFactorAuthAssertionFormComponent } from "./multi-factor-auth-assertion-form";
import { SmsMultiFactorAssertionFormComponent } from "./mfa/sms-multi-factor-assertion-form";
import { TotpMultiFactorAssertionFormComponent } from "./mfa/totp-multi-factor-assertion-form";

describe("<fui-multi-factor-auth-assertion-form>", () => {
  beforeEach(() => {
    const { injectTranslation, injectUI } = require("../../../provider");
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          mfaSmsVerification: "SMS Verification",
          mfaTotpVerification: "TOTP Verification",
        },
        prompts: {
          mfaAssertionFactorPrompt: "Please choose a multi-factor authentication method",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });

    injectUI.mockImplementation(() => {
      return () => ({
        multiFactorResolver: {
          hints: [
            {
              factorId: PhoneMultiFactorGenerator.FACTOR_ID,
              displayName: "Phone",
            },
            {
              factorId: TotpMultiFactorGenerator.FACTOR_ID,
              displayName: "TOTP",
            },
          ],
        },
      });
    });
  });

  it("renders selection UI when multiple hints are available", async () => {
    TestBed.overrideComponent(SmsMultiFactorAssertionFormComponent, {
      set: {
        template: '<div data-testid="sms-assertion-form">SMS Assertion Form</div>',
      },
    });
    TestBed.overrideComponent(TotpMultiFactorAssertionFormComponent, {
      set: {
        template: '<div data-testid="totp-assertion-form">TOTP Assertion Form</div>',
      },
    });

    await render(MultiFactorAuthAssertionFormComponent, {
      imports: [MultiFactorAuthAssertionFormComponent],
    });

    expect(screen.getByText("Please choose a multi-factor authentication method")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SMS Verification" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "TOTP Verification" })).toBeInTheDocument();

    expect(screen.queryByTestId("sms-assertion-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("totp-assertion-form")).not.toBeInTheDocument();
  });

  it("auto-selects single hint when only one is available", async () => {
    const { injectUI } = require("../../../provider");
    injectUI.mockImplementation(() => {
      return () => ({
        multiFactorResolver: {
          hints: [
            {
              factorId: PhoneMultiFactorGenerator.FACTOR_ID,
              displayName: "Phone",
            },
          ],
        },
      });
    });

    TestBed.overrideComponent(SmsMultiFactorAssertionFormComponent, {
      set: {
        template: '<div data-testid="sms-assertion-form">SMS Assertion Form</div>',
      },
    });
    TestBed.overrideComponent(TotpMultiFactorAssertionFormComponent, {
      set: {
        template: '<div data-testid="totp-assertion-form">TOTP Assertion Form</div>',
      },
    });

    await render(MultiFactorAuthAssertionFormComponent, {
      imports: [MultiFactorAuthAssertionFormComponent],
    });

    expect(screen.getByTestId("sms-assertion-form")).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "SMS Verification" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "TOTP Verification" })).not.toBeInTheDocument();
  });

  it("switches to assertion form when selection button is clicked", async () => {
    TestBed.overrideComponent(SmsMultiFactorAssertionFormComponent, {
      set: {
        template: '<div data-testid="sms-assertion-form">SMS Assertion Form</div>',
      },
    });
    TestBed.overrideComponent(TotpMultiFactorAssertionFormComponent, {
      set: {
        template: '<div data-testid="totp-assertion-form">TOTP Assertion Form</div>',
      },
    });

    await render(MultiFactorAuthAssertionFormComponent, {
      imports: [MultiFactorAuthAssertionFormComponent],
    });

    expect(screen.getByRole("button", { name: "SMS Verification" })).toBeInTheDocument();
    expect(screen.queryByTestId("sms-assertion-form")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "SMS Verification" }));

    expect(screen.getByTestId("sms-assertion-form")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "SMS Verification" })).not.toBeInTheDocument();
  });

  it("throws error when no resolver is provided", async () => {
    const { injectUI } = require("../../../provider");
    injectUI.mockImplementation(() => {
      return () => ({
        multiFactorResolver: null,
      });
    });

    await expect(
      render(MultiFactorAuthAssertionFormComponent, {
        imports: [MultiFactorAuthAssertionFormComponent],
      })
    ).rejects.toThrow("MultiFactorAuthAssertionForm requires a multi-factor resolver");
  });
});
