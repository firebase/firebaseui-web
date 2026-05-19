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

/** Chinese Simplified CN (zh-CN) translation set. */
export const zhCN = {
  errors: {
    userNotFound: "未找到使用此电子邮件地址的账户",
    wrongPassword: "密码不正确",
    invalidEmail: "请输入有效的电子邮件地址",
    userDisabled: "此账户已被禁用",
    networkRequestFailed: "无法连接到服务器。请检查您的网络连接",
    tooManyRequests: "失败次数过多。请稍后再试",
    missingVerificationCode: "请输入验证码",
    emailAlreadyInUse: "该电子邮件地址已有账户",
    invalidCredential: "提供的凭据无效。",
    weakPassword: "密码长度至少为6个字符",
    unverifiedEmail: "请先验证您的电子邮件地址才能继续。",
    operationNotAllowed: "此操作不被允许。请联系支持人员。",
    invalidPhoneNumber: "电话号码无效",
    missingPhoneNumber: "请提供电话号码",
    quotaExceeded: "短信配额已超出。请稍后再试",
    codeExpired: "验证码已过期",
    captchaCheckFailed: "reCAPTCHA 验证失败。请重试。",
    missingVerificationId: "请先完成 reCAPTCHA 验证。",
    missingEmail: "请提供电子邮件地址",
    invalidActionCode: "密码重置链接无效或已过期",
    credentialAlreadyInUse: "该电子邮件地址已有账户。请使用该账户登录。",
    requiresRecentLogin: "此操作需要最近的登录。请重新登录。",
    providerAlreadyLinked: "此电话号码已关联到另一个账户",
    invalidVerificationCode: "验证码无效。请重试",
    unknownError: "发生了意外错误",
    popupClosed: "登录弹窗已关闭。请重试。",
    accountExistsWithDifferentCredential: "该电子邮件地址已有账户。请使用原始提供商登录。",
    displayNameRequired: "请提供显示名称",
    secondFactorAlreadyInUse: "此电话号码已注册到该账户。",
  },
  messages: {
    passwordResetEmailSent: "密码重置邮件发送成功",
    signInLinkSent: "登录链接发送成功",
    verificationCodeFirst: "请先请求验证码",
    checkEmailForReset: "查看您的电子邮件以获取密码重置说明",
    dividerOr: "或",
    termsAndPrivacy: "继续即表示您同意我们的{tos}和{privacy}。",
    mfaSmsAssertionPrompt: "将向 {phoneNumber} 发送验证码以完成身份验证过程。",
  },
  labels: {
    emailAddress: "电子邮件地址",
    password: "密码",
    displayName: "显示名称",
    forgotPassword: "忘记密码？",
    signUp: "注册",
    signIn: "登录",
    resetPassword: "重置密码",
    createAccount: "创建账户",
    backToSignIn: "返回登录",
    signInWithPhone: "使用手机号登录",
    phoneNumber: "电话号码",
    verificationCode: "验证码",
    sendCode: "发送验证码",
    verifyCode: "验证验证码",
    signInWithGoogle: "使用 Google 登录",
    signInWithFacebook: "使用 Facebook 登录",
    signInWithApple: "使用 Apple 登录",
    signInWithMicrosoft: "使用 Microsoft 登录",
    signInWithGitHub: "使用 GitHub 登录",
    signInWithYahoo: "使用 Yahoo 登录",
    signInWithTwitter: "使用 X 登录",
    signInWithEmailLink: "使用电子邮件链接登录",
    signInWithEmail: "使用电子邮件登录",
    sendSignInLink: "发送登录链接",
    termsOfService: "服务条款",
    privacyPolicy: "隐私政策",
    resendCode: "重新发送验证码",
    sending: "发送中...",
    multiFactorEnrollment: "多因素注册",
    multiFactorAssertion: "多因素身份验证",
    mfaTotpVerification: "TOTP 验证",
    mfaSmsVerification: "短信验证",
    generateQrCode: "生成二维码",
  },
  prompts: {
    noAccount: "没有账户？",
    haveAccount: "已有账户？",
    enterEmailToReset: "输入您的电子邮件地址以重置密码",
    signInToAccount: "登录您的账户",
    smsVerificationPrompt: "输入发送到您手机号码的验证码",
    enterDetailsToCreate: "输入您的详细信息以创建新账户",
    enterPhoneNumber: "输入您的电话号码",
    enterVerificationCode: "输入验证码",
    enterEmailForLink: "输入您的电子邮件以接收登录链接",
    mfaEnrollmentPrompt: "选择新的多因素注册方法",
    mfaAssertionPrompt: "请完成多因素身份验证过程",
    mfaAssertionFactorPrompt: "请选择多因素身份验证方法",
    mfaTotpQrCodePrompt: "使用您的身份验证器应用扫描此二维码",
    mfaTotpEnrollmentVerificationPrompt: "添加您的身份验证器应用生成的验证码",
  },
} satisfies Translations;
