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
import { CommonModule } from "@angular/common";
import { TanStackField, TanStackAppField } from "@tanstack/angular-form";
import { PhoneAuthFormComponent, PhoneNumberFormComponent, VerificationFormComponent } from "./phone-auth-form.component";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
  FormActionComponent,
} from "../../../components/form/form.component";
import { UserCredential } from "@angular/fire/auth";

jest.mock("../../../provider", () => ({
  injectUI: jest.fn(),
  injectPhoneAuthFormSchema: jest.fn(),
  injectPhoneAuthVerifyFormSchema: jest.fn(),
  injectTranslation: jest.fn(),
  injectCountries: jest.fn(),
  injectDefaultCountry: jest.fn(),
  injectPolicies: jest.fn(),
}));

jest.mock("@firebase-ui/core", () => ({
  verifyPhoneNumber: jest.fn(),
  confirmPhoneNumber: jest.fn(),
  formatPhoneNumber: jest.fn(),
  countryData: [{ name: "United States", dialCode: "+1", code: "US", emoji: "🇺🇸" }],
  FirebaseUIError: class FirebaseUIError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "FirebaseUIError";
    }
  },
}));

jest.mock("@angular/fire/auth", () => ({
  RecaptchaVerifier: jest.fn().mockImplementation(() => ({
    clear: jest.fn(),
    render: jest.fn(),
  })),
  UserCredential: jest.fn(),
}));

describe("<fui-phone-auth-form />", () => {
  let mockVerifyPhoneNumber: any;
  let mockConfirmPhoneNumber: any;
  let mockFormatPhoneNumber: any;
  let mockFirebaseUIError: any;

  beforeEach(() => {
    const {
      injectUI,
      injectPhoneAuthFormSchema,
      injectPhoneAuthVerifyFormSchema,
      injectTranslation,
      injectCountries,
      injectDefaultCountry,
      injectPolicies,
    } = require("../../../provider");
    const { verifyPhoneNumber, confirmPhoneNumber, formatPhoneNumber, FirebaseUIError } = require("@firebase-ui/core");
    
    mockVerifyPhoneNumber = verifyPhoneNumber;
    mockConfirmPhoneNumber = confirmPhoneNumber;
    mockFormatPhoneNumber = formatPhoneNumber;
    mockFirebaseUIError = FirebaseUIError;

    injectUI.mockReturnValue(() => ({
      app: {},
      auth: {},
      locale: {
        locale: "en-US",
        setLocale: jest.fn(),
      },
      state: "idle",
      setState: jest.fn(),
      behaviors: {},
      multiFactorResolver: undefined,
      setMultiFactorResolver: jest.fn(),
    }));

    injectPhoneAuthFormSchema.mockReturnValue(() => ({
      parse: jest.fn(),
      safeParse: jest.fn(),
    }));

    injectPhoneAuthVerifyFormSchema.mockReturnValue(() => ({
      parse: jest.fn(),
      safeParse: jest.fn(),
    }));

    injectTranslation.mockImplementation((category: string, key: string) => {
      if (category === "labels" && key === "phoneNumber") return () => "Phone Number";
      if (category === "labels" && key === "sendCode") return () => "Send Code";
      if (category === "labels" && key === "verificationCode") return () => "Verification Code";
      if (category === "labels" && key === "verifyCode") return () => "Verify Code";
      if (category === "errors" && key === "unknownError") return () => "Unknown error";
      return () => key;
    });

    injectCountries.mockReturnValue(() => [
      { name: "United States", dialCode: "+1", code: "US", emoji: "🇺🇸" },
    ]);

    injectDefaultCountry.mockReturnValue(() => ({
      name: "United States",
      dialCode: "+1",
      code: "US",
      emoji: "🇺🇸",
    }));

    injectPolicies.mockReturnValue(null);

    mockVerifyPhoneNumber.mockResolvedValue("mock-verification-id");
    mockConfirmPhoneNumber.mockResolvedValue({} as UserCredential);
    mockFormatPhoneNumber.mockImplementation((phoneNumber: string) => `+1${phoneNumber}`);
  });

  it("should render phone number form initially", async () => {
    await render(PhoneAuthFormComponent, {
      imports: [CommonModule, TanStackField, TanStackAppField],
      declarations: [
        PhoneNumberFormComponent,
        VerificationFormComponent,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    expect(screen.getByText("Phone Number")).toBeInTheDocument();
  });

  it("should handle phone number submission", async () => {
    const { fixture } = await render(PhoneAuthFormComponent, {
      imports: [CommonModule, TanStackField, TanStackAppField],
      declarations: [
        PhoneNumberFormComponent,
        VerificationFormComponent,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    const component = fixture.componentInstance;
    const testData = { verificationId: "test-id", phoneNumber: "+1234567890" };
    
    component.handlePhoneSubmit(testData);
    
    expect(component.verificationId()).toBe("test-id");
  });

  it("should conditionally render phone number form when verificationId is null", async () => {
    await render(PhoneAuthFormComponent, {
      imports: [CommonModule, TanStackField, TanStackAppField],
      declarations: [
        PhoneNumberFormComponent,
        VerificationFormComponent,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    // <fui-phone-number-form />
    expect(screen.getByText("Phone Number")).toBeInTheDocument();
    expect(screen.getByText("Send Code")).toBeInTheDocument();
    
    // <fui-verification-form />
    expect(screen.queryByText("Verification Code")).not.toBeInTheDocument();
  });

  it("should conditionally render verification form when verificationId is set", async () => {
    const { fixture } = await render(PhoneAuthFormComponent, {
      imports: [CommonModule, TanStackField, TanStackAppField],
      declarations: [
        PhoneNumberFormComponent,
        VerificationFormComponent,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    const component = fixture.componentInstance;
    component.verificationId.set("test-verification-id");
    fixture.detectChanges();

    // <fui-verification-form />
    expect(screen.getByText("Verification Code")).toBeInTheDocument();
    expect(screen.getByText("Verify Code")).toBeInTheDocument();
    
    // <fui-phone-number-form />
    expect(screen.queryByText("Phone Number")).not.toBeInTheDocument();
  });
});

describe("<fui-phone-number-form />", () => {
  let mockVerifyPhoneNumber: any;
  let mockFormatPhoneNumber: any;

  beforeEach(() => {
    const {
      injectUI,
      injectPhoneAuthFormSchema,
      injectTranslation,
      injectCountries,
      injectDefaultCountry,
      injectPolicies,
    } = require("../../../provider");
    const { verifyPhoneNumber, formatPhoneNumber } = require("@firebase-ui/core");
    
    mockVerifyPhoneNumber = verifyPhoneNumber;
    mockFormatPhoneNumber = formatPhoneNumber;

    injectUI.mockReturnValue(() => ({
      app: {},
      auth: {},
      locale: {
        locale: "en-US",
        setLocale: jest.fn(),
      },
      state: "idle",
      setState: jest.fn(),
      behaviors: {},
      multiFactorResolver: undefined,
      setMultiFactorResolver: jest.fn(),
    }));

    injectPhoneAuthFormSchema.mockReturnValue(() => ({
      parse: jest.fn(),
      safeParse: jest.fn(),
    }));

    injectTranslation.mockImplementation((category: string, key: string) => {
      if (category === "labels" && key === "phoneNumber") return () => "Phone Number";
      if (category === "labels" && key === "sendCode") return () => "Send Code";
      if (category === "labels" && key === "verificationCode") return () => "Verification Code";
      if (category === "labels" && key === "verifyCode") return () => "Verify Code";
      if (category === "errors" && key === "unknownError") return () => "Unknown error";
      return () => key;
    });

    injectCountries.mockReturnValue(() => [
      { name: "United States", dialCode: "+1", code: "US", emoji: "🇺🇸" },
    ]);

    injectDefaultCountry.mockReturnValue(() => ({
      name: "United States",
      dialCode: "+1",
      code: "US",
      emoji: "🇺🇸",
    }));

    injectPolicies.mockReturnValue(null);

    mockVerifyPhoneNumber.mockResolvedValue("mock-verification-id");
    mockFormatPhoneNumber.mockImplementation((phoneNumber: string) => `+1${phoneNumber}`);
  });

  it("should render phone number input", async () => {
    await render(PhoneNumberFormComponent, {
      imports: [CommonModule, TanStackField, TanStackAppField],
      declarations: [
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
    });

    expect(screen.getByText("Phone Number")).toBeInTheDocument();
  });
});

describe("<fui-verification-form />", () => {
  let mockConfirmPhoneNumber: any;

  beforeEach(() => {
    const {
      injectUI,
      injectPhoneAuthVerifyFormSchema,
      injectTranslation,
      injectCountries,
      injectDefaultCountry,
      injectPolicies,
    } = require("../../../provider");
    const { confirmPhoneNumber } = require("@firebase-ui/core");
    
    mockConfirmPhoneNumber = confirmPhoneNumber;

    injectUI.mockReturnValue(() => ({
      app: {},
      auth: {},
      locale: {
        locale: "en-US",
        setLocale: jest.fn(),
      },
      state: "idle",
      setState: jest.fn(),
      behaviors: {},
      multiFactorResolver: undefined,
      setMultiFactorResolver: jest.fn(),
    }));

    injectPhoneAuthVerifyFormSchema.mockReturnValue(() => ({
      parse: jest.fn(),
      safeParse: jest.fn(),
    }));

    injectTranslation.mockImplementation((category: string, key: string) => {
      if (category === "labels" && key === "phoneNumber") return () => "Phone Number";
      if (category === "labels" && key === "sendCode") return () => "Send Code";
      if (category === "labels" && key === "verificationCode") return () => "Verification Code";
      if (category === "labels" && key === "verifyCode") return () => "Verify Code";
      if (category === "errors" && key === "unknownError") return () => "Unknown error";
      return () => key;
    });

    injectCountries.mockReturnValue(() => [
      { name: "United States", dialCode: "+1", code: "US", emoji: "🇺🇸" },
    ]);

    injectDefaultCountry.mockReturnValue(() => ({
      name: "United States",
      dialCode: "+1",
      code: "US",
      emoji: "🇺🇸",
    }));

    injectPolicies.mockReturnValue(null);

    mockConfirmPhoneNumber.mockResolvedValue({} as UserCredential);
  });

  it("should render verification code input", async () => {
    await render(VerificationFormComponent, {
      imports: [CommonModule, TanStackField, TanStackAppField],
      declarations: [
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
      ],
      componentInputs: {
        verificationId: "test-verification-id",
        phoneNumber: "+1234567890",
      },
    });

    expect(screen.getByText("Verification Code")).toBeInTheDocument();
  });
});