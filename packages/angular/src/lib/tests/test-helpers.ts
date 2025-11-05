// Mock implementations for @invertase/firebaseui-core to avoid ESM issues in tests
export const sendPasswordResetEmail = jest.fn();
export const sendSignInLinkToEmail = jest.fn();
export const completeEmailLinkSignIn = jest.fn();
export const signInWithEmailAndPassword = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();

export class FirebaseUIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirebaseUIError";
  }
}

export const getTranslation = jest.fn();
export const hasBehavior = jest.fn();
export const signInWithProvider = jest.fn();
export const verifyPhoneNumber = jest.fn();
export const confirmPhoneNumber = jest.fn();
export const formatPhoneNumber = jest.fn();
export const generateTotpSecret = jest.fn();
export const enrollWithMultiFactorAssertion = jest.fn();
export const generateTotpQrCode = jest.fn();

// Mock Firebase Auth classes
export const TotpMultiFactorGenerator = {
  FACTOR_ID: "totp",
  assertionForSignIn: jest.fn(),
  assertionForEnrollment: jest.fn(),
};

export const PhoneMultiFactorGenerator = {
  FACTOR_ID: "phone",
  assertionForSignIn: jest.fn(),
  assertionForEnrollment: jest.fn(),
  assertion: jest.fn(),
};

export const PhoneAuthProvider = {
  credential: jest.fn(),
};

export const multiFactor = jest.fn(() => ({
  enroll: jest.fn(),
  unenroll: jest.fn(),
  getEnrolledFactors: jest.fn(),
}));

export const signInWithMultiFactorAssertion = jest.fn();

// Mock FactorId enum
export const FactorId = {
  TOTP: "totp",
  PHONE: "phone",
};

export const countryData = [
  { name: "United States", dialCode: "+1", code: "US", emoji: "🇺🇸" },
  { name: "Canada", dialCode: "+1", code: "CA", emoji: "🇨🇦" },
  { name: "United Kingdom", dialCode: "+44", code: "GB", emoji: "🇬🇧" },
];

export const injectUI = jest.fn().mockReturnValue(() => ({
  app: {},
  auth: {},
  locale: {
    locale: "en-US",
    translations: {
      labels: {
        emailAddress: "Email Address",
        password: "Password",
        signIn: "Sign In",
        signUp: "Sign Up",
        forgotPassword: "Forgot Password",
        sendSignInLink: "Send Sign In Link",
        resetPassword: "Reset Password",
        backToSignIn: "Back to Sign In",
        termsOfService: "Terms of Service",
        privacyPolicy: "Privacy Policy",
      },
      messages: {
        signInLinkSent: "Check your email for a sign in link",
        checkEmailForReset: "Check your email for a password reset link",
        termsAndPrivacy: "By continuing, you agree to our {tos} and {privacy}",
      },
      prompts: {
        noAccount: "Don't have an account?",
        signInToAccount: "Sign in to your account",
      },
      errors: {
        unknownError: "An unknown error occurred",
        invalidEmail: "Please enter a valid email address",
        invalidPassword: "Please enter a valid password",
      },
    },
    fallback: undefined,
  },
}));

export const injectTranslation = jest.fn().mockImplementation((category: string, key: string) => {
  const mockTranslations: Record<string, Record<string, string>> = {
    labels: {
      emailAddress: "Email Address",
      password: "Password",
      signIn: "Sign In",
      signUp: "Sign Up",
      forgotPassword: "Forgot Password",
      sendSignInLink: "Send Sign In Link",
      resetPassword: "Reset Password",
      backToSignIn: "Back to Sign In",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      phoneNumber: "Phone Number",
      sendCode: "Send Verification Code",
      verificationCode: "Verification Code",
      verifyCode: "Verify Code",
      displayName: "Display Name",
      createAccount: "Create Account",
      generateQrCode: "Generate QR Code",
      mfaSmsVerification: "SMS Verification",
      mfaTotpVerification: "TOTP Verification",
    },
    messages: {
      signInLinkSent: "Check your email for a sign in link",
      checkEmailForReset: "Check your email for a password reset link",
      termsAndPrivacy: "By continuing, you agree to our {tos} and {privacy}",
    },
    prompts: {
      noAccount: "Don't have an account?",
      signInToAccount: "Sign in to your account",
      haveAccount: "Already have an account?",
    },
    errors: {
      unknownError: "An unknown error occurred",
      invalidEmail: "Please enter a valid email address",
      invalidPassword: "Please enter a valid password",
      userNotAuthenticated: "User must be authenticated to enroll with multi-factor authentication",
      invalidPhoneNumber: "Invalid phone number",
      invalidVerificationCode: "Invalid verification code",
    },
  };
  return () => mockTranslations[category]?.[key] || `${category}.${key}`;
});

export const injectPolicies = jest.fn().mockReturnValue({
  termsOfServiceUrl: "https://example.com/terms",
  privacyPolicyUrl: "https://example.com/privacy",
});

export const injectRedirectError = jest.fn().mockImplementation(() => {
  return () => undefined;
});

// TODO(ehesp): Unfortunately, we cannot use the real schemas here because of the ESM-only dependency on nanostores in @invertase/firebaseui-core - this is a little
// risky as schema updates and tests need aligning, but this is a workaround for now.

export const createForgotPasswordAuthFormSchema = jest.fn(() => {
  const { z } = require("zod");
  return z.object({
    email: z.string().email("Please enter a valid email address"),
  });
});

export const createEmailLinkAuthFormSchema = jest.fn(() => {
  const { z } = require("zod");
  return z.object({
    email: z.string().email("Please enter a valid email address"),
  });
});

export const createSignInAuthFormSchema = jest.fn(() => {
  const { z } = require("zod");
  return z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  });
});

export const createSignUpAuthFormSchema = jest.fn(() => {
  const { z } = require("zod");
  return z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    displayName: z.string().optional(),
  });
});

export const injectForgotPasswordAuthFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    email: z.string().email("Please enter a valid email address"),
  });
});

export const injectEmailLinkAuthFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    email: z.string().email("Please enter a valid email address"),
  });
});

export const injectSignInAuthFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  });
});

export const injectSignUpAuthFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    displayName: z.string().optional(),
  });
});

export const injectPhoneAuthFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    phoneNumber: z.string().min(1, "Phone number is required"),
  });
});

export const injectPhoneAuthVerifyFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    verificationCode: z.string().min(1, "Verification code is required"),
  });
});

export const injectMultiFactorPhoneAuthNumberFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    displayName: z.string().min(1, "Display name is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
  });
});

export const injectMultiFactorPhoneAuthAssertionFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    phoneNumber: z.string().min(1, "Phone number is required"),
  });
});

export const injectMultiFactorPhoneAuthVerifyFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    verificationCode: z.string().min(1, "Verification code is required"),
  });
});

export const injectMultiFactorTotpAuthNumberFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    displayName: z.string().min(1, "Display name is required"),
  });
});

export const injectMultiFactorTotpAuthVerifyFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    verificationCode: z.string().refine((val: string) => val.length === 6, {
      message: "Verification code must be 6 digits",
    }),
  });
});

export const injectMultiFactorTotpAuthEnrollmentFormSchema = jest.fn().mockReturnValue(() => {
  const { z } = require("zod");
  return z.object({
    displayName: z.string().min(1, "Display name is required"),
  });
});

export const injectCountries = jest.fn().mockReturnValue(() => countryData);
export const injectDefaultCountry = jest.fn().mockReturnValue(() => "US");

export const injectRecaptchaVerifier = jest.fn().mockImplementation(() => {
  return () => ({
    clear: jest.fn(),
    render: jest.fn(),
    verify: jest.fn(),
  });
});

export const RecaptchaVerifier = jest.fn().mockImplementation(() => ({
  clear: jest.fn(),
  render: jest.fn(),
  verify: jest.fn(),
}));

export const UserCredential = jest.fn();

// TODO(ehesp): We can't use the real providers here because of the ESM-only dependency with angular-fire.

export const FacebookAuthProvider = class FacebookAuthProvider {
  providerId = "facebook.com";
};

export const GoogleAuthProvider = class GoogleAuthProvider {
  providerId = "google.com";
};

export const TwitterAuthProvider = class TwitterAuthProvider {
  providerId = "twitter.com";
};

export const GithubAuthProvider = class GithubAuthProvider {
  providerId = "github.com";
};

export const MicrosoftAuthProvider = class MicrosoftAuthProvider {
  providerId = "microsoft.com";
};

export const OAuthProvider = class OAuthProvider {
  providerId: string;
  constructor(providerId: string) {
    this.providerId = providerId;
  }
};
