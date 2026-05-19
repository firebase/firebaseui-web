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

/** Thai TH (th-TH) translation set. */
export const thTH = {
  errors: {
    userNotFound: "ไม่พบบัญชีที่ใช้อีเมลนี้",
    wrongPassword: "รหัสผ่านไม่ถูกต้อง",
    invalidEmail: "โปรดป้อนอีเมลที่ถูกต้อง",
    userDisabled: "บัญชีนี้ถูกปิดใช้งานแล้ว",
    networkRequestFailed: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
    tooManyRequests: "พยายามเข้าสู่ระบบล้มเหลวหลายครั้งเกินไป โปรดลองอีกครั้งในภายหลัง",
    missingVerificationCode: "โปรดป้อนรหัสยืนยัน",
    emailAlreadyInUse: "มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว",
    invalidCredential: "ข้อมูลรับรองที่ระบุไม่ถูกต้อง",
    weakPassword: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    unverifiedEmail: "โปรดยืนยันอีเมลของคุณเพื่อดำเนินการต่อ",
    operationNotAllowed: "การดำเนินการนี้ไม่ได้รับอนุญาต โปรดติดต่อฝ่ายสนับสนุน",
    invalidPhoneNumber: "หมายเลขโทรศัพท์ไม่ถูกต้อง",
    missingPhoneNumber: "โปรดระบุหมายเลขโทรศัพท์",
    quotaExceeded: "เกินโควต้า SMS แล้ว โปรดลองอีกครั้งในภายหลัง",
    codeExpired: "รหัสยืนยันหมดอายุแล้ว",
    captchaCheckFailed: "การยืนยัน reCAPTCHA ล้มเหลว โปรดลองอีกครั้ง",
    missingVerificationId: "โปรดทำการยืนยัน reCAPTCHA ก่อน",
    missingEmail: "โปรดระบุอีเมล",
    invalidActionCode: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว",
    credentialAlreadyInUse: "มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว โปรดลงชื่อเข้าใช้ด้วยบัญชีนั้น",
    requiresRecentLogin: "การดำเนินการนี้ต้องมีการเข้าสู่ระบบล่าสุด โปรดลงชื่อเข้าใช้อีกครั้ง",
    providerAlreadyLinked: "หมายเลขโทรศัพท์นี้เชื่อมโยงกับบัญชีอื่นแล้ว",
    invalidVerificationCode: "รหัสยืนยันไม่ถูกต้อง โปรดลองอีกครั้ง",
    unknownError: "เกิดข้อผิดพลาดที่ไม่คาดคิด",
    popupClosed: "หน้าต่างลงชื่อเข้าใช้ถูกปิดแล้ว โปรดลองอีกครั้ง",
    accountExistsWithDifferentCredential: "มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว โปรดลงชื่อเข้าใช้ด้วยผู้ให้บริการเดิม",
    displayNameRequired: "โปรดระบุชื่อที่แสดง",
    secondFactorAlreadyInUse: "หมายเลขโทรศัพท์นี้ลงทะเบียนกับบัญชีนี้แล้ว",
  },
  messages: {
    passwordResetEmailSent: "ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว",
    signInLinkSent: "ส่งลิงก์ลงชื่อเข้าใช้เรียบร้อยแล้ว",
    verificationCodeFirst: "โปรดขอรหัสยืนยันก่อน",
    checkEmailForReset: "ตรวจสอบอีเมลของคุณเพื่อดูคำแนะนำการรีเซ็ตรหัสผ่าน",
    dividerOr: "หรือ",
    termsAndPrivacy: "การดำเนินการต่อถือว่าคุณยอมรับ {tos} และ {privacy} ของเรา",
    mfaSmsAssertionPrompt: "รหัสยืนยันจะถูกส่งไปยัง {phoneNumber} เพื่อดำเนินการตรวจสอบสิทธิ์ให้เสร็จสมบูรณ์",
  },
  labels: {
    emailAddress: "ที่อยู่อีเมล",
    password: "รหัสผ่าน",
    displayName: "ชื่อที่แสดง",
    forgotPassword: "ลืมรหัสผ่าน?",
    signUp: "สมัครสมาชิก",
    signIn: "ลงชื่อเข้าใช้",
    resetPassword: "รีเซ็ตรหัสผ่าน",
    createAccount: "สร้างบัญชี",
    backToSignIn: "กลับไปลงชื่อเข้าใช้",
    signInWithPhone: "ลงชื่อเข้าใช้ด้วยโทรศัพท์",
    phoneNumber: "หมายเลขโทรศัพท์",
    verificationCode: "รหัสยืนยัน",
    sendCode: "ส่งรหัส",
    verifyCode: "ยืนยันรหัส",
    signInWithGoogle: "ลงชื่อเข้าใช้ด้วย Google",
    signInWithFacebook: "ลงชื่อเข้าใช้ด้วย Facebook",
    signInWithApple: "ลงชื่อเข้าใช้ด้วย Apple",
    signInWithMicrosoft: "ลงชื่อเข้าใช้ด้วย Microsoft",
    signInWithGitHub: "ลงชื่อเข้าใช้ด้วย GitHub",
    signInWithYahoo: "ลงชื่อเข้าใช้ด้วย Yahoo",
    signInWithTwitter: "ลงชื่อเข้าใช้ด้วย X",
    signInWithEmailLink: "ลงชื่อเข้าใช้ด้วยลิงก์อีเมล",
    signInWithEmail: "ลงชื่อเข้าใช้ด้วยอีเมล",
    sendSignInLink: "ส่งลิงก์ลงชื่อเข้าใช้",
    termsOfService: "ข้อกำหนดการให้บริการ",
    privacyPolicy: "นโยบายความเป็นส่วนตัว",
    resendCode: "ส่งรหัสอีกครั้ง",
    sending: "กำลังส่ง...",
    multiFactorEnrollment: "การลงทะเบียนหลายปัจจัย",
    multiFactorAssertion: "การตรวจสอบสิทธิ์หลายปัจจัย",
    mfaTotpVerification: "การยืนยัน TOTP",
    mfaSmsVerification: "การยืนยัน SMS",
    generateQrCode: "สร้างรหัส QR",
  },
  prompts: {
    noAccount: "ไม่มีบัญชี?",
    haveAccount: "มีบัญชีอยู่แล้ว?",
    enterEmailToReset: "ป้อนอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน",
    signInToAccount: "ลงชื่อเข้าใช้บัญชีของคุณ",
    smsVerificationPrompt: "ป้อนรหัสยืนยันที่ส่งไปยังหมายเลขโทรศัพท์ของคุณ",
    enterDetailsToCreate: "ป้อนรายละเอียดของคุณเพื่อสร้างบัญชีใหม่",
    enterPhoneNumber: "ป้อนหมายเลขโทรศัพท์ของคุณ",
    enterVerificationCode: "ป้อนรหัสยืนยัน",
    enterEmailForLink: "ป้อนอีเมลของคุณเพื่อรับลิงก์ลงชื่อเข้าใช้",
    mfaEnrollmentPrompt: "เลือกวิธีการลงทะเบียนหลายปัจจัยใหม่",
    mfaAssertionPrompt: "โปรดดำเนินการตรวจสอบสิทธิ์หลายปัจจัยให้เสร็จสมบูรณ์",
    mfaAssertionFactorPrompt: "โปรดเลือกวิธีการตรวจสอบสิทธิ์หลายปัจจัย",
    mfaTotpQrCodePrompt: "สแกนรหัส QR นี้ด้วยแอปตรวจสอบสิทธิ์ของคุณ",
    mfaTotpEnrollmentVerificationPrompt: "เพิ่มรหัสที่สร้างโดยแอปตรวจสอบสิทธิ์ของคุณ",
  },
} satisfies Translations;
