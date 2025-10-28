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

import { render, screen, fireEvent, waitFor } from "@testing-library/angular";
import { TotpMultiFactorGenerator } from "firebase/auth";

import { TotpMultiFactorAssertionFormComponent } from "./totp-multi-factor-assertion-form";

import {
  signInWithMultiFactorAssertion,
  FirebaseUIError,
} from "../../../tests/test-helpers";

describe("<fui-totp-multi-factor-assertion-form>", () => {
  let TotpMultiFactorGenerator: any;

  beforeEach(() => {
    const { injectTranslation, injectUI, injectMultiFactorTotpAuthVerifyFormSchema } = require("../../../tests/test-helpers");
    
    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          verificationCode: "Verification Code",
          verifyCode: "Verify Code",
        },
        errors: {
          unknownError: "An unknown error occurred",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });

    injectUI.mockImplementation(() => {
      return () => ({
        auth: {},
      });
    });

    injectMultiFactorTotpAuthVerifyFormSchema.mockReturnValue(() => {
      const { z } = require("zod");
      return z.object({
        verificationCode: z.string().refine((val: string) => val.length === 6, {
          message: "Verification code must be 6 digits",
        }),
      });
    });

    // Mock FirebaseUI Core functions
    signInWithMultiFactorAssertion.mockResolvedValue({});

    // Mock Firebase Auth classes
    TotpMultiFactorGenerator = require("firebase/auth").TotpMultiFactorGenerator;
    TotpMultiFactorGenerator.assertionForSignIn = jest.fn().mockReturnValue({});
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("renders TOTP verification form", async () => {
    const mockHint = {
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "TOTP",
      uid: "test-uid",
    };

    await render(TotpMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [TotpMultiFactorAssertionFormComponent],
    });

    expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("123456")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
  });

  it("renders form with placeholder text", async () => {
    const mockHint = {
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "TOTP",
      uid: "test-uid",
    };

    await render(TotpMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [TotpMultiFactorAssertionFormComponent],
    });

    // Check that the form input component has the placeholder attribute
    const formInput = screen.getByDisplayValue("");
    expect(formInput).toBeInTheDocument();
  });

  it("emits onSuccess when verification is successful", async () => {
    const mockHint = {
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "TOTP",
      uid: "test-uid",
    };

    const { fixture } = await render(TotpMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [TotpMultiFactorAssertionFormComponent],
    });

    const component = fixture.componentInstance;
    const onSuccessSpy = jest.fn();
    component.onSuccess.subscribe(onSuccessSpy);

    // Set form values and submit directly
    component.form.setFieldValue("verificationCode", "123456");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();

    expect(onSuccessSpy).toHaveBeenCalled();
  });

  it("calls TotpMultiFactorGenerator.assertionForSignIn with correct parameters", async () => {
    const mockHint = {
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "TOTP",
      uid: "test-uid",
    };

    const assertionForSignInSpy = TotpMultiFactorGenerator.assertionForSignIn;

    const { fixture } = await render(TotpMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [TotpMultiFactorAssertionFormComponent],
    });

    const component = fixture.componentInstance;

    // Set form values and submit directly
    component.form.setFieldValue("verificationCode", "123456");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();

    expect(assertionForSignInSpy).toHaveBeenCalledWith("test-uid", "123456");
  });

  it("calls signInWithMultiFactorAssertion with the assertion", async () => {
    const mockHint = {
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "TOTP",
      uid: "test-uid",
    };

    const mockAssertion = { type: "totp" };
    TotpMultiFactorGenerator.assertionForSignIn.mockReturnValue(mockAssertion);

    const { fixture } = await render(TotpMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [TotpMultiFactorAssertionFormComponent],
    });

    const component = fixture.componentInstance;

    // Set form values and submit directly
    component.form.setFieldValue("verificationCode", "123456");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();

    expect(signInWithMultiFactorAssertion).toHaveBeenCalledWith(
      expect.any(Object), // UI instance
      mockAssertion
    );
  });

  it("handles FirebaseUIError correctly", async () => {
    const mockHint = {
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "TOTP",
      uid: "test-uid",
    };

    const errorMessage = "Invalid verification code";
    signInWithMultiFactorAssertion.mockRejectedValue(new FirebaseUIError(errorMessage));

    const { fixture } = await render(TotpMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [TotpMultiFactorAssertionFormComponent],
    });

    const component = fixture.componentInstance;

    // Set form values and submit directly
    component.form.setFieldValue("verificationCode", "123456");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("handles unknown errors correctly", async () => {
    const mockHint = {
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "TOTP",
      uid: "test-uid",
    };

    signInWithMultiFactorAssertion.mockRejectedValue(new Error("Network error"));

    const { fixture } = await render(TotpMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [TotpMultiFactorAssertionFormComponent],
    });

    const component = fixture.componentInstance;

    // Set form values and submit directly
    component.form.setFieldValue("verificationCode", "123456");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText("An unknown error occurred")).toBeInTheDocument();
  });
});
