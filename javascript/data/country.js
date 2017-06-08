/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Data about countries.
 */

goog.provide('firebaseui.auth.data.country');
goog.provide('firebaseui.auth.data.country.COUNTRY_LIST');
goog.provide('firebaseui.auth.data.country.Country');
goog.provide('firebaseui.auth.data.country.LOOKUP_TREE');
goog.provide('firebaseui.auth.data.country.LookupTree');

goog.require('goog.structs.Trie');


/**
 * Defines a prefix tree for storing all the country codes to facilate phone
 * number country code lookup.
 * @param {!Array<!firebaseui.auth.data.country.Country>} countries The list of
 *     countries to construct a prefix tree for.
 * @constructor
 */
firebaseui.auth.data.country.LookupTree = function(countries) {
  /**
   * @private {!Array<!firebaseui.auth.data.country.Country>} The list of
   *     countries to construct a prefix tree for.
   */
  this.countries_ = countries;
  /**
   * @private {
   * !goog.structs.Trie<!Array<!firebaseui.auth.data.country.Country>>} The
   *     prefix tree.
   */
  this.trie_ = new goog.structs.Trie();
  // Initialize prefix tree like structure.
  this.init_();
};



/**
 * Populates the prefix tree structure.
 * @private
 */
firebaseui.auth.data.country.LookupTree.prototype.init_ = function() {
  // Populate the prefix tree.
  for (var i = 0; i < this.countries_.length; i++) {
    // Construct key.
    var key = '+' + this.countries_[i].e164_cc;
    // Check if key exists.
    var nodeValue = this.trie_.get(key);
    if (nodeValue) {
      // If so, add country object to its array.
      nodeValue.push(this.countries_[i]);
    } else {
      // Else add that key/value.
      this.trie_.add('+' + this.countries_[i].e164_cc, [this.countries_[i]]);
    }
  }
};


/**
 * Looks up the country that matches the code's prefix.
 * @param {string} code The string that could contain a country code prefix.
 * @return {!Array<!firebaseui.auth.data.country.Country>} The country objects
 *     that match the prefix of the code provided, empty array if not found.
 */
firebaseui.auth.data.country.LookupTree.prototype.search = function(code) {
  // Get all keys and prefixes.
  var keyAndPrefixes = this.trie_.getKeyAndPrefixes(code);
  // Get matching key and prefixes.
  for (var key in keyAndPrefixes) {
    if (keyAndPrefixes.hasOwnProperty(key)) {
      // Pick first one. There should always be one as country codes can't be
      // prefixes of each other.
      return keyAndPrefixes[key];
    }
  }
  return [];
};


/**
 * Fetches data about a country given its e164_key field.
 * @param {string} key The e164_key of the country.
 * @return {?firebaseui.auth.data.country.Country}
 */
firebaseui.auth.data.country.getCountryByKey = function(key) {
  for (var i = 0; i < firebaseui.auth.data.country.COUNTRY_LIST.length; i++) {
    if (firebaseui.auth.data.country.COUNTRY_LIST[i].e164_key === key) {
      return firebaseui.auth.data.country.COUNTRY_LIST[i];
    }
  }
  return null;
};


/**
 * Fetches data about a country given its ISO 3166-1 alpha-2 country code
 * (iso2_cc) field. May return multiple entries for countries with multiple
 * country codes, or an empty array if the country code was not found.
 * @param {string} code The case-insensitive iso2_cc of the country.
 * @return {!Array<firebaseui.auth.data.country.Country>}
 */
firebaseui.auth.data.country.getCountriesByIso2 = function(code) {
  var normalizedCode = code.toUpperCase();
  var countries = [];
  for (var i = 0; i < firebaseui.auth.data.country.COUNTRY_LIST.length; i++) {
    if (firebaseui.auth.data.country.COUNTRY_LIST[i].iso2_cc ===
        normalizedCode) {
      countries.push(firebaseui.auth.data.country.COUNTRY_LIST[i]);
    }
  }
  return countries;
};



/**
 * Sorts the list of countries by name for the given locale.
 *
 * This method is called on the generated list at the bottom of this file.
 *
 * @param {!Array<!firebaseui.auth.data.country.Country>} list The list of
 *     country data.
 * @param {string} locale
 */
firebaseui.auth.data.country.sortCountryListForLocale = function(list, locale) {
  list.sort(function(countryA, countryB) {
    return countryA.name.localeCompare(countryB.name, locale);
  });
};


/**
 * @typedef {{
 *   name: string,
 *   iso2_cc: string,
 *   e164_key: string,
 *   e164_cc: string
 * }}
 */
firebaseui.auth.data.country.Country;


/*----------------------START COPIED CODE-------------------------------------*/

/** @desc The name of the country/territory "Afghanistan". */
var MSG_93_AF_0 = goog.getMsg('Afghanistan');
/** @desc The name of the country/territory "Åland Islands". */
var MSG_358_AX_0 = goog.getMsg('Åland Islands');
/** @desc The name of the country/territory "Albania". */
var MSG_355_AL_0 = goog.getMsg('Albania');
/** @desc The name of the country/territory "Algeria". */
var MSG_213_DZ_0 = goog.getMsg('Algeria');
/** @desc The name of the country/territory "American Samoa". */
var MSG_1_AS_0 = goog.getMsg('American Samoa');
/** @desc The name of the country/territory "Andorra". */
var MSG_376_AD_0 = goog.getMsg('Andorra');
/** @desc The name of the country/territory "Angola". */
var MSG_244_AO_0 = goog.getMsg('Angola');
/** @desc The name of the country/territory "Anguilla". */
var MSG_1_AI_0 = goog.getMsg('Anguilla');
/** @desc The name of the country/territory "Antigua and Barbuda". */
var MSG_1_AG_0 = goog.getMsg('Antigua and Barbuda');
/** @desc The name of the country/territory "Argentina". */
var MSG_54_AR_0 = goog.getMsg('Argentina');
/** @desc The name of the country/territory "Armenia". */
var MSG_374_AM_0 = goog.getMsg('Armenia');
/** @desc The name of the country/territory "Aruba". */
var MSG_297_AW_0 = goog.getMsg('Aruba');
/** @desc The name of the country/territory "Ascension Island". */
var MSG_247_AC_0 = goog.getMsg('Ascension Island');
/** @desc The name of the country/territory "Australia". */
var MSG_61_AU_0 = goog.getMsg('Australia');
/** @desc The name of the country/territory "Austria". */
var MSG_43_AT_0 = goog.getMsg('Austria');
/** @desc The name of the country/territory "Azerbaijan". */
var MSG_994_AZ_0 = goog.getMsg('Azerbaijan');
/** @desc The name of the country/territory "Bahamas". */
var MSG_1_BS_0 = goog.getMsg('Bahamas');
/** @desc The name of the country/territory "Bahrain". */
var MSG_973_BH_0 = goog.getMsg('Bahrain');
/** @desc The name of the country/territory "Bangladesh". */
var MSG_880_BD_0 = goog.getMsg('Bangladesh');
/** @desc The name of the country/territory "Barbados". */
var MSG_1_BB_0 = goog.getMsg('Barbados');
/** @desc The name of the country/territory "Belarus". */
var MSG_375_BY_0 = goog.getMsg('Belarus');
/** @desc The name of the country/territory "Belgium". */
var MSG_32_BE_0 = goog.getMsg('Belgium');
/** @desc The name of the country/territory "Belize". */
var MSG_501_BZ_0 = goog.getMsg('Belize');
/** @desc The name of the country/territory "Benin". */
var MSG_229_BJ_0 = goog.getMsg('Benin');
/** @desc The name of the country/territory "Bermuda". */
var MSG_1_BM_0 = goog.getMsg('Bermuda');
/** @desc The name of the country/territory "Bhutan". */
var MSG_975_BT_0 = goog.getMsg('Bhutan');
/** @desc The name of the country/territory "Bolivia". */
var MSG_591_BO_0 = goog.getMsg('Bolivia');
/** @desc The name of the country/territory "Bosnia and Herzegovina". */
var MSG_387_BA_0 = goog.getMsg('Bosnia and Herzegovina');
/** @desc The name of the country/territory "Botswana". */
var MSG_267_BW_0 = goog.getMsg('Botswana');
/** @desc The name of the country/territory "Brazil". */
var MSG_55_BR_0 = goog.getMsg('Brazil');
/** @desc The name of the country/territory "British Indian Ocean Territory". */
var MSG_246_IO_0 = goog.getMsg('British Indian Ocean Territory');
/** @desc The name of the country/territory "British Virgin Islands". */
var MSG_1_VG_0 = goog.getMsg('British Virgin Islands');
/** @desc The name of the country/territory "Brunei". */
var MSG_673_BN_0 = goog.getMsg('Brunei');
/** @desc The name of the country/territory "Bulgaria". */
var MSG_359_BG_0 = goog.getMsg('Bulgaria');
/** @desc The name of the country/territory "Burkina Faso". */
var MSG_226_BF_0 = goog.getMsg('Burkina Faso');
/** @desc The name of the country/territory "Burundi". */
var MSG_257_BI_0 = goog.getMsg('Burundi');
/** @desc The name of the country/territory "Cambodia". */
var MSG_855_KH_0 = goog.getMsg('Cambodia');
/** @desc The name of the country/territory "Cameroon". */
var MSG_237_CM_0 = goog.getMsg('Cameroon');
/** @desc The name of the country/territory "Canada". */
var MSG_1_CA_0 = goog.getMsg('Canada');
/** @desc The name of the country/territory "Cape Verde". */
var MSG_238_CV_0 = goog.getMsg('Cape Verde');
/** @desc The name of the country/territory "Caribbean Netherlands". */
var MSG_599_BQ_0 = goog.getMsg('Caribbean Netherlands');
/** @desc The name of the country/territory "Cayman Islands". */
var MSG_1_KY_0 = goog.getMsg('Cayman Islands');
/** @desc The name of the country/territory "Central African Republic". */
var MSG_236_CF_0 = goog.getMsg('Central African Republic');
/** @desc The name of the country/territory "Chad". */
var MSG_235_TD_0 = goog.getMsg('Chad');
/** @desc The name of the country/territory "Chile". */
var MSG_56_CL_0 = goog.getMsg('Chile');
/** @desc The name of the country/territory "China". */
var MSG_86_CN_0 = goog.getMsg('China');
/** @desc The name of the country/territory "Christmas Island". */
var MSG_61_CX_0 = goog.getMsg('Christmas Island');
/** @desc The name of the country/territory "Cocos [Keeling] Islands". */
var MSG_61_CC_0 = goog.getMsg('Cocos [Keeling] Islands');
/** @desc The name of the country/territory "Colombia". */
var MSG_57_CO_0 = goog.getMsg('Colombia');
/** @desc The name of the country/territory "Comoros". */
var MSG_269_KM_0 = goog.getMsg('Comoros');
/** @desc The name of the country/territory "Democratic Republic Congo". */
var MSG_243_CD_0 = goog.getMsg('Democratic Republic Congo');
/** @desc The name of the country/territory "Republic of Congo". */
var MSG_242_CG_0 = goog.getMsg('Republic of Congo');
/** @desc The name of the country/territory "Cook Islands". */
var MSG_682_CK_0 = goog.getMsg('Cook Islands');
/** @desc The name of the country/territory "Costa Rica". */
var MSG_506_CR_0 = goog.getMsg('Costa Rica');
/** @desc The name of the country/territory "Côte d\'Ivoire". */
var MSG_225_CI_0 = goog.getMsg('Côte d\'Ivoire');
/** @desc The name of the country/territory "Croatia". */
var MSG_385_HR_0 = goog.getMsg('Croatia');
/** @desc The name of the country/territory "Cuba". */
var MSG_53_CU_0 = goog.getMsg('Cuba');
/** @desc The name of the country/territory "Curaçao". */
var MSG_599_CW_0 = goog.getMsg('Curaçao');
/** @desc The name of the country/territory "Cyprus". */
var MSG_357_CY_0 = goog.getMsg('Cyprus');
/** @desc The name of the country/territory "Czech Republic". */
var MSG_420_CZ_0 = goog.getMsg('Czech Republic');
/** @desc The name of the country/territory "Denmark". */
var MSG_45_DK_0 = goog.getMsg('Denmark');
/** @desc The name of the country/territory "Djibouti". */
var MSG_253_DJ_0 = goog.getMsg('Djibouti');
/** @desc The name of the country/territory "Dominica". */
var MSG_1_DM_0 = goog.getMsg('Dominica');
/** @desc The name of the country/territory "Dominican Republic". */
var MSG_1_DO_0 = goog.getMsg('Dominican Republic');
/** @desc The name of the country/territory "East Timor". */
var MSG_670_TL_0 = goog.getMsg('East Timor');
/** @desc The name of the country/territory "Ecuador". */
var MSG_593_EC_0 = goog.getMsg('Ecuador');
/** @desc The name of the country/territory "Egypt". */
var MSG_20_EG_0 = goog.getMsg('Egypt');
/** @desc The name of the country/territory "El Salvador". */
var MSG_503_SV_0 = goog.getMsg('El Salvador');
/** @desc The name of the country/territory "Equatorial Guinea". */
var MSG_240_GQ_0 = goog.getMsg('Equatorial Guinea');
/** @desc The name of the country/territory "Eritrea". */
var MSG_291_ER_0 = goog.getMsg('Eritrea');
/** @desc The name of the country/territory "Estonia". */
var MSG_372_EE_0 = goog.getMsg('Estonia');
/** @desc The name of the country/territory "Ethiopia". */
var MSG_251_ET_0 = goog.getMsg('Ethiopia');
/** @desc The name of the country/territory "Falkland Islands [Islas Malvinas]". */
var MSG_500_FK_0 = goog.getMsg('Falkland Islands [Islas Malvinas]');
/** @desc The name of the country/territory "Faroe Islands". */
var MSG_298_FO_0 = goog.getMsg('Faroe Islands');
/** @desc The name of the country/territory "Fiji". */
var MSG_679_FJ_0 = goog.getMsg('Fiji');
/** @desc The name of the country/territory "Finland". */
var MSG_358_FI_0 = goog.getMsg('Finland');
/** @desc The name of the country/territory "France". */
var MSG_33_FR_0 = goog.getMsg('France');
/** @desc The name of the country/territory "French Guiana". */
var MSG_594_GF_0 = goog.getMsg('French Guiana');
/** @desc The name of the country/territory "French Polynesia". */
var MSG_689_PF_0 = goog.getMsg('French Polynesia');
/** @desc The name of the country/territory "Gabon". */
var MSG_241_GA_0 = goog.getMsg('Gabon');
/** @desc The name of the country/territory "Gambia". */
var MSG_220_GM_0 = goog.getMsg('Gambia');
/** @desc The name of the country/territory "Georgia". */
var MSG_995_GE_0 = goog.getMsg('Georgia');
/** @desc The name of the country/territory "Germany". */
var MSG_49_DE_0 = goog.getMsg('Germany');
/** @desc The name of the country/territory "Ghana". */
var MSG_233_GH_0 = goog.getMsg('Ghana');
/** @desc The name of the country/territory "Gibraltar". */
var MSG_350_GI_0 = goog.getMsg('Gibraltar');
/** @desc The name of the country/territory "Greece". */
var MSG_30_GR_0 = goog.getMsg('Greece');
/** @desc The name of the country/territory "Greenland". */
var MSG_299_GL_0 = goog.getMsg('Greenland');
/** @desc The name of the country/territory "Grenada". */
var MSG_1_GD_0 = goog.getMsg('Grenada');
/** @desc The name of the country/territory "Guadeloupe". */
var MSG_590_GP_0 = goog.getMsg('Guadeloupe');
/** @desc The name of the country/territory "Guam". */
var MSG_1_GU_0 = goog.getMsg('Guam');
/** @desc The name of the country/territory "Guatemala". */
var MSG_502_GT_0 = goog.getMsg('Guatemala');
/** @desc The name of the country/territory "Guernsey". */
var MSG_44_GG_0 = goog.getMsg('Guernsey');
/** @desc The name of the country/territory "Guinea Conakry". */
var MSG_224_GN_0 = goog.getMsg('Guinea Conakry');
/** @desc The name of the country/territory "Guinea-Bissau". */
var MSG_245_GW_0 = goog.getMsg('Guinea-Bissau');
/** @desc The name of the country/territory "Guyana". */
var MSG_592_GY_0 = goog.getMsg('Guyana');
/** @desc The name of the country/territory "Haiti". */
var MSG_509_HT_0 = goog.getMsg('Haiti');
/** @desc The name of the country/territory "Heard Island and McDonald Islands". */
var MSG_672_HM_0 = goog.getMsg('Heard Island and McDonald Islands');
/** @desc The name of the country/territory "Honduras". */
var MSG_504_HN_0 = goog.getMsg('Honduras');
/** @desc The name of the country/territory "Hong Kong". */
var MSG_852_HK_0 = goog.getMsg('Hong Kong');
/** @desc The name of the country/territory "Hungary". */
var MSG_36_HU_0 = goog.getMsg('Hungary');
/** @desc The name of the country/territory "Iceland". */
var MSG_354_IS_0 = goog.getMsg('Iceland');
/** @desc The name of the country/territory "India". */
var MSG_91_IN_0 = goog.getMsg('India');
/** @desc The name of the country/territory "Indonesia". */
var MSG_62_ID_0 = goog.getMsg('Indonesia');
/** @desc The name of the country/territory "Iran". */
var MSG_98_IR_0 = goog.getMsg('Iran');
/** @desc The name of the country/territory "Iraq". */
var MSG_964_IQ_0 = goog.getMsg('Iraq');
/** @desc The name of the country/territory "Ireland". */
var MSG_353_IE_0 = goog.getMsg('Ireland');
/** @desc The name of the country/territory "Isle of Man". */
var MSG_44_IM_0 = goog.getMsg('Isle of Man');
/** @desc The name of the country/territory "Israel". */
var MSG_972_IL_0 = goog.getMsg('Israel');
/** @desc The name of the country/territory "Italy". */
var MSG_39_IT_0 = goog.getMsg('Italy');
/** @desc The name of the country/territory "Jamaica". */
var MSG_1_JM_0 = goog.getMsg('Jamaica');
/** @desc The name of the country/territory "Japan". */
var MSG_81_JP_0 = goog.getMsg('Japan');
/** @desc The name of the country/territory "Jersey". */
var MSG_44_JE_0 = goog.getMsg('Jersey');
/** @desc The name of the country/territory "Jordan". */
var MSG_962_JO_0 = goog.getMsg('Jordan');
/** @desc The name of the country/territory "Kazakhstan". */
var MSG_7_KZ_0 = goog.getMsg('Kazakhstan');
/** @desc The name of the country/territory "Kenya". */
var MSG_254_KE_0 = goog.getMsg('Kenya');
/** @desc The name of the country/territory "Kiribati". */
var MSG_686_KI_0 = goog.getMsg('Kiribati');
/** @desc The name of the country/territory "Kosovo". */
var MSG_377_XK_0 = goog.getMsg('Kosovo');
/** @desc The name of the country/territory "Kosovo". */
var MSG_381_XK_0 = goog.getMsg('Kosovo');
/** @desc The name of the country/territory "Kosovo". */
var MSG_386_XK_0 = goog.getMsg('Kosovo');
/** @desc The name of the country/territory "Kuwait". */
var MSG_965_KW_0 = goog.getMsg('Kuwait');
/** @desc The name of the country/territory "Kyrgyzstan". */
var MSG_996_KG_0 = goog.getMsg('Kyrgyzstan');
/** @desc The name of the country/territory "Laos". */
var MSG_856_LA_0 = goog.getMsg('Laos');
/** @desc The name of the country/territory "Latvia". */
var MSG_371_LV_0 = goog.getMsg('Latvia');
/** @desc The name of the country/territory "Lebanon". */
var MSG_961_LB_0 = goog.getMsg('Lebanon');
/** @desc The name of the country/territory "Lesotho". */
var MSG_266_LS_0 = goog.getMsg('Lesotho');
/** @desc The name of the country/territory "Liberia". */
var MSG_231_LR_0 = goog.getMsg('Liberia');
/** @desc The name of the country/territory "Libya". */
var MSG_218_LY_0 = goog.getMsg('Libya');
/** @desc The name of the country/territory "Liechtenstein". */
var MSG_423_LI_0 = goog.getMsg('Liechtenstein');
/** @desc The name of the country/territory "Lithuania". */
var MSG_370_LT_0 = goog.getMsg('Lithuania');
/** @desc The name of the country/territory "Luxembourg". */
var MSG_352_LU_0 = goog.getMsg('Luxembourg');
/** @desc The name of the country/territory "Macau". */
var MSG_853_MO_0 = goog.getMsg('Macau');
/** @desc The name of the country/territory "Macedonia". */
var MSG_389_MK_0 = goog.getMsg('Macedonia');
/** @desc The name of the country/territory "Madagascar". */
var MSG_261_MG_0 = goog.getMsg('Madagascar');
/** @desc The name of the country/territory "Malawi". */
var MSG_265_MW_0 = goog.getMsg('Malawi');
/** @desc The name of the country/territory "Malaysia". */
var MSG_60_MY_0 = goog.getMsg('Malaysia');
/** @desc The name of the country/territory "Maldives". */
var MSG_960_MV_0 = goog.getMsg('Maldives');
/** @desc The name of the country/territory "Mali". */
var MSG_223_ML_0 = goog.getMsg('Mali');
/** @desc The name of the country/territory "Malta". */
var MSG_356_MT_0 = goog.getMsg('Malta');
/** @desc The name of the country/territory "Marshall Islands". */
var MSG_692_MH_0 = goog.getMsg('Marshall Islands');
/** @desc The name of the country/territory "Martinique". */
var MSG_596_MQ_0 = goog.getMsg('Martinique');
/** @desc The name of the country/territory "Mauritania". */
var MSG_222_MR_0 = goog.getMsg('Mauritania');
/** @desc The name of the country/territory "Mauritius". */
var MSG_230_MU_0 = goog.getMsg('Mauritius');
/** @desc The name of the country/territory "Mayotte". */
var MSG_262_YT_0 = goog.getMsg('Mayotte');
/** @desc The name of the country/territory "Mexico". */
var MSG_52_MX_0 = goog.getMsg('Mexico');
/** @desc The name of the country/territory "Micronesia". */
var MSG_691_FM_0 = goog.getMsg('Micronesia');
/** @desc The name of the country/territory "Moldova". */
var MSG_373_MD_0 = goog.getMsg('Moldova');
/** @desc The name of the country/territory "Monaco". */
var MSG_377_MC_0 = goog.getMsg('Monaco');
/** @desc The name of the country/territory "Mongolia". */
var MSG_976_MN_0 = goog.getMsg('Mongolia');
/** @desc The name of the country/territory "Montenegro". */
var MSG_382_ME_0 = goog.getMsg('Montenegro');
/** @desc The name of the country/territory "Montserrat". */
var MSG_1_MS_0 = goog.getMsg('Montserrat');
/** @desc The name of the country/territory "Morocco". */
var MSG_212_MA_0 = goog.getMsg('Morocco');
/** @desc The name of the country/territory "Mozambique". */
var MSG_258_MZ_0 = goog.getMsg('Mozambique');
/** @desc The name of the country/territory "Myanmar [Burma]". */
var MSG_95_MM_0 = goog.getMsg('Myanmar [Burma]');
/** @desc The name of the country/territory "Namibia". */
var MSG_264_NA_0 = goog.getMsg('Namibia');
/** @desc The name of the country/territory "Nauru". */
var MSG_674_NR_0 = goog.getMsg('Nauru');
/** @desc The name of the country/territory "Nepal". */
var MSG_977_NP_0 = goog.getMsg('Nepal');
/** @desc The name of the country/territory "Netherlands". */
var MSG_31_NL_0 = goog.getMsg('Netherlands');
/** @desc The name of the country/territory "New Caledonia". */
var MSG_687_NC_0 = goog.getMsg('New Caledonia');
/** @desc The name of the country/territory "New Zealand". */
var MSG_64_NZ_0 = goog.getMsg('New Zealand');
/** @desc The name of the country/territory "Nicaragua". */
var MSG_505_NI_0 = goog.getMsg('Nicaragua');
/** @desc The name of the country/territory "Niger". */
var MSG_227_NE_0 = goog.getMsg('Niger');
/** @desc The name of the country/territory "Nigeria". */
var MSG_234_NG_0 = goog.getMsg('Nigeria');
/** @desc The name of the country/territory "Niue". */
var MSG_683_NU_0 = goog.getMsg('Niue');
/** @desc The name of the country/territory "Norfolk Island". */
var MSG_672_NF_0 = goog.getMsg('Norfolk Island');
/** @desc The name of the country/territory "North Korea". */
var MSG_850_KP_0 = goog.getMsg('North Korea');
/** @desc The name of the country/territory "Northern Mariana Islands". */
var MSG_1_MP_0 = goog.getMsg('Northern Mariana Islands');
/** @desc The name of the country/territory "Norway". */
var MSG_47_NO_0 = goog.getMsg('Norway');
/** @desc The name of the country/territory "Oman". */
var MSG_968_OM_0 = goog.getMsg('Oman');
/** @desc The name of the country/territory "Pakistan". */
var MSG_92_PK_0 = goog.getMsg('Pakistan');
/** @desc The name of the country/territory "Palau". */
var MSG_680_PW_0 = goog.getMsg('Palau');
/** @desc The name of the country/territory "Palestinian Territories". */
var MSG_970_PS_0 = goog.getMsg('Palestinian Territories');
/** @desc The name of the country/territory "Panama". */
var MSG_507_PA_0 = goog.getMsg('Panama');
/** @desc The name of the country/territory "Papua New Guinea". */
var MSG_675_PG_0 = goog.getMsg('Papua New Guinea');
/** @desc The name of the country/territory "Paraguay". */
var MSG_595_PY_0 = goog.getMsg('Paraguay');
/** @desc The name of the country/territory "Peru". */
var MSG_51_PE_0 = goog.getMsg('Peru');
/** @desc The name of the country/territory "Philippines". */
var MSG_63_PH_0 = goog.getMsg('Philippines');
/** @desc The name of the country/territory "Poland". */
var MSG_48_PL_0 = goog.getMsg('Poland');
/** @desc The name of the country/territory "Portugal". */
var MSG_351_PT_0 = goog.getMsg('Portugal');
/** @desc The name of the country/territory "Puerto Rico". */
var MSG_1_PR_0 = goog.getMsg('Puerto Rico');
/** @desc The name of the country/territory "Qatar". */
var MSG_974_QA_0 = goog.getMsg('Qatar');
/** @desc The name of the country/territory "Réunion". */
var MSG_262_RE_0 = goog.getMsg('Réunion');
/** @desc The name of the country/territory "Romania". */
var MSG_40_RO_0 = goog.getMsg('Romania');
/** @desc The name of the country/territory "Russia". */
var MSG_7_RU_0 = goog.getMsg('Russia');
/** @desc The name of the country/territory "Rwanda". */
var MSG_250_RW_0 = goog.getMsg('Rwanda');
/** @desc The name of the country/territory "Saint Barthélemy". */
var MSG_590_BL_0 = goog.getMsg('Saint Barthélemy');
/** @desc The name of the country/territory "Saint Helena". */
var MSG_290_SH_0 = goog.getMsg('Saint Helena');
/** @desc The name of the country/territory "St. Kitts". */
var MSG_1_KN_0 = goog.getMsg('St. Kitts');
/** @desc The name of the country/territory "St. Lucia". */
var MSG_1_LC_0 = goog.getMsg('St. Lucia');
/** @desc The name of the country/territory "Saint Martin". */
var MSG_590_MF_0 = goog.getMsg('Saint Martin');
/** @desc The name of the country/territory "Saint Pierre and Miquelon". */
var MSG_508_PM_0 = goog.getMsg('Saint Pierre and Miquelon');
/** @desc The name of the country/territory "St. Vincent". */
var MSG_1_VC_0 = goog.getMsg('St. Vincent');
/** @desc The name of the country/territory "Samoa". */
var MSG_685_WS_0 = goog.getMsg('Samoa');
/** @desc The name of the country/territory "San Marino". */
var MSG_378_SM_0 = goog.getMsg('San Marino');
/** @desc The name of the country/territory "São Tomé and Príncipe". */
var MSG_239_ST_0 = goog.getMsg('São Tomé and Príncipe');
/** @desc The name of the country/territory "Saudi Arabia". */
var MSG_966_SA_0 = goog.getMsg('Saudi Arabia');
/** @desc The name of the country/territory "Senegal". */
var MSG_221_SN_0 = goog.getMsg('Senegal');
/** @desc The name of the country/territory "Serbia". */
var MSG_381_RS_0 = goog.getMsg('Serbia');
/** @desc The name of the country/territory "Seychelles". */
var MSG_248_SC_0 = goog.getMsg('Seychelles');
/** @desc The name of the country/territory "Sierra Leone". */
var MSG_232_SL_0 = goog.getMsg('Sierra Leone');
/** @desc The name of the country/territory "Singapore". */
var MSG_65_SG_0 = goog.getMsg('Singapore');
/** @desc The name of the country/territory "Sint Maarten". */
var MSG_1_SX_0 = goog.getMsg('Sint Maarten');
/** @desc The name of the country/territory "Slovakia". */
var MSG_421_SK_0 = goog.getMsg('Slovakia');
/** @desc The name of the country/territory "Slovenia". */
var MSG_386_SI_0 = goog.getMsg('Slovenia');
/** @desc The name of the country/territory "Solomon Islands". */
var MSG_677_SB_0 = goog.getMsg('Solomon Islands');
/** @desc The name of the country/territory "Somalia". */
var MSG_252_SO_0 = goog.getMsg('Somalia');
/** @desc The name of the country/territory "South Africa". */
var MSG_27_ZA_0 = goog.getMsg('South Africa');
/** @desc The name of the country/territory "South Georgia and the South Sandwich Islands". */
var MSG_500_GS_0 = goog.getMsg('South Georgia and the South Sandwich Islands');
/** @desc The name of the country/territory "South Korea". */
var MSG_82_KR_0 = goog.getMsg('South Korea');
/** @desc The name of the country/territory "South Sudan". */
var MSG_211_SS_0 = goog.getMsg('South Sudan');
/** @desc The name of the country/territory "Spain". */
var MSG_34_ES_0 = goog.getMsg('Spain');
/** @desc The name of the country/territory "Sri Lanka". */
var MSG_94_LK_0 = goog.getMsg('Sri Lanka');
/** @desc The name of the country/territory "Sudan". */
var MSG_249_SD_0 = goog.getMsg('Sudan');
/** @desc The name of the country/territory "Suriname". */
var MSG_597_SR_0 = goog.getMsg('Suriname');
/** @desc The name of the country/territory "Svalbard and Jan Mayen". */
var MSG_47_SJ_0 = goog.getMsg('Svalbard and Jan Mayen');
/** @desc The name of the country/territory "Swaziland". */
var MSG_268_SZ_0 = goog.getMsg('Swaziland');
/** @desc The name of the country/territory "Sweden". */
var MSG_46_SE_0 = goog.getMsg('Sweden');
/** @desc The name of the country/territory "Switzerland". */
var MSG_41_CH_0 = goog.getMsg('Switzerland');
/** @desc The name of the country/territory "Syria". */
var MSG_963_SY_0 = goog.getMsg('Syria');
/** @desc The name of the country/territory "Taiwan". */
var MSG_886_TW_0 = goog.getMsg('Taiwan');
/** @desc The name of the country/territory "Tajikistan". */
var MSG_992_TJ_0 = goog.getMsg('Tajikistan');
/** @desc The name of the country/territory "Tanzania". */
var MSG_255_TZ_0 = goog.getMsg('Tanzania');
/** @desc The name of the country/territory "Thailand". */
var MSG_66_TH_0 = goog.getMsg('Thailand');
/** @desc The name of the country/territory "Togo". */
var MSG_228_TG_0 = goog.getMsg('Togo');
/** @desc The name of the country/territory "Tokelau". */
var MSG_690_TK_0 = goog.getMsg('Tokelau');
/** @desc The name of the country/territory "Tonga". */
var MSG_676_TO_0 = goog.getMsg('Tonga');
/** @desc The name of the country/territory "Trinidad/Tobago". */
var MSG_1_TT_0 = goog.getMsg('Trinidad/Tobago');
/** @desc The name of the country/territory "Tunisia". */
var MSG_216_TN_0 = goog.getMsg('Tunisia');
/** @desc The name of the country/territory "Turkey". */
var MSG_90_TR_0 = goog.getMsg('Turkey');
/** @desc The name of the country/territory "Turkmenistan". */
var MSG_993_TM_0 = goog.getMsg('Turkmenistan');
/** @desc The name of the country/territory "Turks and Caicos Islands". */
var MSG_1_TC_0 = goog.getMsg('Turks and Caicos Islands');
/** @desc The name of the country/territory "Tuvalu". */
var MSG_688_TV_0 = goog.getMsg('Tuvalu');
/** @desc The name of the country/territory "U.S. Virgin Islands". */
var MSG_1_VI_0 = goog.getMsg('U.S. Virgin Islands');
/** @desc The name of the country/territory "Uganda". */
var MSG_256_UG_0 = goog.getMsg('Uganda');
/** @desc The name of the country/territory "Ukraine". */
var MSG_380_UA_0 = goog.getMsg('Ukraine');
/** @desc The name of the country/territory "United Arab Emirates". */
var MSG_971_AE_0 = goog.getMsg('United Arab Emirates');
/** @desc The name of the country/territory "United Kingdom". */
var MSG_44_GB_0 = goog.getMsg('United Kingdom');
/** @desc The name of the country/territory "United States". */
var MSG_1_US_0 = goog.getMsg('United States');
/** @desc The name of the country/territory "Uruguay". */
var MSG_598_UY_0 = goog.getMsg('Uruguay');
/** @desc The name of the country/territory "Uzbekistan". */
var MSG_998_UZ_0 = goog.getMsg('Uzbekistan');
/** @desc The name of the country/territory "Vanuatu". */
var MSG_678_VU_0 = goog.getMsg('Vanuatu');
/** @desc The name of the country/territory "Vatican City". */
var MSG_379_VA_0 = goog.getMsg('Vatican City');
/** @desc The name of the country/territory "Venezuela". */
var MSG_58_VE_0 = goog.getMsg('Venezuela');
/** @desc The name of the country/territory "Vietnam". */
var MSG_84_VN_0 = goog.getMsg('Vietnam');
/** @desc The name of the country/territory "Wallis and Futuna". */
var MSG_681_WF_0 = goog.getMsg('Wallis and Futuna');
/** @desc The name of the country/territory "Western Sahara". */
var MSG_212_EH_0 = goog.getMsg('Western Sahara');
/** @desc The name of the country/territory "Yemen". */
var MSG_967_YE_0 = goog.getMsg('Yemen');
/** @desc The name of the country/territory "Zambia". */
var MSG_260_ZM_0 = goog.getMsg('Zambia');
/** @desc The name of the country/territory "Zimbabwe". */
var MSG_263_ZW_0 = goog.getMsg('Zimbabwe');
/**
 * @type {!Array<!firebaseui.auth.data.country.Country>}
 */
firebaseui.auth.data.country.COUNTRY_LIST = [
  {
    name: MSG_93_AF_0,
    e164_key: '93-AF-0',
    e164_cc: '93',
    iso2_cc: 'AF'
  },
  {
    name: MSG_358_AX_0,
    e164_key: '358-AX-0',
    e164_cc: '358',
    iso2_cc: 'AX'
  },
  {
    name: MSG_355_AL_0,
    e164_key: '355-AL-0',
    e164_cc: '355',
    iso2_cc: 'AL'
  },
  {
    name: MSG_213_DZ_0,
    e164_key: '213-DZ-0',
    e164_cc: '213',
    iso2_cc: 'DZ'
  },
  {
    name: MSG_1_AS_0,
    e164_key: '1-AS-0',
    e164_cc: '1',
    iso2_cc: 'AS'
  },
  {
    name: MSG_376_AD_0,
    e164_key: '376-AD-0',
    e164_cc: '376',
    iso2_cc: 'AD'
  },
  {
    name: MSG_244_AO_0,
    e164_key: '244-AO-0',
    e164_cc: '244',
    iso2_cc: 'AO'
  },
  {
    name: MSG_1_AI_0,
    e164_key: '1-AI-0',
    e164_cc: '1',
    iso2_cc: 'AI'
  },
  {
    name: MSG_1_AG_0,
    e164_key: '1-AG-0',
    e164_cc: '1',
    iso2_cc: 'AG'
  },
  {
    name: MSG_54_AR_0,
    e164_key: '54-AR-0',
    e164_cc: '54',
    iso2_cc: 'AR'
  },
  {
    name: MSG_374_AM_0,
    e164_key: '374-AM-0',
    e164_cc: '374',
    iso2_cc: 'AM'
  },
  {
    name: MSG_297_AW_0,
    e164_key: '297-AW-0',
    e164_cc: '297',
    iso2_cc: 'AW'
  },
  {
    name: MSG_247_AC_0,
    e164_key: '247-AC-0',
    e164_cc: '247',
    iso2_cc: 'AC'
  },
  {
    name: MSG_61_AU_0,
    e164_key: '61-AU-0',
    e164_cc: '61',
    iso2_cc: 'AU'
  },
  {
    name: MSG_43_AT_0,
    e164_key: '43-AT-0',
    e164_cc: '43',
    iso2_cc: 'AT'
  },
  {
    name: MSG_994_AZ_0,
    e164_key: '994-AZ-0',
    e164_cc: '994',
    iso2_cc: 'AZ'
  },
  {
    name: MSG_1_BS_0,
    e164_key: '1-BS-0',
    e164_cc: '1',
    iso2_cc: 'BS'
  },
  {
    name: MSG_973_BH_0,
    e164_key: '973-BH-0',
    e164_cc: '973',
    iso2_cc: 'BH'
  },
  {
    name: MSG_880_BD_0,
    e164_key: '880-BD-0',
    e164_cc: '880',
    iso2_cc: 'BD'
  },
  {
    name: MSG_1_BB_0,
    e164_key: '1-BB-0',
    e164_cc: '1',
    iso2_cc: 'BB'
  },
  {
    name: MSG_375_BY_0,
    e164_key: '375-BY-0',
    e164_cc: '375',
    iso2_cc: 'BY'
  },
  {
    name: MSG_32_BE_0,
    e164_key: '32-BE-0',
    e164_cc: '32',
    iso2_cc: 'BE'
  },
  {
    name: MSG_501_BZ_0,
    e164_key: '501-BZ-0',
    e164_cc: '501',
    iso2_cc: 'BZ'
  },
  {
    name: MSG_229_BJ_0,
    e164_key: '229-BJ-0',
    e164_cc: '229',
    iso2_cc: 'BJ'
  },
  {
    name: MSG_1_BM_0,
    e164_key: '1-BM-0',
    e164_cc: '1',
    iso2_cc: 'BM'
  },
  {
    name: MSG_975_BT_0,
    e164_key: '975-BT-0',
    e164_cc: '975',
    iso2_cc: 'BT'
  },
  {
    name: MSG_591_BO_0,
    e164_key: '591-BO-0',
    e164_cc: '591',
    iso2_cc: 'BO'
  },
  {
    name: MSG_387_BA_0,
    e164_key: '387-BA-0',
    e164_cc: '387',
    iso2_cc: 'BA'
  },
  {
    name: MSG_267_BW_0,
    e164_key: '267-BW-0',
    e164_cc: '267',
    iso2_cc: 'BW'
  },
  {
    name: MSG_55_BR_0,
    e164_key: '55-BR-0',
    e164_cc: '55',
    iso2_cc: 'BR'
  },
  {
    name: MSG_246_IO_0,
    e164_key: '246-IO-0',
    e164_cc: '246',
    iso2_cc: 'IO'
  },
  {
    name: MSG_1_VG_0,
    e164_key: '1-VG-0',
    e164_cc: '1',
    iso2_cc: 'VG'
  },
  {
    name: MSG_673_BN_0,
    e164_key: '673-BN-0',
    e164_cc: '673',
    iso2_cc: 'BN'
  },
  {
    name: MSG_359_BG_0,
    e164_key: '359-BG-0',
    e164_cc: '359',
    iso2_cc: 'BG'
  },
  {
    name: MSG_226_BF_0,
    e164_key: '226-BF-0',
    e164_cc: '226',
    iso2_cc: 'BF'
  },
  {
    name: MSG_257_BI_0,
    e164_key: '257-BI-0',
    e164_cc: '257',
    iso2_cc: 'BI'
  },
  {
    name: MSG_855_KH_0,
    e164_key: '855-KH-0',
    e164_cc: '855',
    iso2_cc: 'KH'
  },
  {
    name: MSG_237_CM_0,
    e164_key: '237-CM-0',
    e164_cc: '237',
    iso2_cc: 'CM'
  },
  {
    name: MSG_1_CA_0,
    e164_key: '1-CA-0',
    e164_cc: '1',
    iso2_cc: 'CA'
  },
  {
    name: MSG_238_CV_0,
    e164_key: '238-CV-0',
    e164_cc: '238',
    iso2_cc: 'CV'
  },
  {
    name: MSG_599_BQ_0,
    e164_key: '599-BQ-0',
    e164_cc: '599',
    iso2_cc: 'BQ'
  },
  {
    name: MSG_1_KY_0,
    e164_key: '1-KY-0',
    e164_cc: '1',
    iso2_cc: 'KY'
  },
  {
    name: MSG_236_CF_0,
    e164_key: '236-CF-0',
    e164_cc: '236',
    iso2_cc: 'CF'
  },
  {
    name: MSG_235_TD_0,
    e164_key: '235-TD-0',
    e164_cc: '235',
    iso2_cc: 'TD'
  },
  {
    name: MSG_56_CL_0,
    e164_key: '56-CL-0',
    e164_cc: '56',
    iso2_cc: 'CL'
  },
  {
    name: MSG_86_CN_0,
    e164_key: '86-CN-0',
    e164_cc: '86',
    iso2_cc: 'CN'
  },
  {
    name: MSG_61_CX_0,
    e164_key: '61-CX-0',
    e164_cc: '61',
    iso2_cc: 'CX'
  },
  {
    name: MSG_61_CC_0,
    e164_key: '61-CC-0',
    e164_cc: '61',
    iso2_cc: 'CC'
  },
  {
    name: MSG_57_CO_0,
    e164_key: '57-CO-0',
    e164_cc: '57',
    iso2_cc: 'CO'
  },
  {
    name: MSG_269_KM_0,
    e164_key: '269-KM-0',
    e164_cc: '269',
    iso2_cc: 'KM'
  },
  {
    name: MSG_243_CD_0,
    e164_key: '243-CD-0',
    e164_cc: '243',
    iso2_cc: 'CD'
  },
  {
    name: MSG_242_CG_0,
    e164_key: '242-CG-0',
    e164_cc: '242',
    iso2_cc: 'CG'
  },
  {
    name: MSG_682_CK_0,
    e164_key: '682-CK-0',
    e164_cc: '682',
    iso2_cc: 'CK'
  },
  {
    name: MSG_506_CR_0,
    e164_key: '506-CR-0',
    e164_cc: '506',
    iso2_cc: 'CR'
  },
  {
    name: MSG_225_CI_0,
    e164_key: '225-CI-0',
    e164_cc: '225',
    iso2_cc: 'CI'
  },
  {
    name: MSG_385_HR_0,
    e164_key: '385-HR-0',
    e164_cc: '385',
    iso2_cc: 'HR'
  },
  {
    name: MSG_53_CU_0,
    e164_key: '53-CU-0',
    e164_cc: '53',
    iso2_cc: 'CU'
  },
  {
    name: MSG_599_CW_0,
    e164_key: '599-CW-0',
    e164_cc: '599',
    iso2_cc: 'CW'
  },
  {
    name: MSG_357_CY_0,
    e164_key: '357-CY-0',
    e164_cc: '357',
    iso2_cc: 'CY'
  },
  {
    name: MSG_420_CZ_0,
    e164_key: '420-CZ-0',
    e164_cc: '420',
    iso2_cc: 'CZ'
  },
  {
    name: MSG_45_DK_0,
    e164_key: '45-DK-0',
    e164_cc: '45',
    iso2_cc: 'DK'
  },
  {
    name: MSG_253_DJ_0,
    e164_key: '253-DJ-0',
    e164_cc: '253',
    iso2_cc: 'DJ'
  },
  {
    name: MSG_1_DM_0,
    e164_key: '1-DM-0',
    e164_cc: '1',
    iso2_cc: 'DM'
  },
  {
    name: MSG_1_DO_0,
    e164_key: '1-DO-0',
    e164_cc: '1',
    iso2_cc: 'DO'
  },
  {
    name: MSG_670_TL_0,
    e164_key: '670-TL-0',
    e164_cc: '670',
    iso2_cc: 'TL'
  },
  {
    name: MSG_593_EC_0,
    e164_key: '593-EC-0',
    e164_cc: '593',
    iso2_cc: 'EC'
  },
  {
    name: MSG_20_EG_0,
    e164_key: '20-EG-0',
    e164_cc: '20',
    iso2_cc: 'EG'
  },
  {
    name: MSG_503_SV_0,
    e164_key: '503-SV-0',
    e164_cc: '503',
    iso2_cc: 'SV'
  },
  {
    name: MSG_240_GQ_0,
    e164_key: '240-GQ-0',
    e164_cc: '240',
    iso2_cc: 'GQ'
  },
  {
    name: MSG_291_ER_0,
    e164_key: '291-ER-0',
    e164_cc: '291',
    iso2_cc: 'ER'
  },
  {
    name: MSG_372_EE_0,
    e164_key: '372-EE-0',
    e164_cc: '372',
    iso2_cc: 'EE'
  },
  {
    name: MSG_251_ET_0,
    e164_key: '251-ET-0',
    e164_cc: '251',
    iso2_cc: 'ET'
  },
  {
    name: MSG_500_FK_0,
    e164_key: '500-FK-0',
    e164_cc: '500',
    iso2_cc: 'FK'
  },
  {
    name: MSG_298_FO_0,
    e164_key: '298-FO-0',
    e164_cc: '298',
    iso2_cc: 'FO'
  },
  {
    name: MSG_679_FJ_0,
    e164_key: '679-FJ-0',
    e164_cc: '679',
    iso2_cc: 'FJ'
  },
  {
    name: MSG_358_FI_0,
    e164_key: '358-FI-0',
    e164_cc: '358',
    iso2_cc: 'FI'
  },
  {
    name: MSG_33_FR_0,
    e164_key: '33-FR-0',
    e164_cc: '33',
    iso2_cc: 'FR'
  },
  {
    name: MSG_594_GF_0,
    e164_key: '594-GF-0',
    e164_cc: '594',
    iso2_cc: 'GF'
  },
  {
    name: MSG_689_PF_0,
    e164_key: '689-PF-0',
    e164_cc: '689',
    iso2_cc: 'PF'
  },
  {
    name: MSG_241_GA_0,
    e164_key: '241-GA-0',
    e164_cc: '241',
    iso2_cc: 'GA'
  },
  {
    name: MSG_220_GM_0,
    e164_key: '220-GM-0',
    e164_cc: '220',
    iso2_cc: 'GM'
  },
  {
    name: MSG_995_GE_0,
    e164_key: '995-GE-0',
    e164_cc: '995',
    iso2_cc: 'GE'
  },
  {
    name: MSG_49_DE_0,
    e164_key: '49-DE-0',
    e164_cc: '49',
    iso2_cc: 'DE'
  },
  {
    name: MSG_233_GH_0,
    e164_key: '233-GH-0',
    e164_cc: '233',
    iso2_cc: 'GH'
  },
  {
    name: MSG_350_GI_0,
    e164_key: '350-GI-0',
    e164_cc: '350',
    iso2_cc: 'GI'
  },
  {
    name: MSG_30_GR_0,
    e164_key: '30-GR-0',
    e164_cc: '30',
    iso2_cc: 'GR'
  },
  {
    name: MSG_299_GL_0,
    e164_key: '299-GL-0',
    e164_cc: '299',
    iso2_cc: 'GL'
  },
  {
    name: MSG_1_GD_0,
    e164_key: '1-GD-0',
    e164_cc: '1',
    iso2_cc: 'GD'
  },
  {
    name: MSG_590_GP_0,
    e164_key: '590-GP-0',
    e164_cc: '590',
    iso2_cc: 'GP'
  },
  {
    name: MSG_1_GU_0,
    e164_key: '1-GU-0',
    e164_cc: '1',
    iso2_cc: 'GU'
  },
  {
    name: MSG_502_GT_0,
    e164_key: '502-GT-0',
    e164_cc: '502',
    iso2_cc: 'GT'
  },
  {
    name: MSG_44_GG_0,
    e164_key: '44-GG-0',
    e164_cc: '44',
    iso2_cc: 'GG'
  },
  {
    name: MSG_224_GN_0,
    e164_key: '224-GN-0',
    e164_cc: '224',
    iso2_cc: 'GN'
  },
  {
    name: MSG_245_GW_0,
    e164_key: '245-GW-0',
    e164_cc: '245',
    iso2_cc: 'GW'
  },
  {
    name: MSG_592_GY_0,
    e164_key: '592-GY-0',
    e164_cc: '592',
    iso2_cc: 'GY'
  },
  {
    name: MSG_509_HT_0,
    e164_key: '509-HT-0',
    e164_cc: '509',
    iso2_cc: 'HT'
  },
  {
    name: MSG_672_HM_0,
    e164_key: '672-HM-0',
    e164_cc: '672',
    iso2_cc: 'HM'
  },
  {
    name: MSG_504_HN_0,
    e164_key: '504-HN-0',
    e164_cc: '504',
    iso2_cc: 'HN'
  },
  {
    name: MSG_852_HK_0,
    e164_key: '852-HK-0',
    e164_cc: '852',
    iso2_cc: 'HK'
  },
  {
    name: MSG_36_HU_0,
    e164_key: '36-HU-0',
    e164_cc: '36',
    iso2_cc: 'HU'
  },
  {
    name: MSG_354_IS_0,
    e164_key: '354-IS-0',
    e164_cc: '354',
    iso2_cc: 'IS'
  },
  {
    name: MSG_91_IN_0,
    e164_key: '91-IN-0',
    e164_cc: '91',
    iso2_cc: 'IN'
  },
  {
    name: MSG_62_ID_0,
    e164_key: '62-ID-0',
    e164_cc: '62',
    iso2_cc: 'ID'
  },
  {
    name: MSG_98_IR_0,
    e164_key: '98-IR-0',
    e164_cc: '98',
    iso2_cc: 'IR'
  },
  {
    name: MSG_964_IQ_0,
    e164_key: '964-IQ-0',
    e164_cc: '964',
    iso2_cc: 'IQ'
  },
  {
    name: MSG_353_IE_0,
    e164_key: '353-IE-0',
    e164_cc: '353',
    iso2_cc: 'IE'
  },
  {
    name: MSG_44_IM_0,
    e164_key: '44-IM-0',
    e164_cc: '44',
    iso2_cc: 'IM'
  },
  {
    name: MSG_972_IL_0,
    e164_key: '972-IL-0',
    e164_cc: '972',
    iso2_cc: 'IL'
  },
  {
    name: MSG_39_IT_0,
    e164_key: '39-IT-0',
    e164_cc: '39',
    iso2_cc: 'IT'
  },
  {
    name: MSG_1_JM_0,
    e164_key: '1-JM-0',
    e164_cc: '1',
    iso2_cc: 'JM'
  },
  {
    name: MSG_81_JP_0,
    e164_key: '81-JP-0',
    e164_cc: '81',
    iso2_cc: 'JP'
  },
  {
    name: MSG_44_JE_0,
    e164_key: '44-JE-0',
    e164_cc: '44',
    iso2_cc: 'JE'
  },
  {
    name: MSG_962_JO_0,
    e164_key: '962-JO-0',
    e164_cc: '962',
    iso2_cc: 'JO'
  },
  {
    name: MSG_7_KZ_0,
    e164_key: '7-KZ-0',
    e164_cc: '7',
    iso2_cc: 'KZ'
  },
  {
    name: MSG_254_KE_0,
    e164_key: '254-KE-0',
    e164_cc: '254',
    iso2_cc: 'KE'
  },
  {
    name: MSG_686_KI_0,
    e164_key: '686-KI-0',
    e164_cc: '686',
    iso2_cc: 'KI'
  },
  {
    name: MSG_377_XK_0,
    e164_key: '377-XK-0',
    e164_cc: '377',
    iso2_cc: 'XK'
  },
  {
    name: MSG_381_XK_0,
    e164_key: '381-XK-0',
    e164_cc: '381',
    iso2_cc: 'XK'
  },
  {
    name: MSG_386_XK_0,
    e164_key: '386-XK-0',
    e164_cc: '386',
    iso2_cc: 'XK'
  },
  {
    name: MSG_965_KW_0,
    e164_key: '965-KW-0',
    e164_cc: '965',
    iso2_cc: 'KW'
  },
  {
    name: MSG_996_KG_0,
    e164_key: '996-KG-0',
    e164_cc: '996',
    iso2_cc: 'KG'
  },
  {
    name: MSG_856_LA_0,
    e164_key: '856-LA-0',
    e164_cc: '856',
    iso2_cc: 'LA'
  },
  {
    name: MSG_371_LV_0,
    e164_key: '371-LV-0',
    e164_cc: '371',
    iso2_cc: 'LV'
  },
  {
    name: MSG_961_LB_0,
    e164_key: '961-LB-0',
    e164_cc: '961',
    iso2_cc: 'LB'
  },
  {
    name: MSG_266_LS_0,
    e164_key: '266-LS-0',
    e164_cc: '266',
    iso2_cc: 'LS'
  },
  {
    name: MSG_231_LR_0,
    e164_key: '231-LR-0',
    e164_cc: '231',
    iso2_cc: 'LR'
  },
  {
    name: MSG_218_LY_0,
    e164_key: '218-LY-0',
    e164_cc: '218',
    iso2_cc: 'LY'
  },
  {
    name: MSG_423_LI_0,
    e164_key: '423-LI-0',
    e164_cc: '423',
    iso2_cc: 'LI'
  },
  {
    name: MSG_370_LT_0,
    e164_key: '370-LT-0',
    e164_cc: '370',
    iso2_cc: 'LT'
  },
  {
    name: MSG_352_LU_0,
    e164_key: '352-LU-0',
    e164_cc: '352',
    iso2_cc: 'LU'
  },
  {
    name: MSG_853_MO_0,
    e164_key: '853-MO-0',
    e164_cc: '853',
    iso2_cc: 'MO'
  },
  {
    name: MSG_389_MK_0,
    e164_key: '389-MK-0',
    e164_cc: '389',
    iso2_cc: 'MK'
  },
  {
    name: MSG_261_MG_0,
    e164_key: '261-MG-0',
    e164_cc: '261',
    iso2_cc: 'MG'
  },
  {
    name: MSG_265_MW_0,
    e164_key: '265-MW-0',
    e164_cc: '265',
    iso2_cc: 'MW'
  },
  {
    name: MSG_60_MY_0,
    e164_key: '60-MY-0',
    e164_cc: '60',
    iso2_cc: 'MY'
  },
  {
    name: MSG_960_MV_0,
    e164_key: '960-MV-0',
    e164_cc: '960',
    iso2_cc: 'MV'
  },
  {
    name: MSG_223_ML_0,
    e164_key: '223-ML-0',
    e164_cc: '223',
    iso2_cc: 'ML'
  },
  {
    name: MSG_356_MT_0,
    e164_key: '356-MT-0',
    e164_cc: '356',
    iso2_cc: 'MT'
  },
  {
    name: MSG_692_MH_0,
    e164_key: '692-MH-0',
    e164_cc: '692',
    iso2_cc: 'MH'
  },
  {
    name: MSG_596_MQ_0,
    e164_key: '596-MQ-0',
    e164_cc: '596',
    iso2_cc: 'MQ'
  },
  {
    name: MSG_222_MR_0,
    e164_key: '222-MR-0',
    e164_cc: '222',
    iso2_cc: 'MR'
  },
  {
    name: MSG_230_MU_0,
    e164_key: '230-MU-0',
    e164_cc: '230',
    iso2_cc: 'MU'
  },
  {
    name: MSG_262_YT_0,
    e164_key: '262-YT-0',
    e164_cc: '262',
    iso2_cc: 'YT'
  },
  {
    name: MSG_52_MX_0,
    e164_key: '52-MX-0',
    e164_cc: '52',
    iso2_cc: 'MX'
  },
  {
    name: MSG_691_FM_0,
    e164_key: '691-FM-0',
    e164_cc: '691',
    iso2_cc: 'FM'
  },
  {
    name: MSG_373_MD_0,
    e164_key: '373-MD-0',
    e164_cc: '373',
    iso2_cc: 'MD'
  },
  {
    name: MSG_377_MC_0,
    e164_key: '377-MC-0',
    e164_cc: '377',
    iso2_cc: 'MC'
  },
  {
    name: MSG_976_MN_0,
    e164_key: '976-MN-0',
    e164_cc: '976',
    iso2_cc: 'MN'
  },
  {
    name: MSG_382_ME_0,
    e164_key: '382-ME-0',
    e164_cc: '382',
    iso2_cc: 'ME'
  },
  {
    name: MSG_1_MS_0,
    e164_key: '1-MS-0',
    e164_cc: '1',
    iso2_cc: 'MS'
  },
  {
    name: MSG_212_MA_0,
    e164_key: '212-MA-0',
    e164_cc: '212',
    iso2_cc: 'MA'
  },
  {
    name: MSG_258_MZ_0,
    e164_key: '258-MZ-0',
    e164_cc: '258',
    iso2_cc: 'MZ'
  },
  {
    name: MSG_95_MM_0,
    e164_key: '95-MM-0',
    e164_cc: '95',
    iso2_cc: 'MM'
  },
  {
    name: MSG_264_NA_0,
    e164_key: '264-NA-0',
    e164_cc: '264',
    iso2_cc: 'NA'
  },
  {
    name: MSG_674_NR_0,
    e164_key: '674-NR-0',
    e164_cc: '674',
    iso2_cc: 'NR'
  },
  {
    name: MSG_977_NP_0,
    e164_key: '977-NP-0',
    e164_cc: '977',
    iso2_cc: 'NP'
  },
  {
    name: MSG_31_NL_0,
    e164_key: '31-NL-0',
    e164_cc: '31',
    iso2_cc: 'NL'
  },
  {
    name: MSG_687_NC_0,
    e164_key: '687-NC-0',
    e164_cc: '687',
    iso2_cc: 'NC'
  },
  {
    name: MSG_64_NZ_0,
    e164_key: '64-NZ-0',
    e164_cc: '64',
    iso2_cc: 'NZ'
  },
  {
    name: MSG_505_NI_0,
    e164_key: '505-NI-0',
    e164_cc: '505',
    iso2_cc: 'NI'
  },
  {
    name: MSG_227_NE_0,
    e164_key: '227-NE-0',
    e164_cc: '227',
    iso2_cc: 'NE'
  },
  {
    name: MSG_234_NG_0,
    e164_key: '234-NG-0',
    e164_cc: '234',
    iso2_cc: 'NG'
  },
  {
    name: MSG_683_NU_0,
    e164_key: '683-NU-0',
    e164_cc: '683',
    iso2_cc: 'NU'
  },
  {
    name: MSG_672_NF_0,
    e164_key: '672-NF-0',
    e164_cc: '672',
    iso2_cc: 'NF'
  },
  {
    name: MSG_850_KP_0,
    e164_key: '850-KP-0',
    e164_cc: '850',
    iso2_cc: 'KP'
  },
  {
    name: MSG_1_MP_0,
    e164_key: '1-MP-0',
    e164_cc: '1',
    iso2_cc: 'MP'
  },
  {
    name: MSG_47_NO_0,
    e164_key: '47-NO-0',
    e164_cc: '47',
    iso2_cc: 'NO'
  },
  {
    name: MSG_968_OM_0,
    e164_key: '968-OM-0',
    e164_cc: '968',
    iso2_cc: 'OM'
  },
  {
    name: MSG_92_PK_0,
    e164_key: '92-PK-0',
    e164_cc: '92',
    iso2_cc: 'PK'
  },
  {
    name: MSG_680_PW_0,
    e164_key: '680-PW-0',
    e164_cc: '680',
    iso2_cc: 'PW'
  },
  {
    name: MSG_970_PS_0,
    e164_key: '970-PS-0',
    e164_cc: '970',
    iso2_cc: 'PS'
  },
  {
    name: MSG_507_PA_0,
    e164_key: '507-PA-0',
    e164_cc: '507',
    iso2_cc: 'PA'
  },
  {
    name: MSG_675_PG_0,
    e164_key: '675-PG-0',
    e164_cc: '675',
    iso2_cc: 'PG'
  },
  {
    name: MSG_595_PY_0,
    e164_key: '595-PY-0',
    e164_cc: '595',
    iso2_cc: 'PY'
  },
  {
    name: MSG_51_PE_0,
    e164_key: '51-PE-0',
    e164_cc: '51',
    iso2_cc: 'PE'
  },
  {
    name: MSG_63_PH_0,
    e164_key: '63-PH-0',
    e164_cc: '63',
    iso2_cc: 'PH'
  },
  {
    name: MSG_48_PL_0,
    e164_key: '48-PL-0',
    e164_cc: '48',
    iso2_cc: 'PL'
  },
  {
    name: MSG_351_PT_0,
    e164_key: '351-PT-0',
    e164_cc: '351',
    iso2_cc: 'PT'
  },
  {
    name: MSG_1_PR_0,
    e164_key: '1-PR-0',
    e164_cc: '1',
    iso2_cc: 'PR'
  },
  {
    name: MSG_974_QA_0,
    e164_key: '974-QA-0',
    e164_cc: '974',
    iso2_cc: 'QA'
  },
  {
    name: MSG_262_RE_0,
    e164_key: '262-RE-0',
    e164_cc: '262',
    iso2_cc: 'RE'
  },
  {
    name: MSG_40_RO_0,
    e164_key: '40-RO-0',
    e164_cc: '40',
    iso2_cc: 'RO'
  },
  {
    name: MSG_7_RU_0,
    e164_key: '7-RU-0',
    e164_cc: '7',
    iso2_cc: 'RU'
  },
  {
    name: MSG_250_RW_0,
    e164_key: '250-RW-0',
    e164_cc: '250',
    iso2_cc: 'RW'
  },
  {
    name: MSG_590_BL_0,
    e164_key: '590-BL-0',
    e164_cc: '590',
    iso2_cc: 'BL'
  },
  {
    name: MSG_290_SH_0,
    e164_key: '290-SH-0',
    e164_cc: '290',
    iso2_cc: 'SH'
  },
  {
    name: MSG_1_KN_0,
    e164_key: '1-KN-0',
    e164_cc: '1',
    iso2_cc: 'KN'
  },
  {
    name: MSG_1_LC_0,
    e164_key: '1-LC-0',
    e164_cc: '1',
    iso2_cc: 'LC'
  },
  {
    name: MSG_590_MF_0,
    e164_key: '590-MF-0',
    e164_cc: '590',
    iso2_cc: 'MF'
  },
  {
    name: MSG_508_PM_0,
    e164_key: '508-PM-0',
    e164_cc: '508',
    iso2_cc: 'PM'
  },
  {
    name: MSG_1_VC_0,
    e164_key: '1-VC-0',
    e164_cc: '1',
    iso2_cc: 'VC'
  },
  {
    name: MSG_685_WS_0,
    e164_key: '685-WS-0',
    e164_cc: '685',
    iso2_cc: 'WS'
  },
  {
    name: MSG_378_SM_0,
    e164_key: '378-SM-0',
    e164_cc: '378',
    iso2_cc: 'SM'
  },
  {
    name: MSG_239_ST_0,
    e164_key: '239-ST-0',
    e164_cc: '239',
    iso2_cc: 'ST'
  },
  {
    name: MSG_966_SA_0,
    e164_key: '966-SA-0',
    e164_cc: '966',
    iso2_cc: 'SA'
  },
  {
    name: MSG_221_SN_0,
    e164_key: '221-SN-0',
    e164_cc: '221',
    iso2_cc: 'SN'
  },
  {
    name: MSG_381_RS_0,
    e164_key: '381-RS-0',
    e164_cc: '381',
    iso2_cc: 'RS'
  },
  {
    name: MSG_248_SC_0,
    e164_key: '248-SC-0',
    e164_cc: '248',
    iso2_cc: 'SC'
  },
  {
    name: MSG_232_SL_0,
    e164_key: '232-SL-0',
    e164_cc: '232',
    iso2_cc: 'SL'
  },
  {
    name: MSG_65_SG_0,
    e164_key: '65-SG-0',
    e164_cc: '65',
    iso2_cc: 'SG'
  },
  {
    name: MSG_1_SX_0,
    e164_key: '1-SX-0',
    e164_cc: '1',
    iso2_cc: 'SX'
  },
  {
    name: MSG_421_SK_0,
    e164_key: '421-SK-0',
    e164_cc: '421',
    iso2_cc: 'SK'
  },
  {
    name: MSG_386_SI_0,
    e164_key: '386-SI-0',
    e164_cc: '386',
    iso2_cc: 'SI'
  },
  {
    name: MSG_677_SB_0,
    e164_key: '677-SB-0',
    e164_cc: '677',
    iso2_cc: 'SB'
  },
  {
    name: MSG_252_SO_0,
    e164_key: '252-SO-0',
    e164_cc: '252',
    iso2_cc: 'SO'
  },
  {
    name: MSG_27_ZA_0,
    e164_key: '27-ZA-0',
    e164_cc: '27',
    iso2_cc: 'ZA'
  },
  {
    name: MSG_500_GS_0,
    e164_key: '500-GS-0',
    e164_cc: '500',
    iso2_cc: 'GS'
  },
  {
    name: MSG_82_KR_0,
    e164_key: '82-KR-0',
    e164_cc: '82',
    iso2_cc: 'KR'
  },
  {
    name: MSG_211_SS_0,
    e164_key: '211-SS-0',
    e164_cc: '211',
    iso2_cc: 'SS'
  },
  {
    name: MSG_34_ES_0,
    e164_key: '34-ES-0',
    e164_cc: '34',
    iso2_cc: 'ES'
  },
  {
    name: MSG_94_LK_0,
    e164_key: '94-LK-0',
    e164_cc: '94',
    iso2_cc: 'LK'
  },
  {
    name: MSG_249_SD_0,
    e164_key: '249-SD-0',
    e164_cc: '249',
    iso2_cc: 'SD'
  },
  {
    name: MSG_597_SR_0,
    e164_key: '597-SR-0',
    e164_cc: '597',
    iso2_cc: 'SR'
  },
  {
    name: MSG_47_SJ_0,
    e164_key: '47-SJ-0',
    e164_cc: '47',
    iso2_cc: 'SJ'
  },
  {
    name: MSG_268_SZ_0,
    e164_key: '268-SZ-0',
    e164_cc: '268',
    iso2_cc: 'SZ'
  },
  {
    name: MSG_46_SE_0,
    e164_key: '46-SE-0',
    e164_cc: '46',
    iso2_cc: 'SE'
  },
  {
    name: MSG_41_CH_0,
    e164_key: '41-CH-0',
    e164_cc: '41',
    iso2_cc: 'CH'
  },
  {
    name: MSG_963_SY_0,
    e164_key: '963-SY-0',
    e164_cc: '963',
    iso2_cc: 'SY'
  },
  {
    name: MSG_886_TW_0,
    e164_key: '886-TW-0',
    e164_cc: '886',
    iso2_cc: 'TW'
  },
  {
    name: MSG_992_TJ_0,
    e164_key: '992-TJ-0',
    e164_cc: '992',
    iso2_cc: 'TJ'
  },
  {
    name: MSG_255_TZ_0,
    e164_key: '255-TZ-0',
    e164_cc: '255',
    iso2_cc: 'TZ'
  },
  {
    name: MSG_66_TH_0,
    e164_key: '66-TH-0',
    e164_cc: '66',
    iso2_cc: 'TH'
  },
  {
    name: MSG_228_TG_0,
    e164_key: '228-TG-0',
    e164_cc: '228',
    iso2_cc: 'TG'
  },
  {
    name: MSG_690_TK_0,
    e164_key: '690-TK-0',
    e164_cc: '690',
    iso2_cc: 'TK'
  },
  {
    name: MSG_676_TO_0,
    e164_key: '676-TO-0',
    e164_cc: '676',
    iso2_cc: 'TO'
  },
  {
    name: MSG_1_TT_0,
    e164_key: '1-TT-0',
    e164_cc: '1',
    iso2_cc: 'TT'
  },
  {
    name: MSG_216_TN_0,
    e164_key: '216-TN-0',
    e164_cc: '216',
    iso2_cc: 'TN'
  },
  {
    name: MSG_90_TR_0,
    e164_key: '90-TR-0',
    e164_cc: '90',
    iso2_cc: 'TR'
  },
  {
    name: MSG_993_TM_0,
    e164_key: '993-TM-0',
    e164_cc: '993',
    iso2_cc: 'TM'
  },
  {
    name: MSG_1_TC_0,
    e164_key: '1-TC-0',
    e164_cc: '1',
    iso2_cc: 'TC'
  },
  {
    name: MSG_688_TV_0,
    e164_key: '688-TV-0',
    e164_cc: '688',
    iso2_cc: 'TV'
  },
  {
    name: MSG_1_VI_0,
    e164_key: '1-VI-0',
    e164_cc: '1',
    iso2_cc: 'VI'
  },
  {
    name: MSG_256_UG_0,
    e164_key: '256-UG-0',
    e164_cc: '256',
    iso2_cc: 'UG'
  },
  {
    name: MSG_380_UA_0,
    e164_key: '380-UA-0',
    e164_cc: '380',
    iso2_cc: 'UA'
  },
  {
    name: MSG_971_AE_0,
    e164_key: '971-AE-0',
    e164_cc: '971',
    iso2_cc: 'AE'
  },
  {
    name: MSG_44_GB_0,
    e164_key: '44-GB-0',
    e164_cc: '44',
    iso2_cc: 'GB'
  },
  {
    name: MSG_1_US_0,
    e164_key: '1-US-0',
    e164_cc: '1',
    iso2_cc: 'US'
  },
  {
    name: MSG_598_UY_0,
    e164_key: '598-UY-0',
    e164_cc: '598',
    iso2_cc: 'UY'
  },
  {
    name: MSG_998_UZ_0,
    e164_key: '998-UZ-0',
    e164_cc: '998',
    iso2_cc: 'UZ'
  },
  {
    name: MSG_678_VU_0,
    e164_key: '678-VU-0',
    e164_cc: '678',
    iso2_cc: 'VU'
  },
  {
    name: MSG_379_VA_0,
    e164_key: '379-VA-0',
    e164_cc: '379',
    iso2_cc: 'VA'
  },
  {
    name: MSG_58_VE_0,
    e164_key: '58-VE-0',
    e164_cc: '58',
    iso2_cc: 'VE'
  },
  {
    name: MSG_84_VN_0,
    e164_key: '84-VN-0',
    e164_cc: '84',
    iso2_cc: 'VN'
  },
  {
    name: MSG_681_WF_0,
    e164_key: '681-WF-0',
    e164_cc: '681',
    iso2_cc: 'WF'
  },
  {
    name: MSG_212_EH_0,
    e164_key: '212-EH-0',
    e164_cc: '212',
    iso2_cc: 'EH'
  },
  {
    name: MSG_967_YE_0,
    e164_key: '967-YE-0',
    e164_cc: '967',
    iso2_cc: 'YE'
  },
  {
    name: MSG_260_ZM_0,
    e164_key: '260-ZM-0',
    e164_cc: '260',
    iso2_cc: 'ZM'
  },
  {
    name: MSG_263_ZW_0,
    e164_key: '263-ZW-0',
    e164_cc: '263',
    iso2_cc: 'ZW'
  }
];

/*----------------------END COPIED CODE-------------------------------------*/

firebaseui.auth.data.country.sortCountryListForLocale(
    firebaseui.auth.data.country.COUNTRY_LIST, goog.LOCALE);


/**
 * @const {!firebaseui.auth.data.country.LookupTree} The country code lookup
 *     tree.
 */
firebaseui.auth.data.country.LOOKUP_TREE =
    new firebaseui.auth.data.country.LookupTree(
        firebaseui.auth.data.country.COUNTRY_LIST);
