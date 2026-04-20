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

/** Portuguese BR (pt-BR) translation set. */
export const ptBR = {
  errors: {
    userNotFound: "Nenhuma conta encontrada com este endereço de e-mail",
    wrongPassword: "Senha incorreta",
    invalidEmail: "Por favor, insira um endereço de e-mail válido",
    userDisabled: "Esta conta foi desativada",
    networkRequestFailed: "Não foi possível conectar ao servidor. Por favor, verifique sua conexão com a internet",
    tooManyRequests: "Muitas tentativas malsucedidas. Por favor, tente novamente mais tarde",
    missingVerificationCode: "Por favor, insira o código de verificação",
    emailAlreadyInUse: "Já existe uma conta com este e-mail",
    invalidCredential: "As credenciais fornecidas são inválidas.",
    weakPassword: "A senha deve ter pelo menos 6 caracteres",
    unverifiedEmail: "Por favor, verifique seu endereço de e-mail para continuar.",
    operationNotAllowed: "Esta operação não é permitida. Por favor, entre em contato com o suporte.",
    invalidPhoneNumber: "O número de telefone é inválido",
    missingPhoneNumber: "Por favor, forneça um número de telefone",
    quotaExceeded: "Cota de SMS excedida. Por favor, tente novamente mais tarde",
    codeExpired: "O código de verificação expirou",
    captchaCheckFailed: "A verificação reCAPTCHA falhou. Por favor, tente novamente.",
    missingVerificationId: "Por favor, complete primeiro a verificação reCAPTCHA.",
    missingEmail: "Por favor, forneça um endereço de e-mail",
    invalidActionCode: "O link de redefinição de senha é inválido ou expirou",
    credentialAlreadyInUse: "Já existe uma conta com este e-mail. Por favor, faça login com essa conta.",
    requiresRecentLogin: "Esta operação requer um login recente. Por favor, faça login novamente.",
    providerAlreadyLinked: "Este número de telefone já está vinculado a outra conta",
    invalidVerificationCode: "Código de verificação inválido. Por favor, tente novamente",
    unknownError: "Ocorreu um erro inesperado",
    popupClosed: "O popup de login foi fechado. Por favor, tente novamente.",
    accountExistsWithDifferentCredential:
      "Já existe uma conta com este e-mail. Por favor, faça login com o provedor original.",
    displayNameRequired: "Por favor, forneça um nome de exibição",
    secondFactorAlreadyInUse: "Este número de telefone já está cadastrado nesta conta.",
  },
  messages: {
    passwordResetEmailSent: "E-mail de redefinição de senha enviado com sucesso",
    signInLinkSent: "Link de login enviado com sucesso",
    verificationCodeFirst: "Por favor, solicite primeiro um código de verificação",
    checkEmailForReset: "Verifique seu e-mail para instruções de redefinição de senha",
    dividerOr: "ou",
    termsAndPrivacy: "Ao continuar, você concorda com nossos {tos} e {privacy}.",
    mfaSmsAssertionPrompt:
      "Um código de verificação será enviado para {phoneNumber} para concluir o processo de autenticação.",
  },
  labels: {
    emailAddress: "Endereço de e-mail",
    password: "Senha",
    displayName: "Nome de exibição",
    forgotPassword: "Esqueceu a senha?",
    signUp: "Cadastrar-se",
    signIn: "Entrar",
    resetPassword: "Redefinir senha",
    createAccount: "Criar conta",
    backToSignIn: "Voltar ao login",
    signInWithPhone: "Entrar com telefone",
    phoneNumber: "Número de telefone",
    verificationCode: "Código de verificação",
    sendCode: "Enviar código",
    verifyCode: "Verificar código",
    signInWithGoogle: "Entrar com Google",
    signInWithFacebook: "Entrar com Facebook",
    signInWithApple: "Entrar com Apple",
    signInWithMicrosoft: "Entrar com Microsoft",
    signInWithGitHub: "Entrar com GitHub",
    signInWithYahoo: "Entrar com Yahoo",
    signInWithTwitter: "Entrar com X",
    signInWithEmailLink: "Entrar com link de e-mail",
    signInWithEmail: "Entrar com e-mail",
    sendSignInLink: "Enviar link de login",
    termsOfService: "Termos de Serviço",
    privacyPolicy: "Política de Privacidade",
    resendCode: "Reenviar código",
    sending: "Enviando...",
    multiFactorEnrollment: "Cadastro multifator",
    multiFactorAssertion: "Autenticação multifator",
    mfaTotpVerification: "Verificação TOTP",
    mfaSmsVerification: "Verificação por SMS",
    generateQrCode: "Gerar código QR",
  },
  prompts: {
    noAccount: "Não tem uma conta?",
    haveAccount: "Já tem uma conta?",
    enterEmailToReset: "Insira seu endereço de e-mail para redefinir sua senha",
    signInToAccount: "Entre na sua conta",
    smsVerificationPrompt: "Insira o código de verificação enviado para o seu número de telefone",
    enterDetailsToCreate: "Insira seus dados para criar uma nova conta",
    enterPhoneNumber: "Insira seu número de telefone",
    enterVerificationCode: "Insira o código de verificação",
    enterEmailForLink: "Insira seu e-mail para receber um link de login",
    mfaEnrollmentPrompt: "Selecione um novo método de cadastro multifator",
    mfaAssertionPrompt: "Por favor, conclua o processo de autenticação multifator",
    mfaAssertionFactorPrompt: "Por favor, escolha um método de autenticação multifator",
    mfaTotpQrCodePrompt: "Escaneie este código QR com seu aplicativo autenticador",
    mfaTotpEnrollmentVerificationPrompt: "Adicione o código gerado pelo seu aplicativo autenticador",
  },
} satisfies Translations;
