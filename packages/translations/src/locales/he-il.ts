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

/** Hebrew IL (he-IL) translation set. */
export const heIL = {
  errors: {
    userNotFound: "לא נמצא חשבון עם כתובת אימייל זו",
    wrongPassword: "סיסמה שגויה",
    invalidEmail: "נא להזין כתובת אימייל חוקית",
    userDisabled: "חשבון זה הושבת",
    networkRequestFailed: "לא ניתן להתחבר לשרת. נא לבדוק את חיבור האינטרנט שלך",
    tooManyRequests: "יותר מדי ניסיונות כושלים. נסה שוב מאוחר יותר",
    missingVerificationCode: "נא להזין את קוד האימות",
    emailAlreadyInUse: "כבר קיים חשבון עם אימייל זה",
    invalidCredential: "פרטי הכניסה שסופקו אינם חוקיים.",
    weakPassword: "הסיסמה חייבת להכיל לפחות 6 תווים",
    unverifiedEmail: "נא לאמת את כתובת האימייל שלך כדי להמשיך.",
    operationNotAllowed: "פעולה זו אינה מותרת. נא לפנות לתמיכה.",
    invalidPhoneNumber: "מספר הטלפון אינו חוקי",
    missingPhoneNumber: "נא לספק מספר טלפון",
    quotaExceeded: "חרגת ממכסת ה-SMS. נסה שוב מאוחר יותר",
    codeExpired: "קוד האימות פג תוקפו",
    captchaCheckFailed: "אימות reCAPTCHA נכשל. נסה שוב.",
    missingVerificationId: "נא להשלים תחילה את אימות reCAPTCHA.",
    missingEmail: "נא לספק כתובת אימייל",
    invalidActionCode: "קישור איפוס הסיסמה אינו חוקי או שפג תוקפו",
    credentialAlreadyInUse: "כבר קיים חשבון עם אימייל זה. נא להיכנס עם אותו חשבון.",
    requiresRecentLogin: "פעולה זו דורשת כניסה לאחרונה. נא להיכנס שוב.",
    providerAlreadyLinked: "מספר טלפון זה כבר מקושר לחשבון אחר",
    invalidVerificationCode: "קוד אימות שגוי. נסה שוב",
    unknownError: "אירעה שגיאה בלתי צפויה",
    popupClosed: "חלון הכניסה נסגר. נסה שוב.",
    accountExistsWithDifferentCredential: "כבר קיים חשבון עם אימייל זה. נא להיכנס עם הספק המקורי.",
    displayNameRequired: "נא לספק שם תצוגה",
    secondFactorAlreadyInUse: "מספר טלפון זה כבר רשום בחשבון זה.",
  },
  messages: {
    passwordResetEmailSent: "אימייל לאיפוס סיסמה נשלח בהצלחה",
    signInLinkSent: "קישור הכניסה נשלח בהצלחה",
    verificationCodeFirst: "נא לבקש תחילה קוד אימות",
    checkEmailForReset: "בדוק את האימייל שלך לקבלת הוראות לאיפוס סיסמה",
    dividerOr: "או",
    termsAndPrivacy: "בהמשך, אתה מסכים ל{tos} ול{privacy} שלנו.",
    mfaSmsAssertionPrompt: "קוד אימות יישלח ל-{phoneNumber} להשלמת תהליך האימות.",
  },
  labels: {
    emailAddress: "כתובת אימייל",
    password: "סיסמה",
    displayName: "שם תצוגה",
    forgotPassword: "שכחת סיסמה?",
    signUp: "הרשמה",
    signIn: "כניסה",
    resetPassword: "איפוס סיסמה",
    createAccount: "יצירת חשבון",
    backToSignIn: "חזרה לכניסה",
    signInWithPhone: "כניסה עם טלפון",
    phoneNumber: "מספר טלפון",
    verificationCode: "קוד אימות",
    sendCode: "שלח קוד",
    verifyCode: "אמת קוד",
    signInWithGoogle: "כניסה עם Google",
    signInWithFacebook: "כניסה עם Facebook",
    signInWithApple: "כניסה עם Apple",
    signInWithMicrosoft: "כניסה עם Microsoft",
    signInWithGitHub: "כניסה עם GitHub",
    signInWithYahoo: "כניסה עם Yahoo",
    signInWithTwitter: "כניסה עם X",
    signInWithEmailLink: "כניסה עם קישור אימייל",
    signInWithEmail: "כניסה עם אימייל",
    sendSignInLink: "שלח קישור כניסה",
    termsOfService: "תנאי שירות",
    privacyPolicy: "מדיניות פרטיות",
    resendCode: "שלח קוד מחדש",
    sending: "שולח...",
    multiFactorEnrollment: "רישום רב-גורמי",
    multiFactorAssertion: "אימות רב-גורמי",
    mfaTotpVerification: "אימות TOTP",
    mfaSmsVerification: "אימות SMS",
    generateQrCode: "צור קוד QR",
  },
  prompts: {
    noAccount: "אין לך חשבון?",
    haveAccount: "כבר יש לך חשבון?",
    enterEmailToReset: "הזן את כתובת האימייל שלך לאיפוס הסיסמה",
    signInToAccount: "היכנס לחשבון שלך",
    smsVerificationPrompt: "הזן את קוד האימות שנשלח למספר הטלפון שלך",
    enterDetailsToCreate: "הזן את פרטיך ליצירת חשבון חדש",
    enterPhoneNumber: "הזן את מספר הטלפון שלך",
    enterVerificationCode: "הזן את קוד האימות",
    enterEmailForLink: "הזן את האימייל שלך לקבלת קישור כניסה",
    mfaEnrollmentPrompt: "בחר שיטת רישום רב-גורמי חדשה",
    mfaAssertionPrompt: "נא להשלים את תהליך האימות הרב-גורמי",
    mfaAssertionFactorPrompt: "נא לבחור שיטת אימות רב-גורמי",
    mfaTotpQrCodePrompt: "סרוק קוד QR זה עם אפליקציית האימות שלך",
    mfaTotpEnrollmentVerificationPrompt: "הוסף את הקוד שנוצר על ידי אפליקציית האימות שלך",
  },
} satisfies Translations;
