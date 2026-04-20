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

/** Vietnamese VN (vi-VN) translation set. */
export const viVN = {
  errors: {
    userNotFound: "Không tìm thấy tài khoản nào với địa chỉ email này",
    wrongPassword: "Mật khẩu không đúng",
    invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ",
    userDisabled: "Tài khoản này đã bị vô hiệu hóa",
    networkRequestFailed: "Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối internet",
    tooManyRequests: "Quá nhiều lần thử không thành công. Vui lòng thử lại sau",
    missingVerificationCode: "Vui lòng nhập mã xác minh",
    emailAlreadyInUse: "Đã có tài khoản với email này",
    invalidCredential: "Thông tin xác thực được cung cấp không hợp lệ.",
    weakPassword: "Mật khẩu phải có ít nhất 6 ký tự",
    unverifiedEmail: "Vui lòng xác minh địa chỉ email của bạn để tiếp tục.",
    operationNotAllowed: "Thao tác này không được phép. Vui lòng liên hệ hỗ trợ.",
    invalidPhoneNumber: "Số điện thoại không hợp lệ",
    missingPhoneNumber: "Vui lòng cung cấp số điện thoại",
    quotaExceeded: "Đã vượt quá hạn mức SMS. Vui lòng thử lại sau",
    codeExpired: "Mã xác minh đã hết hạn",
    captchaCheckFailed: "Xác minh reCAPTCHA không thành công. Vui lòng thử lại.",
    missingVerificationId: "Vui lòng hoàn thành xác minh reCAPTCHA trước.",
    missingEmail: "Vui lòng cung cấp địa chỉ email",
    invalidActionCode: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
    credentialAlreadyInUse: "Đã có tài khoản với email này. Vui lòng đăng nhập bằng tài khoản đó.",
    requiresRecentLogin: "Thao tác này yêu cầu đăng nhập gần đây. Vui lòng đăng nhập lại.",
    providerAlreadyLinked: "Số điện thoại này đã được liên kết với tài khoản khác",
    invalidVerificationCode: "Mã xác minh không hợp lệ. Vui lòng thử lại",
    unknownError: "Đã xảy ra lỗi không mong muốn",
    popupClosed: "Cửa sổ đăng nhập đã bị đóng. Vui lòng thử lại.",
    accountExistsWithDifferentCredential:
      "Đã có tài khoản với email này. Vui lòng đăng nhập bằng nhà cung cấp ban đầu.",
    displayNameRequired: "Vui lòng cung cấp tên hiển thị",
    secondFactorAlreadyInUse: "Số điện thoại này đã được đăng ký với tài khoản này.",
  },
  messages: {
    passwordResetEmailSent: "Email đặt lại mật khẩu đã được gửi thành công",
    signInLinkSent: "Liên kết đăng nhập đã được gửi thành công",
    verificationCodeFirst: "Vui lòng yêu cầu mã xác minh trước",
    checkEmailForReset: "Kiểm tra email của bạn để xem hướng dẫn đặt lại mật khẩu",
    dividerOr: "hoặc",
    termsAndPrivacy: "Bằng cách tiếp tục, bạn đồng ý với {tos} và {privacy} của chúng tôi.",
    mfaSmsAssertionPrompt: "Mã xác minh sẽ được gửi đến {phoneNumber} để hoàn tất quá trình xác thực.",
  },
  labels: {
    emailAddress: "Địa chỉ Email",
    password: "Mật khẩu",
    displayName: "Tên hiển thị",
    forgotPassword: "Quên mật khẩu?",
    signUp: "Đăng ký",
    signIn: "Đăng nhập",
    resetPassword: "Đặt lại mật khẩu",
    createAccount: "Tạo tài khoản",
    backToSignIn: "Quay lại đăng nhập",
    signInWithPhone: "Đăng nhập bằng điện thoại",
    phoneNumber: "Số điện thoại",
    verificationCode: "Mã xác minh",
    sendCode: "Gửi mã",
    verifyCode: "Xác minh mã",
    signInWithGoogle: "Đăng nhập bằng Google",
    signInWithFacebook: "Đăng nhập bằng Facebook",
    signInWithApple: "Đăng nhập bằng Apple",
    signInWithMicrosoft: "Đăng nhập bằng Microsoft",
    signInWithGitHub: "Đăng nhập bằng GitHub",
    signInWithYahoo: "Đăng nhập bằng Yahoo",
    signInWithTwitter: "Đăng nhập bằng X",
    signInWithEmailLink: "Đăng nhập bằng liên kết email",
    signInWithEmail: "Đăng nhập bằng email",
    sendSignInLink: "Gửi liên kết đăng nhập",
    termsOfService: "Điều khoản dịch vụ",
    privacyPolicy: "Chính sách quyền riêng tư",
    resendCode: "Gửi lại mã",
    sending: "Đang gửi...",
    multiFactorEnrollment: "Đăng ký đa yếu tố",
    multiFactorAssertion: "Xác thực đa yếu tố",
    mfaTotpVerification: "Xác minh TOTP",
    mfaSmsVerification: "Xác minh SMS",
    generateQrCode: "Tạo mã QR",
  },
  prompts: {
    noAccount: "Chưa có tài khoản?",
    haveAccount: "Đã có tài khoản?",
    enterEmailToReset: "Nhập địa chỉ email của bạn để đặt lại mật khẩu",
    signInToAccount: "Đăng nhập vào tài khoản của bạn",
    smsVerificationPrompt: "Nhập mã xác minh được gửi đến số điện thoại của bạn",
    enterDetailsToCreate: "Nhập thông tin của bạn để tạo tài khoản mới",
    enterPhoneNumber: "Nhập số điện thoại của bạn",
    enterVerificationCode: "Nhập mã xác minh",
    enterEmailForLink: "Nhập email của bạn để nhận liên kết đăng nhập",
    mfaEnrollmentPrompt: "Chọn phương thức đăng ký đa yếu tố mới",
    mfaAssertionPrompt: "Vui lòng hoàn tất quá trình xác thực đa yếu tố",
    mfaAssertionFactorPrompt: "Vui lòng chọn phương thức xác thực đa yếu tố",
    mfaTotpQrCodePrompt: "Quét mã QR này bằng ứng dụng xác thực của bạn",
    mfaTotpEnrollmentVerificationPrompt: "Thêm mã được tạo bởi ứng dụng xác thực của bạn",
  },
} satisfies Translations;
