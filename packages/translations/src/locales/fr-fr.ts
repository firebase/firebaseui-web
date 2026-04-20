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

/** French FR (fr-FR) translation set. */
export const frFR = {
  errors: {
    userNotFound: "Aucun compte trouvé avec cette adresse e-mail",
    wrongPassword: "Mot de passe incorrect",
    invalidEmail: "Veuillez saisir une adresse e-mail valide",
    userDisabled: "Ce compte a été désactivé",
    networkRequestFailed: "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet",
    tooManyRequests: "Trop de tentatives échouées. Veuillez réessayer plus tard",
    missingVerificationCode: "Veuillez saisir le code de vérification",
    emailAlreadyInUse: "Un compte existe déjà avec cette adresse e-mail",
    invalidCredential: "Les identifiants fournis ne sont pas valides.",
    weakPassword: "Le mot de passe doit contenir au moins 6 caractères",
    unverifiedEmail: "Veuillez vérifier votre adresse e-mail pour continuer.",
    operationNotAllowed: "Cette opération n'est pas autorisée. Veuillez contacter le support.",
    invalidPhoneNumber: "Le numéro de téléphone n'est pas valide",
    missingPhoneNumber: "Veuillez fournir un numéro de téléphone",
    quotaExceeded: "Quota de SMS dépassé. Veuillez réessayer plus tard",
    codeExpired: "Le code de vérification a expiré",
    captchaCheckFailed: "La vérification reCAPTCHA a échoué. Veuillez réessayer.",
    missingVerificationId: "Veuillez d'abord compléter la vérification reCAPTCHA.",
    missingEmail: "Veuillez fournir une adresse e-mail",
    invalidActionCode: "Le lien de réinitialisation du mot de passe est invalide ou a expiré",
    credentialAlreadyInUse: "Un compte existe déjà avec cette adresse e-mail. Veuillez vous connecter avec ce compte.",
    requiresRecentLogin: "Cette opération nécessite une connexion récente. Veuillez vous connecter à nouveau.",
    providerAlreadyLinked: "Ce numéro de téléphone est déjà associé à un autre compte",
    invalidVerificationCode: "Code de vérification invalide. Veuillez réessayer",
    unknownError: "Une erreur inattendue s'est produite",
    popupClosed: "La fenêtre de connexion a été fermée. Veuillez réessayer.",
    accountExistsWithDifferentCredential:
      "Un compte existe déjà avec cette adresse e-mail. Veuillez vous connecter avec le fournisseur d'origine.",
    displayNameRequired: "Veuillez fournir un nom d'affichage",
    secondFactorAlreadyInUse: "Ce numéro de téléphone est déjà enregistré sur ce compte.",
  },
  messages: {
    passwordResetEmailSent: "E-mail de réinitialisation du mot de passe envoyé avec succès",
    signInLinkSent: "Lien de connexion envoyé avec succès",
    verificationCodeFirst: "Veuillez d'abord demander un code de vérification",
    checkEmailForReset: "Vérifiez votre e-mail pour les instructions de réinitialisation du mot de passe",
    dividerOr: "ou",
    termsAndPrivacy: "En continuant, vous acceptez nos {tos} et {privacy}.",
    mfaSmsAssertionPrompt:
      "Un code de vérification sera envoyé au {phoneNumber} pour compléter le processus d'authentification.",
  },
  labels: {
    emailAddress: "Adresse e-mail",
    password: "Mot de passe",
    displayName: "Nom d'affichage",
    forgotPassword: "Mot de passe oublié ?",
    signUp: "S'inscrire",
    signIn: "Se connecter",
    resetPassword: "Réinitialiser le mot de passe",
    createAccount: "Créer un compte",
    backToSignIn: "Retour à la connexion",
    signInWithPhone: "Se connecter avec le téléphone",
    phoneNumber: "Numéro de téléphone",
    verificationCode: "Code de vérification",
    sendCode: "Envoyer le code",
    verifyCode: "Vérifier le code",
    signInWithGoogle: "Se connecter avec Google",
    signInWithFacebook: "Se connecter avec Facebook",
    signInWithApple: "Se connecter avec Apple",
    signInWithMicrosoft: "Se connecter avec Microsoft",
    signInWithGitHub: "Se connecter avec GitHub",
    signInWithYahoo: "Se connecter avec Yahoo",
    signInWithTwitter: "Se connecter avec X",
    signInWithEmailLink: "Se connecter avec un lien e-mail",
    signInWithEmail: "Se connecter avec e-mail",
    sendSignInLink: "Envoyer le lien de connexion",
    termsOfService: "Conditions d'utilisation",
    privacyPolicy: "Politique de confidentialité",
    resendCode: "Renvoyer le code",
    sending: "Envoi en cours...",
    multiFactorEnrollment: "Inscription multifacteur",
    multiFactorAssertion: "Authentification multifacteur",
    mfaTotpVerification: "Vérification TOTP",
    mfaSmsVerification: "Vérification par SMS",
    generateQrCode: "Générer un code QR",
  },
  prompts: {
    noAccount: "Vous n'avez pas de compte ?",
    haveAccount: "Vous avez déjà un compte ?",
    enterEmailToReset: "Saisissez votre adresse e-mail pour réinitialiser votre mot de passe",
    signInToAccount: "Connectez-vous à votre compte",
    smsVerificationPrompt: "Saisissez le code de vérification envoyé à votre numéro de téléphone",
    enterDetailsToCreate: "Saisissez vos informations pour créer un nouveau compte",
    enterPhoneNumber: "Saisissez votre numéro de téléphone",
    enterVerificationCode: "Saisissez le code de vérification",
    enterEmailForLink: "Saisissez votre e-mail pour recevoir un lien de connexion",
    mfaEnrollmentPrompt: "Sélectionnez une nouvelle méthode d'inscription multifacteur",
    mfaAssertionPrompt: "Veuillez compléter le processus d'authentification multifacteur",
    mfaAssertionFactorPrompt: "Veuillez choisir une méthode d'authentification multifacteur",
    mfaTotpQrCodePrompt: "Scannez ce code QR avec votre application d'authentification",
    mfaTotpEnrollmentVerificationPrompt: "Ajoutez le code généré par votre application d'authentification",
  },
} satisfies Translations;
