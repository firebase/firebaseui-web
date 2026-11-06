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

import { amET } from "./locales/am-et";
import { ar as arTranslations } from "./locales/ar";
import { azAZ } from "./locales/az-az";
import { bgBG } from "./locales/bg-bg";
import { biVU } from "./locales/bi-vu";
import { bmML } from "./locales/bm-ml";
import { bnBD } from "./locales/bn-bd";
import { bsBA } from "./locales/bs-ba";
import { caES } from "./locales/ca-es";
import { csCZ } from "./locales/cs-cz";
import { daDK } from "./locales/da-dk";
import { deDE } from "./locales/de-de";
import { dvMV } from "./locales/dv-mv";
import { dzBT } from "./locales/dz-bt";
import { elGR } from "./locales/el-gr";
import { enGB } from "./locales/en-gb";
import { enUS } from "./locales/en-us";
import { es419 } from "./locales/es-419";
import { esES } from "./locales/es-es";
import { etEE } from "./locales/et-ee";
import { faIR } from "./locales/fa-ir";
import { ffGN } from "./locales/ff-gn";
import { fiFI } from "./locales/fi-fi";
import { filPH } from "./locales/fil-ph";
import { frFR } from "./locales/fr-fr";
import { haNE } from "./locales/ha-ne";
import { heIL } from "./locales/he-il";
import { hiIN } from "./locales/hi-in";
import { hrHR } from "./locales/hr-hr";
import { htHT } from "./locales/ht-ht";
import { huHU } from "./locales/hu-hu";
import { hyAM } from "./locales/hy-am";
import { idID } from "./locales/id-id";
import { isIS } from "./locales/is-is";
import { itIT } from "./locales/it-it";
import { jaJP } from "./locales/ja-jp";
import { kaGE } from "./locales/ka-ge";
import { kmKH } from "./locales/km-kh";
import { koKR } from "./locales/ko-kr";
import { kyKG } from "./locales/ky-kg";
import { loLA } from "./locales/lo-la";
import { ltLT } from "./locales/lt-lt";
import { lvLV } from "./locales/lv-lv";
import { mgMG } from "./locales/mg-mg";
import { mhMH } from "./locales/mh-mh";
import { mkMK } from "./locales/mk-mk";
import { mnMN } from "./locales/mn-mn";
import { msMY } from "./locales/ms-my";
import { mtMT } from "./locales/mt-mt";
import { myMM } from "./locales/my-mm";
import { naNR } from "./locales/na-nr";
import { nbNO } from "./locales/nb-no";
import { neNP } from "./locales/ne-np";
import { ngNA } from "./locales/ng-na";
import { nlNL } from "./locales/nl-nl";
import { nyMW } from "./locales/ny-mw";
import { plPL } from "./locales/pl-pl";
import { ptBR } from "./locales/pt-br";
import { ptPT } from "./locales/pt-pt";
import { rnBI } from "./locales/rn-bi";
import { roRO } from "./locales/ro-ro";
import { ruRU } from "./locales/ru-ru";
import { rwRW } from "./locales/rw-rw";
import { sgCF } from "./locales/sg-cf";
import { siLK } from "./locales/si-lk";
import { skSK } from "./locales/sk-sk";
import { slSI } from "./locales/sl-si";
import { smWS } from "./locales/sm-ws";
import { snZW } from "./locales/sn-zw";
import { soSO } from "./locales/so-so";
import { sqAL } from "./locales/sq-al";
import { srRS } from "./locales/sr-rs";
import { ssSZ } from "./locales/ss-sz";
import { stLS } from "./locales/st-ls";
import { svSE } from "./locales/sv-se";
import { swTZ } from "./locales/sw-tz";
import { tgTJ } from "./locales/tg-tj";
import { thTH } from "./locales/th-th";
import { tiER } from "./locales/ti-er";
import { tkTM } from "./locales/tk-tm";
import { tnBW } from "./locales/tn-bw";
import { toTO } from "./locales/to-to";
import { trTR } from "./locales/tr-tr";
import { ukUA } from "./locales/uk-ua";
import { urPK } from "./locales/ur-pk";
import { uzUZ } from "./locales/uz-uz";
import { viVN } from "./locales/vi-vn";
import { woSN } from "./locales/wo-sn";
import { zhCN } from "./locales/zh-cn";
import { zhTW } from "./locales/zh-tw";
import { zuZA } from "./locales/zu-za";
import { type Translations } from "./types";

export type * from "./types";
export * from "./mapping";

/** Locale identifier string. Supports BCP 47 format (e.g., "en-US") or any string. */
export type Locale = "en-US" | `${string}-${string}` | string;

/**
 * Registers a locale with its translations and optional fallback locale.
 *
 * @param locale - The locale identifier (e.g., "en-US", "fr-FR").
 * @param translations - The translation object for this locale.
 * @param fallback - Optional fallback locale to use when a translation is missing.
 * @returns A registered locale object.
 */
export function registerLocale(
  locale: Locale,
  translations: Translations,
  fallback?: RegisteredLocale
): RegisteredLocale {
  return {
    locale,
    translations,
    fallback,
  };
}

export const amEt = registerLocale("am-ET", amET);

/** Pre-registered Arabic locale. */
export const ar = registerLocale("ar", arTranslations);

export const azAz = registerLocale("az-AZ", azAZ);

/** Pre-registered Bulgarian BG locale. */
export const bgBg = registerLocale("bg-BG", bgBG);

export const biVu = registerLocale("bi-VU", biVU);

export const bmMl = registerLocale("bm-ML", bmML);

export const bnBd = registerLocale("bn-BD", bnBD);

export const bsBa = registerLocale("bs-BA", bsBA);

/** Pre-registered Catalan ES locale. */
export const caEs = registerLocale("ca-ES", caES);

/** Pre-registered Czech CZ locale. */
export const csCz = registerLocale("cs-CZ", csCZ);

/** Pre-registered Danish DK locale. */
export const daDk = registerLocale("da-DK", daDK);

/** Pre-registered German DE locale. */
export const deDe = registerLocale("de-DE", deDE);

export const dvMv = registerLocale("dv-MV", dvMV);

export const dzBt = registerLocale("dz-BT", dzBT);

/** Pre-registered Greek GR locale. */
export const elGr = registerLocale("el-GR", elGR);

/** Pre-registered English GB locale. */
export const enGb = registerLocale("en-GB", enGB);

/** Pre-registered English US locale with default translations. */
export const enUs = registerLocale("en-US", enUS);

/** Pre-registered Spanish Latin America locale. */
export const esLa = registerLocale("es-419", es419);

/** Pre-registered Spanish ES locale. */
export const esEs = registerLocale("es-ES", esES);

export const etEe = registerLocale("et-EE", etEE);

/** Pre-registered Persian IR locale. */
export const faIr = registerLocale("fa-IR", faIR);

export const ffGn = registerLocale("ff-GN", ffGN);

/** Pre-registered Finnish FI locale. */
export const fiFi = registerLocale("fi-FI", fiFI);

/** Pre-registered Filipino PH locale. */
export const filPh = registerLocale("fil-PH", filPH);

/** Pre-registered French FR locale. */
export const frFr = registerLocale("fr-FR", frFR);

export const haNe = registerLocale("ha-NE", haNE);

/** Pre-registered Hebrew IL locale. */
export const heIl = registerLocale("he-IL", heIL);

/** Pre-registered Hindi IN locale. */
export const hiIn = registerLocale("hi-IN", hiIN);

/** Pre-registered Croatian HR locale. */
export const hrHr = registerLocale("hr-HR", hrHR);

export const htHt = registerLocale("ht-HT", htHT);

/** Pre-registered Hungarian HU locale. */
export const huHu = registerLocale("hu-HU", huHU);

export const hyAm = registerLocale("hy-AM", hyAM);

/** Pre-registered Indonesian ID locale. */
export const idId = registerLocale("id-ID", idID);

export const isIs = registerLocale("is-IS", isIS);

/** Pre-registered Italian IT locale. */
export const itIt = registerLocale("it-IT", itIT);

/** Pre-registered Japanese JP locale. */
export const jaJp = registerLocale("ja-JP", jaJP);

export const kaGe = registerLocale("ka-GE", kaGE);

export const kmKh = registerLocale("km-KH", kmKH);

/** Pre-registered Korean KR locale. */
export const koKr = registerLocale("ko-KR", koKR);

export const kyKg = registerLocale("ky-KG", kyKG);

export const loLa = registerLocale("lo-LA", loLA);

/** Pre-registered Lithuanian LT locale. */
export const ltLt = registerLocale("lt-LT", ltLT);

/** Pre-registered Latvian LV locale. */
export const lvLv = registerLocale("lv-LV", lvLV);

export const mgMg = registerLocale("mg-MG", mgMG);

export const mhMh = registerLocale("mh-MH", mhMH);

export const mkMk = registerLocale("mk-MK", mkMK);

export const mnMn = registerLocale("mn-MN", mnMN);

export const msMy = registerLocale("ms-MY", msMY);

export const mtMt = registerLocale("mt-MT", mtMT);

export const myMm = registerLocale("my-MM", myMM);

export const naNr = registerLocale("na-NR", naNR);

/** Pre-registered Norwegian Bokmål NO locale. */
export const nbNo = registerLocale("nb-NO", nbNO);

export const neNp = registerLocale("ne-NP", neNP);

export const ngNa = registerLocale("ng-NA", ngNA);

/** Pre-registered Dutch NL locale. */
export const nlNl = registerLocale("nl-NL", nlNL);

export const nyMw = registerLocale("ny-MW", nyMW);

/** Pre-registered Polish PL locale. */
export const plPl = registerLocale("pl-PL", plPL);

/** Pre-registered Portuguese BR locale. */
export const ptBr = registerLocale("pt-BR", ptBR);

/** Pre-registered Portuguese PT locale. */
export const ptPt = registerLocale("pt-PT", ptPT);

export const rnBi = registerLocale("rn-BI", rnBI);

/** Pre-registered Romanian RO locale. */
export const roRo = registerLocale("ro-RO", roRO);

/** Pre-registered Russian RU locale. */
export const ruRu = registerLocale("ru-RU", ruRU);

export const rwRw = registerLocale("rw-RW", rwRW);

export const sgCf = registerLocale("sg-CF", sgCF);

export const siLk = registerLocale("si-LK", siLK);

/** Pre-registered Slovak SK locale. */
export const skSk = registerLocale("sk-SK", skSK);

/** Pre-registered Slovenian SI locale. */
export const slSi = registerLocale("sl-SI", slSI);

export const smWs = registerLocale("sm-WS", smWS);

export const snZw = registerLocale("sn-ZW", snZW);

export const soSo = registerLocale("so-SO", soSO);

export const sqAl = registerLocale("sq-AL", sqAL);

/** Pre-registered Serbian RS locale. */
export const srRs = registerLocale("sr-RS", srRS);

export const ssSz = registerLocale("ss-SZ", ssSZ);

export const stLs = registerLocale("st-LS", stLS);

/** Pre-registered Swedish SE locale. */
export const svSe = registerLocale("sv-SE", svSE);

export const swTz = registerLocale("sw-TZ", swTZ);

export const tgTj = registerLocale("tg-TJ", tgTJ);

/** Pre-registered Thai TH locale. */
export const thTh = registerLocale("th-TH", thTH);

export const tiEr = registerLocale("ti-ER", tiER);

export const tkTm = registerLocale("tk-TM", tkTM);

export const tnBw = registerLocale("tn-BW", tnBW);

export const toTo = registerLocale("to-TO", toTO);

/** Pre-registered Turkish TR locale. */
export const trTr = registerLocale("tr-TR", trTR);

/** Pre-registered Ukrainian UA locale. */
export const ukUa = registerLocale("uk-UA", ukUA);

export const urPk = registerLocale("ur-PK", urPK);

export const uzUz = registerLocale("uz-UZ", uzUZ);

/** Pre-registered Vietnamese VN locale. */
export const viVn = registerLocale("vi-VN", viVN);

export const woSn = registerLocale("wo-SN", woSN);

/** Pre-registered Chinese Simplified CN locale. */
export const zhCn = registerLocale("zh-CN", zhCN);

/** Pre-registered Chinese Traditional TW locale. */
export const zhTw = registerLocale("zh-TW", zhTW);

export const zuZa = registerLocale("zu-ZA", zuZA);

/** A registered locale with its translations and optional fallback. */
export type RegisteredLocale = {
  /** The locale identifier. */
  locale: Locale;
  /** The translation object for this locale. */
  translations: Translations;
  /** Optional fallback locale to use when a translation is missing. */
  fallback?: RegisteredLocale;
};
