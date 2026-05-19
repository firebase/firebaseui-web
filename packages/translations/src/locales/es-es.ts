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

/** Spanish ES (es-ES) translation set. */
export const esES = {
  errors: {
    userNotFound: "No se encontró ninguna cuenta con esta dirección de correo electrónico",
    wrongPassword: "Contraseña incorrecta",
    invalidEmail: "Por favor, introduce una dirección de correo electrónico válida",
    userDisabled: "Esta cuenta ha sido desactivada",
    networkRequestFailed: "No se puede conectar al servidor. Por favor, comprueba tu conexión a internet",
    tooManyRequests: "Demasiados intentos fallidos. Por favor, inténtalo de nuevo más tarde",
    missingVerificationCode: "Por favor, introduce el código de verificación",
    emailAlreadyInUse: "Ya existe una cuenta con este correo electrónico",
    invalidCredential: "Las credenciales proporcionadas no son válidas.",
    weakPassword: "La contraseña debe tener al menos 6 caracteres",
    unverifiedEmail: "Por favor, verifica tu dirección de correo electrónico para continuar.",
    operationNotAllowed: "Esta operación no está permitida. Por favor, contacta con soporte.",
    invalidPhoneNumber: "El número de teléfono no es válido",
    missingPhoneNumber: "Por favor, proporciona un número de teléfono",
    quotaExceeded: "Cuota de SMS superada. Por favor, inténtalo de nuevo más tarde",
    codeExpired: "El código de verificación ha caducado",
    captchaCheckFailed: "La verificación reCAPTCHA ha fallado. Por favor, inténtalo de nuevo.",
    missingVerificationId: "Por favor, completa primero la verificación reCAPTCHA.",
    missingEmail: "Por favor, proporciona una dirección de correo electrónico",
    invalidActionCode: "El enlace para restablecer la contraseña no es válido o ha caducado",
    credentialAlreadyInUse:
      "Ya existe una cuenta con este correo electrónico. Por favor, inicia sesión con esa cuenta.",
    requiresRecentLogin: "Esta operación requiere un inicio de sesión reciente. Por favor, inicia sesión de nuevo.",
    providerAlreadyLinked: "Este número de teléfono ya está vinculado a otra cuenta",
    invalidVerificationCode: "Código de verificación no válido. Por favor, inténtalo de nuevo",
    unknownError: "Se produjo un error inesperado",
    popupClosed: "La ventana emergente de inicio de sesión se cerró. Por favor, inténtalo de nuevo.",
    accountExistsWithDifferentCredential:
      "Ya existe una cuenta con este correo electrónico. Por favor, inicia sesión con el proveedor original.",
    displayNameRequired: "Por favor, proporciona un nombre para mostrar",
    secondFactorAlreadyInUse: "Este número de teléfono ya está registrado en esta cuenta.",
  },
  messages: {
    passwordResetEmailSent: "Correo electrónico de restablecimiento de contraseña enviado correctamente",
    signInLinkSent: "Enlace de inicio de sesión enviado correctamente",
    verificationCodeFirst: "Por favor, solicita primero un código de verificación",
    checkEmailForReset: "Comprueba tu correo electrónico para obtener instrucciones de restablecimiento de contraseña",
    dividerOr: "o",
    termsAndPrivacy: "Al continuar, aceptas nuestros {tos} y {privacy}.",
    mfaSmsAssertionPrompt:
      "Se enviará un código de verificación a {phoneNumber} para completar el proceso de autenticación.",
  },
  labels: {
    emailAddress: "Dirección de correo electrónico",
    password: "Contraseña",
    displayName: "Nombre para mostrar",
    forgotPassword: "¿Olvidaste tu contraseña?",
    signUp: "Registrarse",
    signIn: "Iniciar sesión",
    resetPassword: "Restablecer contraseña",
    createAccount: "Crear cuenta",
    backToSignIn: "Volver al inicio de sesión",
    signInWithPhone: "Iniciar sesión con teléfono",
    phoneNumber: "Número de teléfono",
    verificationCode: "Código de verificación",
    sendCode: "Enviar código",
    verifyCode: "Verificar código",
    signInWithGoogle: "Iniciar sesión con Google",
    signInWithFacebook: "Iniciar sesión con Facebook",
    signInWithApple: "Iniciar sesión con Apple",
    signInWithMicrosoft: "Iniciar sesión con Microsoft",
    signInWithGitHub: "Iniciar sesión con GitHub",
    signInWithYahoo: "Iniciar sesión con Yahoo",
    signInWithTwitter: "Iniciar sesión con X",
    signInWithEmailLink: "Iniciar sesión con enlace de correo electrónico",
    signInWithEmail: "Iniciar sesión con correo electrónico",
    sendSignInLink: "Enviar enlace de inicio de sesión",
    termsOfService: "Términos de servicio",
    privacyPolicy: "Política de privacidad",
    resendCode: "Reenviar código",
    sending: "Enviando...",
    multiFactorEnrollment: "Inscripción multifactor",
    multiFactorAssertion: "Autenticación multifactor",
    mfaTotpVerification: "Verificación TOTP",
    mfaSmsVerification: "Verificación por SMS",
    generateQrCode: "Generar código QR",
  },
  prompts: {
    noAccount: "¿No tienes una cuenta?",
    haveAccount: "¿Ya tienes una cuenta?",
    enterEmailToReset: "Introduce tu dirección de correo electrónico para restablecer tu contraseña",
    signInToAccount: "Inicia sesión en tu cuenta",
    smsVerificationPrompt: "Introduce el código de verificación enviado a tu número de teléfono",
    enterDetailsToCreate: "Introduce tus datos para crear una nueva cuenta",
    enterPhoneNumber: "Introduce tu número de teléfono",
    enterVerificationCode: "Introduce el código de verificación",
    enterEmailForLink: "Introduce tu correo electrónico para recibir un enlace de inicio de sesión",
    mfaEnrollmentPrompt: "Selecciona un nuevo método de inscripción multifactor",
    mfaAssertionPrompt: "Por favor, completa el proceso de autenticación multifactor",
    mfaAssertionFactorPrompt: "Por favor, elige un método de autenticación multifactor",
    mfaTotpQrCodePrompt: "Escanea este código QR con tu aplicación de autenticación",
    mfaTotpEnrollmentVerificationPrompt: "Añade el código generado por tu aplicación de autenticación",
  },
} satisfies Translations;
