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

/** Portuguese PT (pt-PT) translation set. */
export const ptPT = {
  errors: {
    userNotFound: "Não foi encontrada nenhuma conta com este endereço de e-mail",
    wrongPassword: "Palavra-passe incorreta",
    invalidEmail: "Por favor, introduza um endereço de e-mail válido",
    userDisabled: "Esta conta foi desativada",
    networkRequestFailed: "Não foi possível ligar ao servidor. Por favor, verifique a sua ligação à internet",
    tooManyRequests: "Demasiadas tentativas falhadas. Por favor, tente novamente mais tarde",
    missingVerificationCode: "Por favor, introduza o código de verificação",
    emailAlreadyInUse: "Já existe uma conta com este e-mail",
    invalidCredential: "As credenciais fornecidas são inválidas.",
    weakPassword: "A palavra-passe deve ter pelo menos 6 caracteres",
    unverifiedEmail: "Por favor, verifique o seu endereço de e-mail para continuar.",
    operationNotAllowed: "Esta operação não é permitida. Por favor, contacte o suporte.",
    invalidPhoneNumber: "O número de telefone é inválido",
    missingPhoneNumber: "Por favor, forneça um número de telefone",
    quotaExceeded: "Quota de SMS excedida. Por favor, tente novamente mais tarde",
    codeExpired: "O código de verificação expirou",
    captchaCheckFailed: "A verificação reCAPTCHA falhou. Por favor, tente novamente.",
    missingVerificationId: "Por favor, conclua primeiro a verificação reCAPTCHA.",
    missingEmail: "Por favor, forneça um endereço de e-mail",
    invalidActionCode: "A ligação de redefinição de palavra-passe é inválida ou expirou",
    credentialAlreadyInUse: "Já existe uma conta com este e-mail. Por favor, inicie sessão com essa conta.",
    requiresRecentLogin: "Esta operação requer uma sessão recente. Por favor, inicie sessão novamente.",
    providerAlreadyLinked: "Este número de telefone já está associado a outra conta",
    invalidVerificationCode: "Código de verificação inválido. Por favor, tente novamente",
    unknownError: "Ocorreu um erro inesperado",
    popupClosed: "A janela de início de sessão foi fechada. Por favor, tente novamente.",
    accountExistsWithDifferentCredential:
      "Já existe uma conta com este e-mail. Por favor, inicie sessão com o fornecedor original.",
    displayNameRequired: "Por favor, forneça um nome a apresentar",
    secondFactorAlreadyInUse: "Este número de telefone já está registado nesta conta.",
  },
  messages: {
    passwordResetEmailSent: "E-mail de redefinição de palavra-passe enviado com sucesso",
    signInLinkSent: "Ligação de início de sessão enviada com sucesso",
    verificationCodeFirst: "Por favor, solicite primeiro um código de verificação",
    checkEmailForReset: "Verifique o seu e-mail para obter instruções de redefinição de palavra-passe",
    dividerOr: "ou",
    termsAndPrivacy: "Ao continuar, aceita os nossos {tos} e {privacy}.",
    mfaSmsAssertionPrompt:
      "Será enviado um código de verificação para {phoneNumber} para concluir o processo de autenticação.",
  },
  labels: {
    emailAddress: "Endereço de e-mail",
    password: "Palavra-passe",
    displayName: "Nome a apresentar",
    forgotPassword: "Esqueceu a palavra-passe?",
    signUp: "Registar",
    signIn: "Iniciar sessão",
    resetPassword: "Redefinir palavra-passe",
    createAccount: "Criar conta",
    backToSignIn: "Voltar ao início de sessão",
    signInWithPhone: "Iniciar sessão com telefone",
    phoneNumber: "Número de telefone",
    verificationCode: "Código de verificação",
    sendCode: "Enviar código",
    verifyCode: "Verificar código",
    signInWithGoogle: "Iniciar sessão com Google",
    signInWithFacebook: "Iniciar sessão com Facebook",
    signInWithApple: "Iniciar sessão com Apple",
    signInWithMicrosoft: "Iniciar sessão com Microsoft",
    signInWithGitHub: "Iniciar sessão com GitHub",
    signInWithYahoo: "Iniciar sessão com Yahoo",
    signInWithTwitter: "Iniciar sessão com X",
    signInWithEmailLink: "Iniciar sessão com ligação de e-mail",
    signInWithEmail: "Iniciar sessão com e-mail",
    sendSignInLink: "Enviar ligação de início de sessão",
    termsOfService: "Termos de Serviço",
    privacyPolicy: "Política de Privacidade",
    resendCode: "Reenviar código",
    sending: "A enviar...",
    multiFactorEnrollment: "Inscrição multifator",
    multiFactorAssertion: "Autenticação multifator",
    mfaTotpVerification: "Verificação TOTP",
    mfaSmsVerification: "Verificação por SMS",
    generateQrCode: "Gerar código QR",
  },
  prompts: {
    noAccount: "Não tem uma conta?",
    haveAccount: "Já tem uma conta?",
    enterEmailToReset: "Introduza o seu endereço de e-mail para redefinir a palavra-passe",
    signInToAccount: "Inicie sessão na sua conta",
    smsVerificationPrompt: "Introduza o código de verificação enviado para o seu número de telefone",
    enterDetailsToCreate: "Introduza os seus dados para criar uma nova conta",
    enterPhoneNumber: "Introduza o seu número de telefone",
    enterVerificationCode: "Introduza o código de verificação",
    enterEmailForLink: "Introduza o seu e-mail para receber uma ligação de início de sessão",
    mfaEnrollmentPrompt: "Selecione um novo método de inscrição multifator",
    mfaAssertionPrompt: "Por favor, conclua o processo de autenticação multifator",
    mfaAssertionFactorPrompt: "Por favor, escolha um método de autenticação multifator",
    mfaTotpQrCodePrompt: "Digitalize este código QR com a sua aplicação de autenticação",
    mfaTotpEnrollmentVerificationPrompt: "Adicione o código gerado pela sua aplicação de autenticação",
  },
} satisfies Translations;
