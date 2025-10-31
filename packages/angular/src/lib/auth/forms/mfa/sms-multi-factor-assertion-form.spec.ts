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

import {
  SmsMultiFactorAssertionFormComponent,
  SmsMultiFactorAssertionPhoneFormComponent,
  SmsMultiFactorAssertionVerifyFormComponent,
} from "./sms-multi-factor-assertion-form";

import {
  verifyPhoneNumber,
  signInWithMultiFactorAssertion,
  PhoneMultiFactorGenerator,
} from "../../../tests/test-helpers";

describe("<fui-sms-multi-factor-assertion-form>", () => {
  beforeEach(() => {
    const {
      injectTranslation,
      injectUI,
      injectMultiFactorPhoneAuthNumberFormSchema,
      injectMultiFactorPhoneAuthVerifyFormSchema,
      injectRecaptchaVerifier,
    } = require("../../../tests/test-helpers");

    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
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

    injectMultiFactorPhoneAuthNumberFormSchema.mockReturnValue(() => {
      const { z } = require("zod");
      return z.object({
        phoneNumber: z.string().min(1, "Phone number is required"),
      });
    });

    injectMultiFactorPhoneAuthVerifyFormSchema.mockReturnValue(() => {
      const { z } = require("zod");
      return z.object({
        verificationCode: z.string().min(1, "Verification code is required"),
      });
    });

    verifyPhoneNumber.mockResolvedValue("test-verification-id");
    signInWithMultiFactorAssertion.mockResolvedValue({});

    injectRecaptchaVerifier.mockImplementation(() => {
      return () => ({
        clear: jest.fn(),
        render: jest.fn(),
        verify: jest.fn(),
      });
    });

    const { PhoneAuthProvider, PhoneMultiFactorGenerator } = require("firebase/auth");
    PhoneAuthProvider.credential = jest.fn().mockReturnValue({});
    PhoneMultiFactorGenerator.assertion = jest.fn().mockReturnValue({});
  });

  it("renders phone form initially", async () => {
    const mockHint = {
      factorId: PhoneMultiFactorGenerator.FACTOR_ID,
      displayName: "Phone",
      phoneNumber: "+1234567890",
    };

    await render(SmsMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [SmsMultiFactorAssertionFormComponent],
    });

    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+1234567890")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Code" })).toBeInTheDocument();
  });

  it("switches to verify form after phone submission", async () => {
    const mockHint = {
      factorId: PhoneMultiFactorGenerator.FACTOR_ID,
      displayName: "Phone",
      phoneNumber: "+1234567890",
    };

    await render(SmsMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [SmsMultiFactorAssertionFormComponent],
    });

    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Phone Number")).not.toBeInTheDocument();
  });

  it("emits onSuccess when verification is successful", async () => {
    const mockHint = {
      factorId: PhoneMultiFactorGenerator.FACTOR_ID,
      displayName: "Phone",
      phoneNumber: "+1234567890",
    };

    const { fixture } = await render(SmsMultiFactorAssertionFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [SmsMultiFactorAssertionFormComponent],
    });

    const onSuccessSpy = jest.fn();
    fixture.componentInstance.onSuccess.subscribe(onSuccessSpy);

    const phoneFormComponent = fixture.debugElement.query(
      (el) => el.componentInstance?.constructor?.name === "SmsMultiFactorAssertionPhoneFormComponent"
    )?.componentInstance;

    if (phoneFormComponent) {
      phoneFormComponent.form.setFieldValue("phoneNumber", "+1234567890");
      await phoneFormComponent.form.handleSubmit();
    }

    await waitFor(() => {
      expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    });

    const verifyFormComponent = fixture.debugElement.query(
      (el) => el.componentInstance?.constructor?.name === "SmsMultiFactorAssertionVerifyFormComponent"
    )?.componentInstance;

    if (verifyFormComponent) {
      verifyFormComponent.form.setFieldValue("verificationCode", "123456");
      verifyFormComponent.form.setFieldValue("verificationId", "test-verification-id");
      await verifyFormComponent.form.handleSubmit();
    } else {
      fail("Verify form component not found");
    }

    await waitFor(() => {
      expect(onSuccessSpy).toHaveBeenCalled();
    });
  });
});

describe("<fui-sms-multi-factor-assertion-phone-form>", () => {
  beforeEach(() => {
    const {
      injectTranslation,
      injectUI,
      injectMultiFactorPhoneAuthNumberFormSchema,
    } = require("../../../tests/test-helpers");

    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          phoneNumber: "Phone Number",
          sendCode: "Send Code",
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

    injectMultiFactorPhoneAuthNumberFormSchema.mockReturnValue(() => {
      const { z } = require("zod");
      return z.object({
        phoneNumber: z.string().min(1, "Phone number is required"),
      });
    });

    verifyPhoneNumber.mockResolvedValue("test-verification-id");
  });

  it("renders phone form with phone number from hint", async () => {
    const mockHint = {
      factorId: PhoneMultiFactorGenerator.FACTOR_ID,
      displayName: "Phone",
      phoneNumber: "+1234567890",
    };

    await render(SmsMultiFactorAssertionPhoneFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [SmsMultiFactorAssertionPhoneFormComponent],
    });

    const phoneInput = screen.getByLabelText("Phone Number");
    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput).toHaveValue("+1234567890");
  });

  it("emits onSubmit when form is submitted", async () => {
    const mockHint = {
      factorId: PhoneMultiFactorGenerator.FACTOR_ID,
      displayName: "Phone",
      phoneNumber: "+1234567890",
    };

    const { fixture } = await render(SmsMultiFactorAssertionPhoneFormComponent, {
      componentInputs: {
        hint: mockHint,
      },
      imports: [SmsMultiFactorAssertionPhoneFormComponent],
    });

    const onSubmitSpy = jest.fn();
    fixture.componentInstance.onSubmit.subscribe(onSubmitSpy);

    fireEvent.click(screen.getByRole("button", { name: "Send Code" }));

    await waitFor(() => {
      expect(onSubmitSpy).toHaveBeenCalledWith("test-verification-id");
    });
  });
});

describe("<fui-sms-multi-factor-assertion-verify-form>", () => {
  beforeEach(() => {
    const {
      injectTranslation,
      injectUI,
      injectMultiFactorPhoneAuthVerifyFormSchema,
    } = require("../../../tests/test-helpers");

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

    injectMultiFactorPhoneAuthVerifyFormSchema.mockReturnValue(() => {
      const { z } = require("zod");
      return z.object({
        verificationCode: z.string().min(1, "Verification code is required"),
      });
    });

    signInWithMultiFactorAssertion.mockResolvedValue({});

    const { PhoneAuthProvider, PhoneMultiFactorGenerator } = require("firebase/auth");
    PhoneAuthProvider.credential = jest.fn().mockReturnValue({});
    PhoneMultiFactorGenerator.assertion = jest.fn().mockReturnValue({});
  });

  it("renders verification form", async () => {
    await render(SmsMultiFactorAssertionVerifyFormComponent, {
      componentInputs: {
        verificationId: "test-verification-id",
      },
      imports: [SmsMultiFactorAssertionVerifyFormComponent],
    });

    expect(screen.getByLabelText("Verification Code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
  });

  it("emits onSuccess when verification is successful", async () => {
    const { fixture } = await render(SmsMultiFactorAssertionVerifyFormComponent, {
      componentInputs: {
        verificationId: "test-verification-id",
      },
      imports: [SmsMultiFactorAssertionVerifyFormComponent],
    });

    const onSuccessSpy = jest.fn();
    fixture.componentInstance.onSuccess.subscribe(onSuccessSpy);

    const component = fixture.componentInstance;
    component.form.setFieldValue("verificationCode", "123456");
    component.form.setFieldValue("verificationId", "test-verification-id");
    await component.form.handleSubmit();

    await waitFor(() => {
      expect(onSuccessSpy).toHaveBeenCalled();
    });
  });
});
