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

import { type Translations } from "../types";

/** Polish PL (pl-PL) translation set. */
export const plPL = {
  errors: {
    userNotFound: "Nie znaleziono konta z tym adresem e-mail",
    wrongPassword: "Nieprawidłowe hasło",
    invalidEmail: "Wprowadź prawidłowy adres e-mail",
    userDisabled: "To konto zostało wyłączone",
    networkRequestFailed: "Nie można połączyć się z serwerem. Sprawdź połączenie z internetem",
    tooManyRequests: "Zbyt wiele nieudanych prób. Spróbuj ponownie później",
    missingVerificationCode: "Wprowadź kod weryfikacyjny",
    emailAlreadyInUse: "Konto z tym adresem e-mail już istnieje",
    invalidCredential: "Podane dane uwierzytelniające są nieprawidłowe.",
    weakPassword: "Hasło musi mieć co najmniej 6 znaków",
    unverifiedEmail: "Zweryfikuj swój adres e-mail, aby kontynuować.",
    operationNotAllowed: "Ta operacja jest niedozwolona. Skontaktuj się z pomocą techniczną.",
    invalidPhoneNumber: "Numer telefonu jest nieprawidłowy",
    missingPhoneNumber: "Podaj numer telefonu",
    quotaExceeded: "Przekroczono limit SMS. Spróbuj ponownie później",
    codeExpired: "Kod weryfikacyjny wygasł",
    captchaCheckFailed: "Weryfikacja reCAPTCHA nie powiodła się. Spróbuj ponownie.",
    missingVerificationId: "Najpierw ukończ weryfikację reCAPTCHA.",
    missingEmail: "Podaj adres e-mail",
    invalidActionCode: "Link do resetowania hasła jest nieprawidłowy lub wygasł",
    credentialAlreadyInUse: "Konto z tym adresem e-mail już istnieje. Zaloguj się na to konto.",
    requiresRecentLogin: "Ta operacja wymaga niedawnego logowania. Zaloguj się ponownie.",
    providerAlreadyLinked: "Ten numer telefonu jest już powiązany z innym kontem",
    invalidVerificationCode: "Nieprawidłowy kod weryfikacyjny. Spróbuj ponownie",
    unknownError: "Wystąpił nieoczekiwany błąd",
    popupClosed: "Okno logowania zostało zamknięte. Spróbuj ponownie.",
    accountExistsWithDifferentCredential:
      "Konto z tym adresem e-mail już istnieje. Zaloguj się przy użyciu oryginalnego dostawcy.",
    displayNameRequired: "Podaj nazwę wyświetlaną",
    secondFactorAlreadyInUse: "Ten numer telefonu jest już zarejestrowany na tym koncie.",
  },
  messages: {
    passwordResetEmailSent: "E-mail do resetowania hasła został wysłany",
    signInLinkSent: "Link do logowania został wysłany",
    verificationCodeFirst: "Najpierw poproś o kod weryfikacyjny",
    checkEmailForReset: "Sprawdź e-mail w celu uzyskania instrukcji resetowania hasła",
    dividerOr: "lub",
    termsAndPrivacy: "Kontynuując, akceptujesz nasze {tos} i {privacy}.",
    mfaSmsAssertionPrompt:
      "Kod weryfikacyjny zostanie wysłany na numer {phoneNumber} w celu ukończenia procesu uwierzytelniania.",
  },
  labels: {
    emailAddress: "Adres e-mail",
    password: "Hasło",
    displayName: "Nazwa wyświetlana",
    forgotPassword: "Nie pamiętasz hasła?",
    signUp: "Zarejestruj się",
    signIn: "Zaloguj się",
    resetPassword: "Zresetuj hasło",
    createAccount: "Utwórz konto",
    backToSignIn: "Powrót do logowania",
    signInWithPhone: "Zaloguj się przez telefon",
    phoneNumber: "Numer telefonu",
    verificationCode: "Kod weryfikacyjny",
    sendCode: "Wyślij kod",
    verifyCode: "Zweryfikuj kod",
    signInWithGoogle: "Zaloguj się przez Google",
    signInWithFacebook: "Zaloguj się przez Facebook",
    signInWithApple: "Zaloguj się przez Apple",
    signInWithMicrosoft: "Zaloguj się przez Microsoft",
    signInWithGitHub: "Zaloguj się przez GitHub",
    signInWithYahoo: "Zaloguj się przez Yahoo",
    signInWithTwitter: "Zaloguj się przez X",
    signInWithEmailLink: "Zaloguj się przez link e-mail",
    signInWithEmail: "Zaloguj się przez e-mail",
    sendSignInLink: "Wyślij link do logowania",
    termsOfService: "Warunki korzystania z usługi",
    privacyPolicy: "Polityka prywatności",
    resendCode: "Wyślij kod ponownie",
    sending: "Wysyłanie...",
    multiFactorEnrollment: "Rejestracja wieloskładnikowa",
    multiFactorAssertion: "Uwierzytelnianie wieloskładnikowe",
    mfaTotpVerification: "Weryfikacja TOTP",
    mfaSmsVerification: "Weryfikacja SMS",
    generateQrCode: "Generuj kod QR",
  },
  prompts: {
    noAccount: "Nie masz konta?",
    haveAccount: "Masz już konto?",
    enterEmailToReset: "Wprowadź adres e-mail, aby zresetować hasło",
    signInToAccount: "Zaloguj się na swoje konto",
    smsVerificationPrompt: "Wprowadź kod weryfikacyjny wysłany na Twój numer telefonu",
    enterDetailsToCreate: "Wprowadź swoje dane, aby utworzyć nowe konto",
    enterPhoneNumber: "Wprowadź swój numer telefonu",
    enterVerificationCode: "Wprowadź kod weryfikacyjny",
    enterEmailForLink: "Wprowadź swój e-mail, aby otrzymać link do logowania",
    mfaEnrollmentPrompt: "Wybierz nową metodę rejestracji wieloskładnikowej",
    mfaAssertionPrompt: "Ukończ proces uwierzytelniania wieloskładnikowego",
    mfaAssertionFactorPrompt: "Wybierz metodę uwierzytelniania wieloskładnikowego",
    mfaTotpQrCodePrompt: "Zeskanuj ten kod QR aplikacją uwierzytelniającą",
    mfaTotpEnrollmentVerificationPrompt: "Dodaj kod wygenerowany przez aplikację uwierzytelniającą",
  },
} satisfies Translations;
