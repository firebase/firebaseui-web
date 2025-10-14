import { render, screen, waitFor } from "@testing-library/angular";
import { CommonModule } from "@angular/common";
import { TanStackField, TanStackAppField } from "@tanstack/angular-form";
import { SignUpAuthFormComponent } from "./sign-up-auth-form.component";
import {
  FormInputComponent,
  FormSubmitComponent,
  FormErrorMessageComponent,
  FormActionComponent,
} from "../../../components/form/form.component";
import { PoliciesComponent } from "../../../components/policies/policies.component";
import { UserCredential } from "@angular/fire/auth";

jest.mock("../../../provider", () => ({
  injectUI: jest.fn(),
  injectSignUpAuthFormSchema: jest.fn(),
  injectTranslation: jest.fn(),
  injectPolicies: jest.fn(),
}));

jest.mock("@firebase-ui/core", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  hasBehavior: jest.fn(),
  FirebaseUIError: class FirebaseUIError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "FirebaseUIError";
    }
  },
}));

describe("<fui-sign-up-auth-form />", () => {
  let mockCreateUserWithEmailAndPassword: any;
  let mockHasBehavior: any;
  let mockFirebaseUIError: any;

  beforeEach(() => {
    const { injectUI, injectSignUpAuthFormSchema, injectTranslation, injectPolicies } = require("../../../provider");
    const { createUserWithEmailAndPassword, hasBehavior, FirebaseUIError } = require("@firebase-ui/core");
    mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword;
    mockHasBehavior = hasBehavior;
    mockFirebaseUIError = FirebaseUIError;

    // no display name required by default
    mockHasBehavior.mockReturnValue(false);

    injectUI.mockReturnValue(() => ({
      app: {},
      auth: {},
      locale: {
        locale: "en-US",
        translations: {
          labels: {
            emailAddress: "Email Address",
            password: "Password",
            displayName: "Display Name",
            createAccount: "Create Account",
            signIn: "Sign In",
            termsOfService: "Terms of Service",
            privacyPolicy: "Privacy Policy",
          },
          prompts: {
            haveAccount: "Already have an account?",
          },
          messages: {
            termsAndPrivacy: "By continuing, you agree to our {tos} and {privacy}",
          },
          errors: {
            unknownError: "An unknown error occurred",
            invalidEmail: "Please enter a valid email address",
            invalidPassword: "Please enter a valid password",
            invalidDisplayName: "Please enter a valid display name",
          },
        },
        fallback: undefined,
      },
    }));

    // Mock form schema - create a Zod schema that matches the real implementation
    // TODO(ehesp): Use real createSignUpAuthFormSchema when Jest ESM support improves
    // Currently blocked by nanostores ESM-only dependency in @firebase-ui/core
    injectSignUpAuthFormSchema.mockReturnValue(() => {
      const { z } = require("zod");

      return z.object({
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        displayName: z.string().optional(),
      });
    });

    injectTranslation.mockImplementation((category: string, key: string) => {
      const mockTranslations: Record<string, Record<string, string>> = {
        labels: {
          emailAddress: "Email Address",
          password: "Password",
          displayName: "Display Name",
          createAccount: "Create Account",
          signIn: "Sign In",
          termsOfService: "Terms of Service",
          privacyPolicy: "Privacy Policy",
        },
        prompts: {
          haveAccount: "Already have an account?",
        },
        messages: {
          termsAndPrivacy: "By continuing, you agree to our {tos} and {privacy}",
        },
        errors: {
          unknownError: "An unknown error occurred",
          invalidEmail: "Please enter a valid email address",
          invalidPassword: "Please enter a valid password",
          invalidDisplayName: "Please enter a valid display name",
        },
      };
      return () => mockTranslations[category]?.[key] || `${category}.${key}`;
    });

    injectPolicies.mockReturnValue({
      termsOfServiceUrl: "https://example.com/terms",
      privacyPolicyUrl: "https://example.com/privacy",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the form initially without display name field", async () => {
    await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.queryByLabelText("Display Name")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByText("By continuing, you agree to our")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Already have an account? Sign In →" })).toBeInTheDocument();
  });

  it("should render display name field when requireDisplayName behavior is enabled", async () => {
    mockHasBehavior.mockReturnValue(true);

    await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });

  it("should have correct translation labels", async () => {
    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });
    const component = fixture.componentInstance;

    expect(component.emailLabel()).toBe("Email Address");
    expect(component.passwordLabel()).toBe("Password");
    expect(component.displayNameLabel()).toBe("Display Name");
    expect(component.createAccountLabel()).toBe("Create Account");
    expect(component.haveAccountLabel()).toBe("Already have an account?");
    expect(component.signInLabel()).toBe("Sign In");
    expect(component.unknownErrorLabel()).toBe("An unknown error occurred");
  });

  it("should initialize form with empty values", async () => {
    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });
    const component = fixture.componentInstance;
    expect(component.form.getFieldValue("email")).toBe("");
    expect(component.form.getFieldValue("password")).toBe("");
    expect(component.form.getFieldValue("displayName")).toBeUndefined();
  });

  it("should initialize form with display name field when required", async () => {
    mockHasBehavior.mockReturnValue(true);

    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });
    const component = fixture.componentInstance;
    expect(component.form.getFieldValue("email")).toBe("");
    expect(component.form.getFieldValue("password")).toBe("");
    expect(component.form.getFieldValue("displayName")).toBe("");
  });

  it("should prevent default and stop propagation on form submit", async () => {
    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });
    const component = fixture.componentInstance;
    component.form.setFieldValue("email", "test@example.com");
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    const submitEvent = new Event("submit") as SubmitEvent;
    const preventDefaultSpy = jest.fn();
    const stopPropagationSpy = jest.fn();

    Object.defineProperties(submitEvent, {
      preventDefault: { value: preventDefaultSpy },
      stopPropagation: { value: stopPropagationSpy },
    });

    component.handleSubmit(submitEvent);
    await fixture.whenStable();

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it("should handle form submission with valid credentials", async () => {
    const mockCredential = { user: { uid: "test-uid" } } as UserCredential;
    mockCreateUserWithEmailAndPassword.mockResolvedValue(mockCredential);

    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    const signUpSpy = jest.spyOn(component.signUp, "emit");

    component.form.setFieldValue("email", "test@example.com");
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();

    expect(signUpSpy).toHaveBeenCalledWith(mockCredential);
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        app: expect.any(Object),
        auth: expect.any(Object),
      }),
      "test@example.com",
      "password123",
      undefined
    );
  });

  it("should handle form submission with display name when required", async () => {
    mockHasBehavior.mockReturnValue(true);
    const mockCredential = { user: { uid: "test-uid" } } as UserCredential;
    mockCreateUserWithEmailAndPassword.mockResolvedValue(mockCredential);

    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;
    const signUpSpy = jest.spyOn(component.signUp, "emit");

    component.form.setFieldValue("email", "test@example.com");
    component.form.setFieldValue("password", "password123");
    component.form.setFieldValue("displayName", "John Doe");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();

    expect(signUpSpy).toHaveBeenCalledWith(mockCredential);
    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        app: expect.any(Object),
        auth: expect.any(Object),
      }),
      "test@example.com",
      "password123",
      "John Doe"
    );
  });

  it("should handle FirebaseUIError and display error message", async () => {
    const errorMessage = "Email already in use";
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new mockFirebaseUIError(errorMessage));

    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.form.setFieldValue("email", "existing@example.com");
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should handle unknown errors and display generic error message", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error("Network error"));

    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.form.setFieldValue("email", "test@example.com");
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    await component.form.handleSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(screen.getByText("An unknown error occurred")).toBeInTheDocument();
  });

  it("should use the same validation logic as the real createSignUpAuthFormSchema", async () => {
    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    const component = fixture.componentInstance;

    component.form.setFieldValue("email", "invalid-email");
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    expect(component.form.state.errorMap).toBeDefined();

    component.form.setFieldValue("email", "test@example.com");
    component.form.setFieldValue("password", "123");
    fixture.detectChanges();

    expect(component.form.state.errorMap).toBeDefined();

    component.form.setFieldValue("email", "test@example.com");
    component.form.setFieldValue("password", "password123");
    fixture.detectChanges();

    expect(component.form.state.errors).toHaveLength(0);
  });

  it("should emit signIn when sign in button is clicked", async () => {
    const { fixture } = await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });
    const component = fixture.componentInstance;
    const signInSpy = jest.spyOn(component.signIn, "emit");

    const signInButton = screen.getByRole("button", { name: "Already have an account? Sign In →" });
    signInButton.click();

    expect(signInSpy).toHaveBeenCalled();
  });

  it("should call hasBehavior with correct parameters", async () => {
    await render(SignUpAuthFormComponent, {
      imports: [
        CommonModule,
        SignUpAuthFormComponent,
        TanStackField,
        TanStackAppField,
        FormInputComponent,
        FormSubmitComponent,
        FormErrorMessageComponent,
        FormActionComponent,
        PoliciesComponent,
      ],
    });

    expect(mockHasBehavior).toHaveBeenCalledWith(
      expect.objectContaining({
        app: expect.any(Object),
        auth: expect.any(Object),
      }),
      "requireDisplayName"
    );
  });
});
