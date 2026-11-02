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

export const loLA = {
  errors: {
    userNotFound: "ບໍ່ພົບບັນຊີທີ່ໃຊ້ອີເມວນີ້",
    wrongPassword: "ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
    invalidEmail: "ກະລຸນາໃສ່ທີ່ຢູ່ອີເມວທີ່ຖືກຕ້ອງ",
    userDisabled: "ບັນຊີນີ້ຖືກປິດໃຊ້ງານແລ້ວ",
    networkRequestFailed: "ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້. ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ອິນເຕີເນັດຂອງທ່ານ",
    tooManyRequests: "ພະຍາຍາມຜິດພາດຫຼາຍເກີນໄປ. ກະລຸນາລອງໃໝ່ໃນພາຍຫຼັງ",
    missingVerificationCode: "ກະລຸນາໃສ່ລະຫັດຢືນຢັນ",
    emailAlreadyInUse: "ມີບັນຊີທີ່ໃຊ້ອີເມວນີ້ຢູ່ແລ້ວ",
    invalidCredential: "ຂໍ້ມູນການເຂົ້າສູ່ລະບົບທີ່ໃຫ້ມາບໍ່ຖືກຕ້ອງ.",
    weakPassword: "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ",
    unverifiedEmail: "ກະລຸນາຢືນຢັນທີ່ຢູ່ອີເມວຂອງທ່ານເພື່ອດຳເນີນການຕໍ່.",
    operationNotAllowed: "ບໍ່ອະນຸຍາດໃຫ້ດຳເນີນການນີ້. ກະລຸນາຕິດຕໍ່ຝ່າຍສະໜັບສະໜູນ.",
    invalidPhoneNumber: "ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ",
    missingPhoneNumber: "ກະລຸນາລະບຸເບີໂທລະສັບ",
    quotaExceeded: "ເກີນໂຄຕ້າ SMS ແລ້ວ. ກະລຸນາລອງໃໝ່ໃນພາຍຫຼັງ",
    codeExpired: "ລະຫັດຢືນຢັນໝົດອາຍຸແລ້ວ",
    captchaCheckFailed: "ການຢືນຢັນ reCAPTCHA ລົ້ມເຫຼວ. ກະລຸນາລອງໃໝ່.",
    missingVerificationId: "ກະລຸນາຢືນຢັນ reCAPTCHA ໃຫ້ສຳເລັດກ່ອນ.",
    missingEmail: "ກະລຸນາລະບຸທີ່ຢູ່ອີເມວ",
    invalidActionCode: "ລິ້ງຕັ້ງລະຫັດຜ່ານໃໝ່ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸແລ້ວ",
    credentialAlreadyInUse: "ມີບັນຊີທີ່ໃຊ້ອີເມວນີ້ຢູ່ແລ້ວ. ກະລຸນາເຂົ້າສູ່ລະບົບດ້ວຍບັນຊີນັ້ນ.",
    requiresRecentLogin: "ການດຳເນີນການນີ້ຕ້ອງການການເຂົ້າສູ່ລະບົບຫຼ້າສຸດ. ກະລຸນາເຂົ້າສູ່ລະບົບອີກຄັ້ງ.",
    providerAlreadyLinked: "ເບີໂທລະສັບນີ້ຖືກເຊື່ອມກັບບັນຊີອື່ນແລ້ວ",
    invalidVerificationCode: "ລະຫັດຢືນຢັນບໍ່ຖືກຕ້ອງ. ກະລຸນາລອງໃໝ່",
    unknownError: "ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຄາດຄິດ",
    popupClosed: "ໜ້າຕ່າງເຂົ້າສູ່ລະບົບຖືກປິດແລ້ວ. ກະລຸນາລອງໃໝ່.",
    accountExistsWithDifferentCredential: "ມີບັນຊີທີ່ໃຊ້ອີເມວນີ້ຢູ່ແລ້ວ. ກະລຸນາເຂົ້າສູ່ລະບົບດ້ວຍຜູ້ໃຫ້ບໍລິການເດີມ.",
    displayNameRequired: "ກະລຸນາລະບຸຊື່ທີ່ສະແດງ",
    secondFactorAlreadyInUse: "ເບີໂທລະສັບນີ້ໄດ້ລົງທະບຽນກັບບັນຊີນີ້ແລ້ວ.",
  },
  messages: {
    passwordResetEmailSent: "ສົ່ງອີເມວຕັ້ງລະຫັດຜ່ານໃໝ່ສຳເລັດແລ້ວ",
    signInLinkSent: "ສົ່ງລິ້ງເຂົ້າສູ່ລະບົບສຳເລັດແລ້ວ",
    verificationCodeFirst: "ກະລຸນາຂໍລະຫັດຢືນຢັນກ່ອນ",
    checkEmailForReset: "ກວດສອບອີເມວຂອງທ່ານສຳລັບຄຳແນະນຳການຕັ້ງລະຫັດຜ່ານໃໝ່",
    dividerOr: "ຫຼື",
    termsAndPrivacy: "ເມື່ອດຳເນີນການຕໍ່, ທ່ານຕົກລົງຕາມ {tos} ແລະ {privacy} ຂອງພວກເຮົາ.",
    mfaSmsAssertionPrompt: "ລະຫັດຢືນຢັນຈະຖືກສົ່ງໄປທີ່ {phoneNumber} ເພື່ອສຳເລັດຂັ້ນຕອນການກວດສອບຕົວຕົນ.",
  },
  labels: {
    emailAddress: "ທີ່ຢູ່ອີເມວ",
    password: "ລະຫັດຜ່ານ",
    displayName: "ຊື່ທີ່ສະແດງ",
    forgotPassword: "ລືມລະຫັດຜ່ານ?",
    signUp: "ລົງທະບຽນ",
    signIn: "ເຂົ້າສູ່ລະບົບ",
    resetPassword: "ຕັ້ງລະຫັດຜ່ານໃໝ່",
    createAccount: "ສ້າງບັນຊີ",
    backToSignIn: "ກັບໄປເຂົ້າສູ່ລະບົບ",
    signInWithPhone: "ເຂົ້າສູ່ລະບົບດ້ວຍເບີໂທ",
    phoneNumber: "ເບີໂທລະສັບ",
    verificationCode: "ລະຫັດຢືນຢັນ",
    sendCode: "ສົ່ງລະຫັດ",
    verifyCode: "ຢືນຢັນລະຫັດ",
    signInWithGoogle: "ເຂົ້າສູ່ລະບົບດ້ວຍ Google",
    signInWithFacebook: "ເຂົ້າສູ່ລະບົບດ້ວຍ Facebook",
    signInWithApple: "ເຂົ້າສູ່ລະບົບດ້ວຍ Apple",
    signInWithMicrosoft: "ເຂົ້າສູ່ລະບົບດ້ວຍ Microsoft",
    signInWithGitHub: "ເຂົ້າສູ່ລະບົບດ້ວຍ GitHub",
    signInWithYahoo: "ເຂົ້າສູ່ລະບົບດ້ວຍ Yahoo",
    signInWithTwitter: "ເຂົ້າສູ່ລະບົບດ້ວຍ X",
    signInWithEmailLink: "ເຂົ້າສູ່ລະບົບດ້ວຍລິ້ງອີເມວ",
    sendSignInLink: "ສົ່ງລິ້ງເຂົ້າສູ່ລະບົບ",
    termsOfService: "ເງື່ອນໄຂການໃຫ້ບໍລິການ",
    privacyPolicy: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ",
    resendCode: "ສົ່ງລະຫັດອີກຄັ້ງ",
    sending: "ກຳລັງສົ່ງ...",
    multiFactorEnrollment: "ການລົງທະບຽນຫຼາຍປັດໃຈ",
    multiFactorAssertion: "ການກວດສອບຕົວຕົນຫຼາຍປັດໃຈ",
    mfaTotpVerification: "ການຢືນຢັນ TOTP",
    mfaSmsVerification: "ການຢືນຢັນ SMS",
    generateQrCode: "ສ້າງລະຫັດ QR",
  },
  prompts: {
    noAccount: "ບໍ່ມີບັນຊີບໍ?",
    haveAccount: "ມີບັນຊີແລ້ວບໍ?",
    enterEmailToReset: "ໃສ່ທີ່ຢູ່ອີເມວຂອງທ່ານເພື່ອຕັ້ງລະຫັດຜ່ານໃໝ່",
    signInToAccount: "ເຂົ້າສູ່ລະບົບບັນຊີຂອງທ່ານ",
    smsVerificationPrompt: "ໃສ່ລະຫັດຢືນຢັນທີ່ສົ່ງໄປເບີໂທລະສັບຂອງທ່ານ",
    enterDetailsToCreate: "ໃສ່ຂໍ້ມູນຂອງທ່ານເພື່ອສ້າງບັນຊີໃໝ່",
    enterPhoneNumber: "ໃສ່ເບີໂທລະສັບຂອງທ່ານ",
    enterVerificationCode: "ໃສ່ລະຫັດຢືນຢັນ",
    enterEmailForLink: "ໃສ່ອີເມວຂອງທ່ານເພື່ອຮັບລິ້ງເຂົ້າສູ່ລະບົບ",
    mfaEnrollmentPrompt: "ເລືອກວິທີລົງທະບຽນຫຼາຍປັດໃຈໃໝ່",
    mfaAssertionPrompt: "ກະລຸນາສຳເລັດຂັ້ນຕອນການກວດສອບຕົວຕົນຫຼາຍປັດໃຈ",
    mfaAssertionFactorPrompt: "ກະລຸນາເລືອກວິທີກວດສອບຕົວຕົນຫຼາຍປັດໃຈ",
    mfaTotpQrCodePrompt: "ສະແກນລະຫັດ QR ນີ້ດ້ວຍແອັບຢືນຢັນຂອງທ່ານ",
    mfaTotpEnrollmentVerificationPrompt: "ເພີ່ມລະຫັດທີ່ແອັບຢືນຢັນຂອງທ່ານສ້າງຂຶ້ນ",
  },
} satisfies Translations;
