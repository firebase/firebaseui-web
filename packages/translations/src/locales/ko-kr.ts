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

/** Korean KR (ko-KR) translation set. */
export const koKR = {
  errors: {
    userNotFound: "이 이메일 주소로 등록된 계정을 찾을 수 없습니다",
    wrongPassword: "비밀번호가 올바르지 않습니다",
    invalidEmail: "유효한 이메일 주소를 입력해 주세요",
    userDisabled: "이 계정은 비활성화되었습니다",
    networkRequestFailed: "서버에 연결할 수 없습니다. 인터넷 연결을 확인해 주세요",
    tooManyRequests: "너무 많은 로그인 시도가 있었습니다. 나중에 다시 시도해 주세요",
    missingVerificationCode: "인증 코드를 입력해 주세요",
    emailAlreadyInUse: "이 이메일로 이미 계정이 존재합니다",
    invalidCredential: "제공된 자격 증명이 유효하지 않습니다.",
    weakPassword: "비밀번호는 최소 6자 이상이어야 합니다",
    unverifiedEmail: "계속하려면 이메일 주소를 인증해 주세요.",
    operationNotAllowed: "이 작업은 허용되지 않습니다. 지원팀에 문의해 주세요.",
    invalidPhoneNumber: "전화번호가 유효하지 않습니다",
    missingPhoneNumber: "전화번호를 입력해 주세요",
    quotaExceeded: "SMS 할당량이 초과되었습니다. 나중에 다시 시도해 주세요",
    codeExpired: "인증 코드가 만료되었습니다",
    captchaCheckFailed: "reCAPTCHA 인증에 실패했습니다. 다시 시도해 주세요.",
    missingVerificationId: "먼저 reCAPTCHA 인증을 완료해 주세요.",
    missingEmail: "이메일 주소를 입력해 주세요",
    invalidActionCode: "비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다",
    credentialAlreadyInUse: "이 이메일로 이미 계정이 존재합니다. 해당 계정으로 로그인해 주세요.",
    requiresRecentLogin: "이 작업을 수행하려면 최근에 로그인해야 합니다. 다시 로그인해 주세요.",
    providerAlreadyLinked: "이 전화번호는 이미 다른 계정에 연결되어 있습니다",
    invalidVerificationCode: "인증 코드가 유효하지 않습니다. 다시 시도해 주세요",
    unknownError: "예기치 않은 오류가 발생했습니다",
    popupClosed: "로그인 팝업이 닫혔습니다. 다시 시도해 주세요.",
    accountExistsWithDifferentCredential: "이 이메일로 이미 계정이 존재합니다. 원래 제공업체로 로그인해 주세요.",
    displayNameRequired: "표시 이름을 입력해 주세요",
    secondFactorAlreadyInUse: "이 전화번호는 이미 이 계정에 등록되어 있습니다.",
  },
  messages: {
    passwordResetEmailSent: "비밀번호 재설정 이메일이 성공적으로 전송되었습니다",
    signInLinkSent: "로그인 링크가 성공적으로 전송되었습니다",
    verificationCodeFirst: "먼저 인증 코드를 요청해 주세요",
    checkEmailForReset: "비밀번호 재설정 안내가 담긴 이메일을 확인해 주세요",
    dividerOr: "또는",
    termsAndPrivacy: "계속하면 {tos} 및 {privacy}에 동의하는 것으로 간주됩니다.",
    mfaSmsAssertionPrompt: "인증 프로세스를 완료하기 위해 {phoneNumber}로 인증 코드가 전송됩니다.",
  },
  labels: {
    emailAddress: "이메일 주소",
    password: "비밀번호",
    displayName: "표시 이름",
    forgotPassword: "비밀번호를 잊으셨나요?",
    signUp: "회원가입",
    signIn: "로그인",
    resetPassword: "비밀번호 재설정",
    createAccount: "계정 만들기",
    backToSignIn: "로그인으로 돌아가기",
    signInWithPhone: "전화번호로 로그인",
    phoneNumber: "전화번호",
    verificationCode: "인증 코드",
    sendCode: "코드 전송",
    verifyCode: "코드 확인",
    signInWithGoogle: "Google로 로그인",
    signInWithFacebook: "Facebook으로 로그인",
    signInWithApple: "Apple로 로그인",
    signInWithMicrosoft: "Microsoft로 로그인",
    signInWithGitHub: "GitHub로 로그인",
    signInWithYahoo: "Yahoo로 로그인",
    signInWithTwitter: "X로 로그인",
    signInWithEmailLink: "이메일 링크로 로그인",
    signInWithEmail: "이메일로 로그인",
    sendSignInLink: "로그인 링크 전송",
    termsOfService: "서비스 약관",
    privacyPolicy: "개인정보 처리방침",
    resendCode: "코드 재전송",
    sending: "전송 중...",
    multiFactorEnrollment: "다중 인증 등록",
    multiFactorAssertion: "다중 인증",
    mfaTotpVerification: "TOTP 인증",
    mfaSmsVerification: "SMS 인증",
    generateQrCode: "QR 코드 생성",
  },
  prompts: {
    noAccount: "계정이 없으신가요?",
    haveAccount: "이미 계정이 있으신가요?",
    enterEmailToReset: "비밀번호를 재설정하려면 이메일 주소를 입력해 주세요",
    signInToAccount: "계정에 로그인",
    smsVerificationPrompt: "전화번호로 전송된 인증 코드를 입력해 주세요",
    enterDetailsToCreate: "새 계정을 만들려면 정보를 입력해 주세요",
    enterPhoneNumber: "전화번호를 입력해 주세요",
    enterVerificationCode: "인증 코드를 입력해 주세요",
    enterEmailForLink: "로그인 링크를 받으려면 이메일을 입력해 주세요",
    mfaEnrollmentPrompt: "새 다중 인증 등록 방법을 선택해 주세요",
    mfaAssertionPrompt: "다중 인증 프로세스를 완료해 주세요",
    mfaAssertionFactorPrompt: "다중 인증 방법을 선택해 주세요",
    mfaTotpQrCodePrompt: "인증 앱으로 이 QR 코드를 스캔해 주세요",
    mfaTotpEnrollmentVerificationPrompt: "인증 앱에서 생성된 코드를 추가해 주세요",
  },
} satisfies Translations;
