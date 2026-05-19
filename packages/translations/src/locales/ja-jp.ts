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

/** Japanese JP (ja-JP) translation set. */
export const jaJP = {
  errors: {
    userNotFound: "このメールアドレスに関連するアカウントが見つかりません",
    wrongPassword: "パスワードが正しくありません",
    invalidEmail: "有効なメールアドレスを入力してください",
    userDisabled: "このアカウントは無効になっています",
    networkRequestFailed: "サーバーに接続できません。インターネット接続を確認してください",
    tooManyRequests: "試行回数が多すぎます。後でもう一度お試しください",
    missingVerificationCode: "確認コードを入力してください",
    emailAlreadyInUse: "このメールアドレスはすでに使用されています",
    invalidCredential: "入力された認証情報が無効です。",
    weakPassword: "パスワードは6文字以上で設定してください",
    unverifiedEmail: "続行するにはメールアドレスを確認してください。",
    operationNotAllowed: "この操作は許可されていません。サポートにお問い合わせください。",
    invalidPhoneNumber: "電話番号が無効です",
    missingPhoneNumber: "電話番号を入力してください",
    quotaExceeded: "SMSの送信制限を超えました。後でもう一度お試しください",
    codeExpired: "確認コードの有効期限が切れています",
    captchaCheckFailed: "reCAPTCHA の確認に失敗しました。もう一度お試しください。",
    missingVerificationId: "最初に reCAPTCHA 確認を完了してください。",
    missingEmail: "メールアドレスを入力してください",
    invalidActionCode: "パスワードリセットリンクが無効または期限切れです",
    credentialAlreadyInUse: "このメールアドレスはすでに使用されています。そのアカウントでサインインしてください。",
    requiresRecentLogin: "この操作には最近のログインが必要です。再度ログインしてください。",
    providerAlreadyLinked: "この電話番号はすでに別のアカウントに関連付けられています",
    invalidVerificationCode: "確認コードが無効です。もう一度お試しください",
    unknownError: "予期しないエラーが発生しました",
    popupClosed: "サインインポップアップが閉じられました。もう一度お試しください。",
    accountExistsWithDifferentCredential:
      "このメールアドレスはすでに使用されています。元のプロバイダーでサインインしてください。",
    displayNameRequired: "表示名を入力してください",
    secondFactorAlreadyInUse: "この電話番号はすでにこのアカウントに登録されています。",
  },
  messages: {
    passwordResetEmailSent: "パスワードリセットメールを送信しました",
    signInLinkSent: "サインインリンクを送信しました",
    verificationCodeFirst: "最初に確認コードをリクエストしてください",
    checkEmailForReset: "パスワードリセットの手順についてメールを確認してください",
    dividerOr: "または",
    termsAndPrivacy: "続行することで、{tos}および{privacy}に同意したことになります。",
    mfaSmsAssertionPrompt: "認証プロセスを完了するために、{phoneNumber}に確認コードが送信されます。",
  },
  labels: {
    emailAddress: "メールアドレス",
    password: "パスワード",
    displayName: "表示名",
    forgotPassword: "パスワードをお忘れですか？",
    signUp: "登録",
    signIn: "サインイン",
    resetPassword: "パスワードをリセット",
    createAccount: "アカウントを作成",
    backToSignIn: "サインインに戻る",
    signInWithPhone: "電話番号でサインイン",
    phoneNumber: "電話番号",
    verificationCode: "確認コード",
    sendCode: "コードを送信",
    verifyCode: "コードを確認",
    signInWithGoogle: "Google でサインイン",
    signInWithFacebook: "Facebook でサインイン",
    signInWithApple: "Apple でサインイン",
    signInWithMicrosoft: "Microsoft でサインイン",
    signInWithGitHub: "GitHub でサインイン",
    signInWithYahoo: "Yahoo でサインイン",
    signInWithTwitter: "X でサインイン",
    signInWithEmailLink: "メールリンクでサインイン",
    signInWithEmail: "メールでサインイン",
    sendSignInLink: "サインインリンクを送信",
    termsOfService: "利用規約",
    privacyPolicy: "プライバシーポリシー",
    resendCode: "コードを再送信",
    sending: "送信中...",
    multiFactorEnrollment: "多要素認証の登録",
    multiFactorAssertion: "多要素認証",
    mfaTotpVerification: "TOTP 確認",
    mfaSmsVerification: "SMS 確認",
    generateQrCode: "QR コードを生成",
  },
  prompts: {
    noAccount: "アカウントをお持ちでないですか？",
    haveAccount: "すでにアカウントをお持ちですか？",
    enterEmailToReset: "パスワードをリセットするためにメールアドレスを入力してください",
    signInToAccount: "アカウントにサインイン",
    smsVerificationPrompt: "電話番号に送信された確認コードを入力してください",
    enterDetailsToCreate: "新しいアカウントを作成するための詳細を入力してください",
    enterPhoneNumber: "電話番号を入力してください",
    enterVerificationCode: "確認コードを入力してください",
    enterEmailForLink: "サインインリンクを受け取るためにメールアドレスを入力してください",
    mfaEnrollmentPrompt: "新しい多要素認証の登録方法を選択してください",
    mfaAssertionPrompt: "多要素認証プロセスを完了してください",
    mfaAssertionFactorPrompt: "多要素認証方法を選択してください",
    mfaTotpQrCodePrompt: "認証アプリでこのQRコードをスキャンしてください",
    mfaTotpEnrollmentVerificationPrompt: "認証アプリで生成されたコードを追加してください",
  },
} satisfies Translations;
