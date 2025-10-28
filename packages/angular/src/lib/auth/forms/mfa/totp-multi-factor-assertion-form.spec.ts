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
    const { injectTranslation, injectUI, injectMultiFactorTotpAuthVerifyFormSchema } = require("../../../provider");
    
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

    const onSuccessSpy = jest.fn();
    fixture.componentInstance.onSuccess.subscribe(onSuccessSpy);

    // Fill in verification code and submit
    fireEvent.change(screen.getByLabelText("Verification Code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(onSuccessSpy).toHaveBeenCalled();
    });
  });

  it("calls TotpMultiFactorGenerator.assertionForSignIn with correct parameters", async () => {
    const mockHint = {
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "TOTP",
      uid: "test-uid",
    };

    const assertionForSignInSpy = TotpMultiFactorGenerator.assertionForSignIn;

    await render(TotpMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [TotpMultiFactorAssertionFormComponent],
    });

    // Fill in verification code and submit
    fireEvent.change(screen.getByLabelText("Verification Code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(assertionForSignInSpy).toHaveBeenCalledWith("test-uid", "123456");
    });
  });

  it("calls signInWithMultiFactorAssertion with the assertion", async () => {
    const mockHint = {
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "TOTP",
      uid: "test-uid",
    };

    const mockAssertion = { type: "totp" };
    TotpMultiFactorGenerator.assertionForSignIn.mockReturnValue(mockAssertion);

    await render(TotpMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [TotpMultiFactorAssertionFormComponent],
    });

    // Fill in verification code and submit
    fireEvent.change(screen.getByLabelText("Verification Code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(signInWithMultiFactorAssertion).toHaveBeenCalledWith(
        expect.any(Object), // UI instance
        mockAssertion
      );
    });
  });

  it("handles FirebaseUIError correctly", async () => {
    const mockHint = {
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "TOTP",
      uid: "test-uid",
    };

    const errorMessage = "Invalid verification code";
    signInWithMultiFactorAssertion.mockRejectedValue(new FirebaseUIError(errorMessage));

    await render(TotpMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [TotpMultiFactorAssertionFormComponent],
    });

    // Fill in verification code and submit
    fireEvent.change(screen.getByLabelText("Verification Code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("handles unknown errors correctly", async () => {
    const mockHint = {
      factorId: TotpMultiFactorGenerator.FACTOR_ID,
      displayName: "TOTP",
      uid: "test-uid",
    };

    signInWithMultiFactorAssertion.mockRejectedValue(new Error("Network error"));

    await render(TotpMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [TotpMultiFactorAssertionFormComponent],
    });

    // Fill in verification code and submit
    fireEvent.change(screen.getByLabelText("Verification Code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByText("An unknown error occurred")).toBeInTheDocument();
    });
  });
});
