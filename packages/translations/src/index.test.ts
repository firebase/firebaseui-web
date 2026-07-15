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

import { describe, it, expect } from "vitest";
import {
  registerLocale,
  enUs,
  type Locale,
  type RegisteredLocale,
  csCz,
  ar,
  deDe,
  esEs,
  frFr,
  hiIn,
  itIt,
  jaJp,
  koKr,
  ptBr,
  zhCn,
  bgBg,
  caEs,
  daDk,
  elGr,
  enGb,
  esLa,
  faIr,
  fiFi,
  filPh,
  heIl,
  hrHr,
  huHu,
  idId,
  ltLt,
  lvLv,
  nbNo,
  nlNl,
  plPl,
  ptPt,
  roRo,
  ruRu,
  skSk,
  slSi,
  srRs,
  svSe,
  thTh,
  trTr,
  ukUa,
  viVn,
  zhTw,
} from "./index";
import { enUS } from "./locales/en-us";
import { csCZ } from "./locales/cs-cz";
import { ar as arTranslations } from "./locales/ar";
import { bgBG } from "./locales/bg-bg";
import { caES } from "./locales/ca-es";
import { daDK } from "./locales/da-dk";
import { deDE } from "./locales/de-de";
import { elGR } from "./locales/el-gr";
import { enGB } from "./locales/en-gb";
import { esES } from "./locales/es-es";
import { es419 } from "./locales/es-419";
import { faIR } from "./locales/fa-ir";
import { fiFI } from "./locales/fi-fi";
import { filPH } from "./locales/fil-ph";
import { frFR } from "./locales/fr-fr";
import { heIL } from "./locales/he-il";
import { hiIN } from "./locales/hi-in";
import { hrHR } from "./locales/hr-hr";
import { huHU } from "./locales/hu-hu";
import { idID } from "./locales/id-id";
import { itIT } from "./locales/it-it";
import { jaJP } from "./locales/ja-jp";
import { koKR } from "./locales/ko-kr";
import { ltLT } from "./locales/lt-lt";
import { lvLV } from "./locales/lv-lv";
import { nbNO } from "./locales/nb-no";
import { nlNL } from "./locales/nl-nl";
import { plPL } from "./locales/pl-pl";
import { ptBR } from "./locales/pt-br";
import { ptPT } from "./locales/pt-pt";
import { roRO } from "./locales/ro-ro";
import { ruRU } from "./locales/ru-ru";
import { skSK } from "./locales/sk-sk";
import { slSI } from "./locales/sl-si";
import { srRS } from "./locales/sr-rs";
import { svSE } from "./locales/sv-se";
import { thTH } from "./locales/th-th";
import { trTR } from "./locales/tr-tr";
import { ukUA } from "./locales/uk-ua";
import { viVN } from "./locales/vi-vn";
import { zhCN } from "./locales/zh-cn";
import { zhTW } from "./locales/zh-tw";
import type { Translations } from "./types";
import { getTranslation, ERROR_CODE_MAP } from "./mapping";
import * as types from "./types";

describe("index.ts", () => {
  describe("registerLocale", () => {
    it("should register a locale with valid inputs", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error message",
        },
        labels: {
          emailAddress: "Test email label",
        },
      };

      const result = registerLocale("en-US", mockTranslations);

      expect(result).toEqual({
        locale: "en-US",
        translations: mockTranslations,
      });
    });

    it("should register a locale with different locale formats", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error message",
        },
      };

      const locales: Locale[] = ["en-US", "fr-FR", "es-ES", "custom-locale"];

      locales.forEach((locale) => {
        const result = registerLocale(locale, mockTranslations);
        expect(result.locale).toBe(locale);
        expect(result.translations).toBe(mockTranslations);
      });
    });

    it("should handle empty translations object", () => {
      const emptyTranslations: Translations = {};

      const result = registerLocale("en-US", emptyTranslations);

      expect(result).toEqual({
        locale: "en-US",
        translations: {},
      });
    });

    it("should handle partial translations", () => {
      const partialTranslations: Translations = {
        errors: {
          userNotFound: "User not found",
        },
        // messages, labels, and prompts are undefined
      };

      const result = registerLocale("en-US", partialTranslations);

      expect(result.translations).toEqual(partialTranslations);
      expect(result.translations.errors?.userNotFound).toBe("User not found");
      expect(result.translations.messages).toBeUndefined();
      expect(result.translations.labels).toBeUndefined();
      expect(result.translations.prompts).toBeUndefined();
    });

    it("should preserve reference to original translations object", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error message",
        },
      };

      const result = registerLocale("en-US", mockTranslations);

      // The translations should be the same reference
      expect(result.translations).toBe(mockTranslations);
    });

    it("should register a locale with fallback", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error message",
        },
      };

      const fallbackLocale = registerLocale("en-US", mockTranslations);
      const result = registerLocale("fr-FR", mockTranslations, fallbackLocale);

      expect(result.locale).toBe("fr-FR");
      expect(result.translations).toBe(mockTranslations);
      expect(result.fallback).toBe(fallbackLocale);
    });

    it("should handle nested fallbacks", () => {
      const level1Translations: Translations = {
        errors: {
          userNotFound: "Level 1 error",
        },
      };

      const level2Translations: Translations = {
        errors: {
          wrongPassword: "Level 2 error",
        },
      };

      const level3Translations: Translations = {
        errors: {
          invalidEmail: "Level 3 error",
        },
      };

      const level1 = registerLocale("en-US", level1Translations);
      const level2 = registerLocale("fr-FR", level2Translations, level1);
      const level3 = registerLocale("es-ES", level3Translations, level2);

      expect(level3.fallback).toBe(level2);
      expect(level2.fallback).toBe(level1);
      expect(level1.fallback).toBeUndefined();
    });
  });

  describe("enUs export", () => {
    it("should export enUs with correct structure", () => {
      expect(enUs).toBeDefined();
      expect(enUs.locale).toBe("en-US");
      expect(enUs.translations).toBeDefined();
    });

    it("should export csCz with correct structure", () => {
      expect(csCz).toBeDefined();
      expect(csCz.locale).toBe("cs-CZ");
      expect(csCz.translations).toBeDefined();
    });

    it("should use the correct enUS translations", () => {
      expect(enUs.translations).toBe(enUS);
    });

    it("should use the correct csCZ translations", () => {
      expect(csCz.translations).toBe(csCZ);
    });
  });

  describe("locale exports", () => {
    const localeFixtures = [
      {
        exported: ar,
        locale: "ar",
        translations: arTranslations,
        label: "ar",
        sampleError: "لم يتم العثور على حساب بهذا البريد الإلكتروني",
        sampleLabel: "تسجيل الدخول",
        samplePrompt: "ليس لديك حساب؟",
      },
      {
        exported: deDe,
        locale: "de-DE",
        translations: deDE,
        label: "deDe",
        sampleError: "Kein Konto mit dieser E-Mail-Adresse gefunden",
        sampleLabel: "Anmelden",
        samplePrompt: "Noch kein Konto?",
      },
      {
        exported: esEs,
        locale: "es-ES",
        translations: esES,
        label: "esEs",
        sampleError: "No se encontró ninguna cuenta con esta dirección de correo electrónico",
        sampleLabel: "Iniciar sesión",
        samplePrompt: "¿No tienes una cuenta?",
      },
      {
        exported: frFr,
        locale: "fr-FR",
        translations: frFR,
        label: "frFr",
        sampleError: "Aucun compte trouvé avec cette adresse e-mail",
        sampleLabel: "Se connecter",
        samplePrompt: "Vous n'avez pas de compte ?",
      },
      {
        exported: hiIn,
        locale: "hi-IN",
        translations: hiIN,
        label: "hiIn",
        sampleError: "इस ईमेल पते से कोई खाता नहीं मिला",
        sampleLabel: "साइन इन करें",
        samplePrompt: "खाता नहीं है?",
      },
      {
        exported: itIt,
        locale: "it-IT",
        translations: itIT,
        label: "itIt",
        sampleError: "Nessun account trovato con questo indirizzo email",
        sampleLabel: "Accedi",
        samplePrompt: "Non hai un account?",
      },
      {
        exported: jaJp,
        locale: "ja-JP",
        translations: jaJP,
        label: "jaJp",
        sampleError: "このメールアドレスに関連するアカウントが見つかりません",
        sampleLabel: "サインイン",
        samplePrompt: "アカウントをお持ちでないですか？",
      },
      {
        exported: koKr,
        locale: "ko-KR",
        translations: koKR,
        label: "koKr",
        sampleError: "이 이메일 주소로 등록된 계정을 찾을 수 없습니다",
        sampleLabel: "로그인",
        samplePrompt: "계정이 없으신가요?",
      },
      {
        exported: ptBr,
        locale: "pt-BR",
        translations: ptBR,
        label: "ptBr",
        sampleError: "Nenhuma conta encontrada com este endereço de e-mail",
        sampleLabel: "Entrar",
        samplePrompt: "Não tem uma conta?",
      },
      {
        exported: zhCn,
        locale: "zh-CN",
        translations: zhCN,
        label: "zhCn",
        sampleError: "未找到使用此电子邮件地址的账户",
        sampleLabel: "登录",
        samplePrompt: "没有账户？",
      },
      {
        exported: bgBg,
        locale: "bg-BG",
        translations: bgBG,
        label: "bgBg",
        sampleError: "Не е намерен акаунт с този имейл адрес",
        sampleLabel: "Вход",
        samplePrompt: "Нямате акаунт?",
      },
      {
        exported: caEs,
        locale: "ca-ES",
        translations: caES,
        label: "caEs",
        sampleError: "No s'ha trobat cap compte amb aquesta adreça electrònica",
        sampleLabel: "Inicieu sessió",
        samplePrompt: "No teniu cap compte?",
      },
      {
        exported: daDk,
        locale: "da-DK",
        translations: daDK,
        label: "daDk",
        sampleError: "Ingen konto fundet med denne e-mailadresse",
        sampleLabel: "Log ind",
        samplePrompt: "Har du ikke en konto?",
      },
      {
        exported: elGr,
        locale: "el-GR",
        translations: elGR,
        label: "elGr",
        sampleError: "Δεν βρέθηκε λογαριασμός με αυτή τη διεύθυνση email",
        sampleLabel: "Σύνδεση",
        samplePrompt: "Δεν έχετε λογαριασμό;",
      },
      {
        exported: enGb,
        locale: "en-GB",
        translations: enGB,
        label: "enGb",
        sampleError: "No account found with this email address",
        sampleLabel: "Sign In",
        samplePrompt: "Don't have an account?",
      },
      {
        exported: esLa,
        locale: "es-419",
        translations: es419,
        label: "esLa",
        sampleError: "No se encontró ninguna cuenta con esta dirección de correo electrónico",
        sampleLabel: "Iniciar sesión",
        samplePrompt: "¿No tienes una cuenta?",
      },
      {
        exported: faIr,
        locale: "fa-IR",
        translations: faIR,
        label: "faIr",
        sampleError: "هیچ حسابی با این آدرس ایمیل یافت نشد",
        sampleLabel: "ورود",
        samplePrompt: "حساب ندارید؟",
      },
      {
        exported: fiFi,
        locale: "fi-FI",
        translations: fiFI,
        label: "fiFi",
        sampleError: "Tällä sähköpostiosoitteella ei löydy tiliä",
        sampleLabel: "Kirjaudu sisään",
        samplePrompt: "Eikö sinulla ole tiliä?",
      },
      {
        exported: filPh,
        locale: "fil-PH",
        translations: filPH,
        label: "filPh",
        sampleError: "Walang account na natagpuan sa email address na ito",
        sampleLabel: "Mag-sign In",
        samplePrompt: "Wala kang account?",
      },
      {
        exported: heIl,
        locale: "he-IL",
        translations: heIL,
        label: "heIl",
        sampleError: "לא נמצא חשבון עם כתובת אימייל זו",
        sampleLabel: "כניסה",
        samplePrompt: "אין לך חשבון?",
      },
      {
        exported: hrHr,
        locale: "hr-HR",
        translations: hrHR,
        label: "hrHr",
        sampleError: "Nije pronađen račun s ovom adresom e-pošte",
        sampleLabel: "Prijava",
        samplePrompt: "Nemate račun?",
      },
      {
        exported: huHu,
        locale: "hu-HU",
        translations: huHU,
        label: "huHu",
        sampleError: "Nem található fiók ezzel az e-mail-címmel",
        sampleLabel: "Bejelentkezés",
        samplePrompt: "Nincs fiókja?",
      },
      {
        exported: idId,
        locale: "id-ID",
        translations: idID,
        label: "idId",
        sampleError: "Tidak ada akun yang ditemukan dengan alamat email ini",
        sampleLabel: "Masuk",
        samplePrompt: "Belum punya akun?",
      },
      {
        exported: ltLt,
        locale: "lt-LT",
        translations: ltLT,
        label: "ltLt",
        sampleError: "Nerastas naudotojas su šiuo el. pašto adresu",
        sampleLabel: "Prisijungti",
        samplePrompt: "Neturite paskyros?",
      },
      {
        exported: lvLv,
        locale: "lv-LV",
        translations: lvLV,
        label: "lvLv",
        sampleError: "Konts ar šo e-pasta adresi netika atrasts",
        sampleLabel: "Pieteikties",
        samplePrompt: "Nav konta?",
      },
      {
        exported: nbNo,
        locale: "nb-NO",
        translations: nbNO,
        label: "nbNo",
        sampleError: "Ingen konto funnet med denne e-postadressen",
        sampleLabel: "Logg inn",
        samplePrompt: "Har du ikke en konto?",
      },
      {
        exported: nlNl,
        locale: "nl-NL",
        translations: nlNL,
        label: "nlNl",
        sampleError: "Geen account gevonden met dit e-mailadres",
        sampleLabel: "Inloggen",
        samplePrompt: "Geen account?",
      },
      {
        exported: plPl,
        locale: "pl-PL",
        translations: plPL,
        label: "plPl",
        sampleError: "Nie znaleziono konta z tym adresem e-mail",
        sampleLabel: "Zaloguj się",
        samplePrompt: "Nie masz konta?",
      },
      {
        exported: ptPt,
        locale: "pt-PT",
        translations: ptPT,
        label: "ptPt",
        sampleError: "Não foi encontrada nenhuma conta com este endereço de e-mail",
        sampleLabel: "Iniciar sessão",
        samplePrompt: "Não tem uma conta?",
      },
      {
        exported: roRo,
        locale: "ro-RO",
        translations: roRO,
        label: "roRo",
        sampleError: "Nu a fost găsit niciun cont cu această adresă de e-mail",
        sampleLabel: "Conectare",
        samplePrompt: "Nu aveți un cont?",
      },
      {
        exported: ruRu,
        locale: "ru-RU",
        translations: ruRU,
        label: "ruRu",
        sampleError: "Аккаунт с этим адресом электронной почты не найден",
        sampleLabel: "Войти",
        samplePrompt: "Нет аккаунта?",
      },
      {
        exported: skSk,
        locale: "sk-SK",
        translations: skSK,
        label: "skSk",
        sampleError: "Nenašiel sa žiadny účet s touto e-mailovou adresou",
        sampleLabel: "Prihlásiť sa",
        samplePrompt: "Nemáte účet?",
      },
      {
        exported: slSi,
        locale: "sl-SI",
        translations: slSI,
        label: "slSi",
        sampleError: "Račun s tem e-poštnim naslovom ni bil najden",
        sampleLabel: "Prijava",
        samplePrompt: "Nimate računa?",
      },
      {
        exported: srRs,
        locale: "sr-RS",
        translations: srRS,
        label: "srRs",
        sampleError: "Није пронађен налог са овом адресом е-поште",
        sampleLabel: "Пријава",
        samplePrompt: "Немате налог?",
      },
      {
        exported: svSe,
        locale: "sv-SE",
        translations: svSE,
        label: "svSe",
        sampleError: "Inget konto hittades med denna e-postadress",
        sampleLabel: "Logga in",
        samplePrompt: "Har du inget konto?",
      },
      {
        exported: thTh,
        locale: "th-TH",
        translations: thTH,
        label: "thTh",
        sampleError: "ไม่พบบัญชีที่ใช้อีเมลนี้",
        sampleLabel: "ลงชื่อเข้าใช้",
        samplePrompt: "ไม่มีบัญชี?",
      },
      {
        exported: trTr,
        locale: "tr-TR",
        translations: trTR,
        label: "trTr",
        sampleError: "Bu e-posta adresiyle ilişkili bir hesap bulunamadı",
        sampleLabel: "Oturum Aç",
        samplePrompt: "Hesabınız yok mu?",
      },
      {
        exported: ukUa,
        locale: "uk-UA",
        translations: ukUA,
        label: "ukUa",
        sampleError: "Акаунт із цією електронною адресою не знайдено",
        sampleLabel: "Увійти",
        samplePrompt: "Немає акаунту?",
      },
      {
        exported: viVn,
        locale: "vi-VN",
        translations: viVN,
        label: "viVn",
        sampleError: "Không tìm thấy tài khoản nào với địa chỉ email này",
        sampleLabel: "Đăng nhập",
        samplePrompt: "Chưa có tài khoản?",
      },
      {
        exported: zhTw,
        locale: "zh-TW",
        translations: zhTW,
        label: "zhTw",
        sampleError: "找不到使用此電子郵件地址的帳戶",
        sampleLabel: "登入",
        samplePrompt: "沒有帳戶？",
      },
    ];

    for (const { exported, locale, translations, label, sampleError, sampleLabel, samplePrompt } of localeFixtures) {
      describe(label, () => {
        it("should have correct locale identifier", () => {
          expect(exported.locale).toBe(locale);
        });

        it("should reference the correct translations object", () => {
          expect(exported.translations).toBe(translations);
        });

        it("should have all translation categories defined", () => {
          expect(exported.translations.errors).toBeDefined();
          expect(exported.translations.messages).toBeDefined();
          expect(exported.translations.labels).toBeDefined();
          expect(exported.translations.prompts).toBeDefined();
        });

        it("should return correct translation for userNotFound error", () => {
          expect(getTranslation(exported, "errors", "userNotFound")).toBe(sampleError);
        });

        it("should return correct translation for signIn label", () => {
          expect(getTranslation(exported, "labels", "signIn")).toBe(sampleLabel);
        });

        it("should return correct translation for noAccount prompt", () => {
          expect(getTranslation(exported, "prompts", "noAccount")).toBe(samplePrompt);
        });

        it("should fall back to English for any missing translation", () => {
          // All locales are complete, but verify the fallback mechanism works
          // by creating a partial locale and checking it falls back
          const partial = registerLocale(locale, {
            errors: { userNotFound: exported.translations.errors!.userNotFound },
          });
          expect(getTranslation(partial, "labels", "emailAddress")).toBe("Email Address");
        });

        it("should handle placeholder replacements", () => {
          const result = getTranslation(exported, "messages", "termsAndPrivacy", {
            tos: "TOS",
            privacy: "PP",
          });
          expect(result).not.toContain("{tos}");
          expect(result).not.toContain("{privacy}");
          expect(result).toContain("TOS");
          expect(result).toContain("PP");
        });
      });
    }
  });

  describe("enUs translations", () => {
    it("should have all required translation categories", () => {
      expect(enUs.translations.errors).toBeDefined();
      expect(enUs.translations.messages).toBeDefined();
      expect(enUs.translations.labels).toBeDefined();
      expect(enUs.translations.prompts).toBeDefined();
    });

    it("should have valid error translations", () => {
      const errors = enUs.translations.errors;
      expect(errors?.userNotFound).toBe("No account found with this email address");
      expect(errors?.wrongPassword).toBe("Incorrect password");
      expect(errors?.invalidEmail).toBe("Please enter a valid email address");
      expect(errors?.unknownError).toBe("An unexpected error occurred");
    });

    it("should have valid message translations", () => {
      const messages = enUs.translations.messages;
      expect(messages?.passwordResetEmailSent).toBe("Password reset email sent successfully");
      expect(messages?.signInLinkSent).toBe("Sign-in link sent successfully");
      expect(messages?.dividerOr).toBe("or");
    });

    it("should have valid label translations", () => {
      const labels = enUs.translations.labels;
      expect(labels?.emailAddress).toBe("Email Address");
      expect(labels?.password).toBe("Password");
      expect(labels?.signIn).toBe("Sign In");
      expect(labels?.signUp).toBe("Sign Up");
    });

    it("should have valid prompt translations", () => {
      const prompts = enUs.translations.prompts;
      expect(prompts?.noAccount).toBe("Don't have an account?");
      expect(prompts?.haveAccount).toBe("Already have an account?");
      expect(prompts?.signInToAccount).toBe("Sign in to your account");
    });
  });

  describe("type exports", () => {
    it("should export Locale type", () => {
      const validLocales: Locale[] = ["en-US", "fr-FR", "es-ES", "custom-locale"];

      validLocales.forEach((locale) => {
        expect(typeof locale).toBe("string");
      });
    });

    it("should export RegisteredLocale type", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error",
        },
      };

      const registeredLocale: RegisteredLocale = registerLocale("en-US", mockTranslations);

      expect(registeredLocale.locale).toBe("en-US");
      expect(registeredLocale.translations).toBe(mockTranslations);
    });

    it("should have correct type structure for RegisteredLocale", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error",
        },
        labels: {
          emailAddress: "Test label",
        },
      };

      const registeredLocale: RegisteredLocale = registerLocale("test-locale", mockTranslations);

      expect(registeredLocale).toHaveProperty("locale");
      expect(registeredLocale).toHaveProperty("translations");
      expect(typeof registeredLocale.locale).toBe("string");
      expect(typeof registeredLocale.translations).toBe("object");
    });
  });

  describe("mapping exports", () => {
    it("should re-export mapping functions and types", () => {
      expect(getTranslation).toBeDefined();
      expect(typeof getTranslation).toBe("function");
      expect(ERROR_CODE_MAP).toBeDefined();
      expect(typeof ERROR_CODE_MAP).toBe("object");
    });

    it("should have ERROR_CODE_MAP with correct structure", () => {
      expect(ERROR_CODE_MAP["auth/user-not-found"]).toBe("userNotFound");
      expect(ERROR_CODE_MAP["auth/wrong-password"]).toBe("wrongPassword");
      expect(ERROR_CODE_MAP["auth/invalid-email"]).toBe("invalidEmail");
      expect(ERROR_CODE_MAP["auth/network-request-failed"]).toBe("networkRequestFailed");
    });
  });

  describe("type re-exports", () => {
    it("should re-export all types from types module", () => {
      const testTranslations: types.Translations = {
        errors: {
          userNotFound: "Test error",
        },
      };

      expect(testTranslations.errors?.userNotFound).toBe("Test error");

      // Test that we can use other types (these are compile-time checks)
      const testCategory: types.TranslationCategory = "errors";
      const testKey: types.ErrorKey = "userNotFound";

      expect(testCategory).toBe("errors");
      expect(testKey).toBe("userNotFound");
    });
  });

  describe("integration tests", () => {
    it("should work with custom locale registration and usage", () => {
      const customTranslations: Translations = {
        errors: {
          userNotFound: "Utilisateur non trouvé",
          wrongPassword: "Mot de passe incorrect",
        },
        labels: {
          emailAddress: "Adresse e-mail",
          password: "Mot de passe",
        },
      };

      const customLocale = registerLocale("fr-FR", customTranslations);

      expect(customLocale.locale).toBe("fr-FR");
      expect(customLocale.translations.errors?.userNotFound).toBe("Utilisateur non trouvé");
      expect(customLocale.translations.labels?.emailAddress).toBe("Adresse e-mail");
    });

    it("should maintain type safety across all exports", () => {
      const mockTranslations: Translations = {
        errors: {
          userNotFound: "Test error",
        },
      };

      const registered: RegisteredLocale = registerLocale("en-US", mockTranslations);
      const locale: Locale = registered.locale;

      expect(typeof locale).toBe("string");
      expect(registered.translations).toBe(mockTranslations);
    });
  });
});
