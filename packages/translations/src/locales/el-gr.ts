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

/** Greek GR (el-GR) translation set. */
export const elGR = {
  errors: {
    userNotFound: "Δεν βρέθηκε λογαριασμός με αυτή τη διεύθυνση email",
    wrongPassword: "Λανθασμένος κωδικός πρόσβασης",
    invalidEmail: "Εισαγάγετε μια έγκυρη διεύθυνση email",
    userDisabled: "Αυτός ο λογαριασμός έχει απενεργοποιηθεί",
    networkRequestFailed: "Αδυναμία σύνδεσης με τον διακομιστή. Ελέγξτε τη σύνδεσή σας στο διαδίκτυο",
    tooManyRequests: "Πάρα πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά αργότερα",
    missingVerificationCode: "Εισαγάγετε τον κωδικό επαλήθευσης",
    emailAlreadyInUse: "Υπάρχει ήδη λογαριασμός με αυτό το email",
    invalidCredential: "Τα παρεχόμενα διαπιστευτήρια δεν είναι έγκυρα.",
    weakPassword: "Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 6 χαρακτήρες",
    unverifiedEmail: "Επαληθεύστε τη διεύθυνση email σας για να συνεχίσετε.",
    operationNotAllowed: "Αυτή η λειτουργία δεν επιτρέπεται. Επικοινωνήστε με την υποστήριξη.",
    invalidPhoneNumber: "Ο αριθμός τηλεφώνου δεν είναι έγκυρος",
    missingPhoneNumber: "Δώστε έναν αριθμό τηλεφώνου",
    quotaExceeded: "Το όριο SMS έχει υπερβαθεί. Δοκιμάστε ξανά αργότερα",
    codeExpired: "Ο κωδικός επαλήθευσης έχει λήξει",
    captchaCheckFailed: "Η επαλήθευση reCAPTCHA απέτυχε. Δοκιμάστε ξανά.",
    missingVerificationId: "Ολοκληρώστε πρώτα την επαλήθευση reCAPTCHA.",
    missingEmail: "Δώστε μια διεύθυνση email",
    invalidActionCode: "Ο σύνδεσμος επαναφοράς κωδικού πρόσβασης δεν είναι έγκυρος ή έχει λήξει",
    credentialAlreadyInUse: "Υπάρχει ήδη λογαριασμός με αυτό το email. Συνδεθείτε με αυτόν τον λογαριασμό.",
    requiresRecentLogin: "Αυτή η λειτουργία απαιτεί πρόσφατη σύνδεση. Συνδεθείτε ξανά.",
    providerAlreadyLinked: "Αυτός ο αριθμός τηλεφώνου είναι ήδη συνδεδεμένος με άλλο λογαριασμό",
    invalidVerificationCode: "Μη έγκυρος κωδικός επαλήθευσης. Δοκιμάστε ξανά",
    unknownError: "Παρουσιάστηκε απροσδόκητο σφάλμα",
    popupClosed: "Το αναδυόμενο παράθυρο σύνδεσης έκλεισε. Δοκιμάστε ξανά.",
    accountExistsWithDifferentCredential: "Υπάρχει ήδη λογαριασμός με αυτό το email. Συνδεθείτε με τον αρχικό πάροχο.",
    displayNameRequired: "Δώστε ένα εμφανιζόμενο όνομα",
    secondFactorAlreadyInUse: "Αυτός ο αριθμός τηλεφώνου είναι ήδη εγγεγραμμένος σε αυτόν τον λογαριασμό.",
  },
  messages: {
    passwordResetEmailSent: "Το email επαναφοράς κωδικού πρόσβασης στάλθηκε επιτυχώς",
    signInLinkSent: "Ο σύνδεσμος σύνδεσης στάλθηκε επιτυχώς",
    verificationCodeFirst: "Ζητήστε πρώτα έναν κωδικό επαλήθευσης",
    checkEmailForReset: "Ελέγξτε το email σας για οδηγίες επαναφοράς κωδικού πρόσβασης",
    dividerOr: "ή",
    termsAndPrivacy: "Συνεχίζοντας, αποδέχεστε τους {tos} και την {privacy}.",
    mfaSmsAssertionPrompt:
      "Θα σταλεί κωδικός επαλήθευσης στο {phoneNumber} για την ολοκλήρωση της διαδικασίας ελέγχου ταυτότητας.",
  },
  labels: {
    emailAddress: "Διεύθυνση email",
    password: "Κωδικός πρόσβασης",
    displayName: "Εμφανιζόμενο όνομα",
    forgotPassword: "Ξεχάσατε τον κωδικό πρόσβασης;",
    signUp: "Εγγραφή",
    signIn: "Σύνδεση",
    resetPassword: "Επαναφορά κωδικού πρόσβασης",
    createAccount: "Δημιουργία λογαριασμού",
    backToSignIn: "Επιστροφή στη σύνδεση",
    signInWithPhone: "Σύνδεση με τηλέφωνο",
    phoneNumber: "Αριθμός τηλεφώνου",
    verificationCode: "Κωδικός επαλήθευσης",
    sendCode: "Αποστολή κωδικού",
    verifyCode: "Επαλήθευση κωδικού",
    signInWithGoogle: "Σύνδεση με Google",
    signInWithFacebook: "Σύνδεση με Facebook",
    signInWithApple: "Σύνδεση με Apple",
    signInWithMicrosoft: "Σύνδεση με Microsoft",
    signInWithGitHub: "Σύνδεση με GitHub",
    signInWithYahoo: "Σύνδεση με Yahoo",
    signInWithTwitter: "Σύνδεση με X",
    signInWithEmailLink: "Σύνδεση με σύνδεσμο email",
    signInWithEmail: "Σύνδεση με email",
    sendSignInLink: "Αποστολή συνδέσμου σύνδεσης",
    termsOfService: "Όροι Υπηρεσίας",
    privacyPolicy: "Πολιτική Απορρήτου",
    resendCode: "Επαναποστολή κωδικού",
    sending: "Αποστολή...",
    multiFactorEnrollment: "Εγγραφή πολλαπλών παραγόντων",
    multiFactorAssertion: "Έλεγχος ταυτότητας πολλαπλών παραγόντων",
    mfaTotpVerification: "Επαλήθευση TOTP",
    mfaSmsVerification: "Επαλήθευση SMS",
    generateQrCode: "Δημιουργία κωδικού QR",
  },
  prompts: {
    noAccount: "Δεν έχετε λογαριασμό;",
    haveAccount: "Έχετε ήδη λογαριασμό;",
    enterEmailToReset: "Εισαγάγετε τη διεύθυνση email σας για επαναφορά κωδικού πρόσβασης",
    signInToAccount: "Συνδεθείτε στον λογαριασμό σας",
    smsVerificationPrompt: "Εισαγάγετε τον κωδικό επαλήθευσης που στάλθηκε στον αριθμό τηλεφώνου σας",
    enterDetailsToCreate: "Εισαγάγετε τα στοιχεία σας για να δημιουργήσετε νέο λογαριασμό",
    enterPhoneNumber: "Εισαγάγετε τον αριθμό τηλεφώνου σας",
    enterVerificationCode: "Εισαγάγετε τον κωδικό επαλήθευσης",
    enterEmailForLink: "Εισαγάγετε το email σας για να λάβετε σύνδεσμο σύνδεσης",
    mfaEnrollmentPrompt: "Επιλέξτε νέα μέθοδο εγγραφής πολλαπλών παραγόντων",
    mfaAssertionPrompt: "Ολοκληρώστε τη διαδικασία ελέγχου ταυτότητας πολλαπλών παραγόντων",
    mfaAssertionFactorPrompt: "Επιλέξτε μέθοδο ελέγχου ταυτότητας πολλαπλών παραγόντων",
    mfaTotpQrCodePrompt: "Σαρώστε αυτόν τον κωδικό QR με την εφαρμογή ελέγχου ταυτότητας",
    mfaTotpEnrollmentVerificationPrompt: "Προσθέστε τον κωδικό που δημιουργήθηκε από την εφαρμογή ελέγχου ταυτότητας",
  },
} satisfies Translations;
