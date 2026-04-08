import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { TEXT } from '../utils/content';
import axios from 'axios';
import { useGlobalContext } from './GlobalProvider';
import { useLocation } from 'react-router-dom';
import { LANGUAGECODES } from '../utils/staticData';
import i18n from '../i18n';
import translationAR from '../locales/ar/translationAR.json';
import translationDE from '../locales/de/translationDE.json';
import translationES from '../locales/es/translationES.json';
import translationFR from '../locales/fr/translationFR.json';
import translationIT from '../locales/it/translationIT.json';
import translationJA from '../locales/ja/translationJA.json';
import translationPT from '../locales/pt/translationPT.json';
import translationRU from '../locales/ru/translationRU.json';
import translationZH from '../locales/zh/translationZH.json';

const TranslationContext = createContext(null);

const LIBRE_TRANSLATE_ENDPOINT = import.meta.env.VITE_LIBRE_TRANSLATE_ENDPOINT;
const STATIC_LOCALES = {
  ar: translationAR,
  de: translationDE,
  es: translationES,
  fr: translationFR,
  it: translationIT,
  ja: translationJA,
  pt: translationPT,
  ru: translationRU,
  zh: translationZH,
};

const getNestedValue = (obj, path) =>
  path.split('.').reduce((acc, key) => acc?.[key], obj);

const getFirstDefined = (locale, paths = []) => {
  for (const path of paths) {
    const value = getNestedValue(locale, path);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
};

const joinTranslated = (parts) =>
  parts.filter((part) => typeof part === 'string' && part.trim()).join(' ');

const normalizeCategoryName = (value = '') =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const normalizeTranslatedValue = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const getMeaningfulObjectTranslation = (obj, language) => {
  if (!obj) return null;
  const translatedValue = obj?.[language];
  const englishValue = obj?.en;

  if (!translatedValue) return null;
  if (language === 'en') return translatedValue;
  if (
    normalizeTranslatedValue(translatedValue) ===
    normalizeTranslatedValue(englishValue)
  ) {
    return null;
  }

  return translatedValue;
};

const hasMeaningfulTranslation = (obj, language) =>
  !!getMeaningfulObjectTranslation(obj, language);

const CATEGORY_LOCALE_PATHS = {
  fragrance: ['filter.fragrance', 'productDetails.fragrance'],
  jewelry: ['jewelry', 'filter.jewels', 'footer.collections_list.jewelry'],
  jewels: ['filter.jewels', 'jewelry'],
  bikini: ['filter.bikini'],
  bikinis: ['bikinis', 'filter.bikini'],
  footwear: ['filter.footwear'],
  sandals: ['sandals', 'shopping.Sandals', 'footer.collections_list.sandals'],
  dress: ['dress', 'filter.dress', 'footer.collections_list.dress'],
  dresses: ['shopping.Dresses', 'productDetails.dresses', 'dress'],
  'swim wear': ['swimWear', 'shopping.Swim Wear', 'footer.collections_list.swim_wear'],
  swimwear: ['swimWear', 'shopping.Swim Wear', 'footer.collections_list.swim_wear'],
  fitness: ['fitness'],
  yoga: ['shopping.Fitness & Yoga', 'productDetails.yoga'],
  'fitness and yoga': [
    'shopping.Fitness & Yoga',
    'footer.collections_list.fitness_yoga',
    'productDetails.yoga',
  ],
};

const EXACT_CATEGORY_TRANSLATIONS = {
  fragrance: {
    ar: 'العطور',
    fr: 'Parfums',
    ru: 'Парфюмерия',
    zh: '香氛',
    es: 'Fragancias',
    ja: 'フレグランス',
    pt: 'Fragrâncias',
    it: 'Fragranze',
    de: 'Düfte',
  },
  'jewellery accessories': {
    ar: 'المجوهرات والإكسسوارات',
    fr: 'Bijoux et accessoires',
    ru: 'Ювелирные изделия и аксессуары',
    zh: '珠宝与配饰',
    es: 'Joyería y accesorios',
    ja: 'ジュエリー＆アクセサリー',
    pt: 'Joias e acessórios',
    it: 'Gioielli e accessori',
    de: 'Schmuck und Accessoires',
  },
  'customize sandals': {
    ar: 'الصنادل المخصصة',
    fr: 'Sandales personnalisées',
    ru: 'Индивидуальные сандалии',
    zh: '定制凉鞋',
    es: 'Sandalias personalizadas',
    ja: 'カスタムサンダル',
    pt: 'Sandálias personalizadas',
    it: 'Sandali personalizzati',
    de: 'Individuelle Sandalen',
  },
  'design bikni swimwear': {
    ar: 'تصميم ملابس السباحة البيكيني',
    fr: 'Maillots de bain bikini design',
    ru: 'Дизайнерские купальники-бикини',
    zh: '设计款比基尼泳装',
    es: 'Bikinis de diseño',
    ja: 'デザインビキニ水着',
    pt: 'Moda praia biquíni de design',
    it: 'Costumi bikini di design',
    de: 'Designer-Bikini-Mode',
  },
  dresses: {
    ar: 'الفساتين',
    fr: 'Robes',
    ru: 'Платья',
    zh: '连衣裙',
    es: 'Vestidos',
    ja: 'ドレス',
    pt: 'Vestidos',
    it: 'Abiti',
    de: 'Kleider',
  },
  'fitness yoga pilate': {
    ar: 'اللياقة البدنية واليوغا والبيلاتس',
    fr: 'Fitness, yoga et pilates',
    ru: 'Фитнес, йога и пилатес',
    zh: '健身、瑜伽和普拉提',
    es: 'Fitness, yoga y pilates',
    ja: 'フィットネス・ヨガ・ピラティス',
    pt: 'Fitness, yoga e pilates',
    it: 'Fitness, yoga e pilates',
    de: 'Fitness, Yoga und Pilates',
  },
  'ponytail hair': {
    ar: 'شعر ذيل الحصان',
    fr: 'Queues de cheval',
    ru: 'Волосы для хвоста',
    zh: '马尾发',
    es: 'Cabello para coleta',
    ja: 'ポニーテールヘア',
    pt: 'Cabelo para rabo de cavalo',
    it: 'Capelli per coda di cavallo',
    de: 'Pferdeschwanz-Haar',
  },
  abayas: {
    ar: 'العبايات',
    fr: 'Abayas',
    ru: 'Абая',
    zh: '长袍',
    es: 'Abayas',
    ja: 'アバヤ',
    pt: 'Abayas',
    it: 'Abaya',
    de: 'Abayas',
  },
  'vase natural sand candle': {
    ar: 'مزهرية وشمعة رملية طبيعية',
    fr: 'Vase et bougie en sable naturel',
    ru: 'Ваза и свеча из натурального песка',
    zh: '花瓶与天然沙蜡烛',
    es: 'Jarrón y vela de arena natural',
    ja: '花瓶とナチュラルサンドキャンドル',
    pt: 'Vaso e vela de areia natural',
    it: 'Vaso e candela di sabbia naturale',
    de: 'Vase und Natur-Sandkerze',
  },
};

const getStaticCategoryTranslation = (name, language) => {
  if (language === 'en') return name;

  const locale = STATIC_LOCALES[language];
  if (!locale || !name) return null;

  const normalized = normalizeCategoryName(name);
  const exactTranslation = EXACT_CATEGORY_TRANSLATIONS[normalized]?.[language];
  if (exactTranslation) return exactTranslation;

  const mappedPaths = CATEGORY_LOCALE_PATHS[normalized];
  if (!mappedPaths) return null;

  return getFirstDefined(locale, mappedPaths) || null;
};

const buildStaticPageContent = (page, language) => {
  if (language === 'en') return TEXT[page];

  const locale = STATIC_LOCALES[language];
  if (!locale) return null;

  if (page === 'common') {
    return {
      ...TEXT.common,
      contactUs:
        getFirstDefined(locale, ['footer.contact_us']) || TEXT.common.contactUs,
      ourStory:
        getFirstDefined(locale, ['footer.our_story']) || TEXT.common.ourStory,
      privacyPolicy:
        getFirstDefined(locale, ['footer.privacy_policy']) ||
        TEXT.common.privacyPolicy,
      refundPolicy:
        getFirstDefined(locale, ['footer.refund_policy']) ||
        TEXT.common.refundPolicy,
      termsAndConditions:
        getFirstDefined(locale, ['footer.terms_conditions']) ||
        TEXT.common.termsAndConditions,
      customerSupport:
        getFirstDefined(locale, ['footer.customer_support']) ||
        TEXT.common.customerSupport,
      explore:
        getFirstDefined(locale, ['explore']) || TEXT.common.explore,
      premium:
        getFirstDefined(locale, ['premium', 'luxuryTitle']) ||
        TEXT.common.premium,
      viewAll:
        getFirstDefined(locale, ['viewAll']) || TEXT.common.viewAll,
      shopNow:
        getFirstDefined(locale, ['shopNow']) || TEXT.common.shopNow,
      comingSoon:
        getFirstDefined(locale, ['comingSoon']) || TEXT.common.comingSoon,
      mmmk:
        getFirstDefined(locale, ['brandName', 'homePage.banner1.title']) ||
        TEXT.common.mmmk,
      buyNow: getFirstDefined(locale, ['buyNow']) || TEXT.common.buyNow,
      allProducts:
        getFirstDefined(locale, ['allProduct', 'allProducts']) ||
        TEXT.common.allProducts,
      enquiry:
        getFirstDefined(locale, ['enquiry']) || TEXT.common.enquiry,
      menu: getFirstDefined(locale, ['menu']) || TEXT.common.menu,
      followUsOn:
        getFirstDefined(locale, ['footer.follow_us_on']) ||
        TEXT.common.followUsOn,
      footerDescription:
        getFirstDefined(locale, ['footer.discover_description']) ||
        TEXT.common.footerDescription,
      mmmkOfficialWebsite:
        getFirstDefined(locale, ['footer.official_website']) ||
        TEXT.common.mmmkOfficialWebsite,
      copyright:
        getFirstDefined(locale, ['footer.copyright']) || TEXT.common.copyright,
      productImageAlt:
        getFirstDefined(locale, ['productImageAlt']) ||
        TEXT.common.productImageAlt,
      collections:
        getFirstDefined(locale, ['collections']) || TEXT.common.collections,
      collection:
        getFirstDefined(locale, ['collection']) || TEXT.common.collection,
      bikini:
        getFirstDefined(locale, ['filter.bikini']) || TEXT.common.bikini,
      newsLetterHeading:
        getFirstDefined(locale, ['newsletterTitle']) ||
        TEXT.common.newsLetterHeading,
      newsLetterDescription:
        getFirstDefined(locale, ['newsletterDescription']) ||
        TEXT.common.newsLetterDescription,
      whatOurInfluencersSay:
        getFirstDefined(locale, ['customerSayingTitle']) ||
        TEXT.common.whatOurInfluencersSay,
      fragrance:
        getFirstDefined(locale, ['productDetails.fragrance', 'filter.fragrance']) ||
        TEXT.common.fragrance,
    };
  }

  if (page === 'homepage') {
    return {
      ...TEXT.homepage,
      section1Heading1:
        getFirstDefined(locale, ['homePage.banner1.subTitle']) ||
        TEXT.homepage.section1Heading1,
      section2Heading1:
        getFirstDefined(locale, ['collections']) || TEXT.homepage.section2Heading1,
      section4Heading1:
        joinTranslated([
          getFirstDefined(locale, ['exclusive']),
          getFirstDefined(locale, ['handmade']),
          getFirstDefined(locale, ['dresses']),
        ]) || TEXT.homepage.section4Heading1,
      section4Heading2:
        joinTranslated([
          getFirstDefined(locale, ['elegance']),
          getFirstDefined(locale, ['comfort']),
          getFirstDefined(locale, ['style']),
        ]) || TEXT.homepage.section4Heading2,
      section4Heading3:
        joinTranslated([
          getFirstDefined(locale, ['exclusive']),
          getFirstDefined(locale, ['jewels']),
          getFirstDefined(locale, ['collection']),
        ]) || TEXT.homepage.section4Heading3,
      section5Heading1:
        getFirstDefined(locale, ['recommendedForYou']) ||
        TEXT.homepage.section5Heading1,
      section6Heading1:
        getFirstDefined(locale, ['festivalSale']) ||
        TEXT.homepage.section6Heading1,
      section6Description1:
        getFirstDefined(locale, ['discount']) ||
        TEXT.homepage.section6Description1,
      section6Heading2:
        getFirstDefined(locale, ['byMmmkWode']) ||
        TEXT.homepage.section6Heading2,
      section7Heading1:
        getFirstDefined(locale, ['shopInstant']) || TEXT.homepage.section7Heading1,
      section8Heading1:
        getFirstDefined(locale, ['productDescription']) ||
        TEXT.homepage.section8Heading1,
      section11Heading1:
        getFirstDefined(locale, ['silkyMuskTitle']) ||
        TEXT.homepage.section11Heading1,
      section11Description1:
        getFirstDefined(locale, ['silkyMuskDescription']) ||
        TEXT.homepage.section11Description1,
      section13Heading1:
        getFirstDefined(locale, ['haveQuestions']) ||
        TEXT.homepage.section13Heading1,
      section14Heading1:
        joinTranslated(getFirstDefined(locale, ['homePage.section11.subTitle']) || []) ||
        TEXT.homepage.section14Heading1,
      section16Heading1:
        getFirstDefined(locale, ['backstage']) || TEXT.homepage.section16Heading1,
      section17Heading1:
        getFirstDefined(locale, ['luxuryTitle']) || TEXT.homepage.section17Heading1,
    };
  }

  if (page === 'contact') {
    return {
      ...TEXT.contact,
      title:
        getFirstDefined(locale, ['contactPage.title']) || TEXT.contact.title,
      subtitle:
        getFirstDefined(locale, ['contactPage.subtitle']) ||
        TEXT.contact.subtitle,
      name:
        getFirstDefined(locale, ['contactPage.name']) || TEXT.contact.name,
      email:
        getFirstDefined(locale, ['contactPage.email']) || TEXT.contact.email,
      phoneCountryCode:
        getFirstDefined(locale, ['contactPage.phoneCountryCode']) ||
        TEXT.contact.phoneCountryCode,
      phoneNumber:
        getFirstDefined(locale, ['contactPage.phoneNumber']) ||
        TEXT.contact.phoneNumber,
      query:
        getFirstDefined(locale, ['contactPage.query']) || TEXT.contact.query,
      namePlaceholder:
        getFirstDefined(locale, ['contactPage.namePlaceholder']) ||
        TEXT.contact.namePlaceholder,
      emailPlaceholder:
        getFirstDefined(locale, ['contactPage.emailPlaceholder']) ||
        TEXT.contact.emailPlaceholder,
      phoneNumberPlaceholder:
        getFirstDefined(locale, ['contactPage.phoneNumberPlaceholder']) ||
        TEXT.contact.phoneNumberPlaceholder,
      queryPlaceholder:
        getFirstDefined(locale, ['contactPage.queryPlaceholder']) ||
        TEXT.contact.queryPlaceholder,
      countryCodePlaceholder:
        getFirstDefined(locale, ['contactPage.countryCodePlaceholder']) ||
        TEXT.contact.countryCodePlaceholder,
      submitSuccess:
        getFirstDefined(locale, ['contactPage.submitSuccess']) ||
        TEXT.contact.submitSuccess,
      submitError:
        getFirstDefined(locale, ['contactPage.submitError']) ||
        TEXT.contact.submitError,
      requiredName:
        getFirstDefined(locale, ['contactPage.requiredName']) ||
        TEXT.contact.requiredName,
      requiredEmail:
        getFirstDefined(locale, ['contactPage.requiredEmail']) ||
        TEXT.contact.requiredEmail,
      requiredPhoneCode:
        getFirstDefined(locale, ['contactPage.requiredPhoneCode']) ||
        TEXT.contact.requiredPhoneCode,
      requiredPhoneNumber:
        getFirstDefined(locale, ['contactPage.requiredPhoneNumber']) ||
        TEXT.contact.requiredPhoneNumber,
      requiredQuery:
        getFirstDefined(locale, ['contactPage.requiredQuery']) ||
        TEXT.contact.requiredQuery,
    };
  }

  return null;
};

export async function translateText(text, toLang = 'en', fromLang = 'en') {
  if (!text || typeof text !== 'string') return text;
  if (toLang === fromLang) return text;
  if (!LIBRE_TRANSLATE_ENDPOINT) return text;
  const url = `${LIBRE_TRANSLATE_ENDPOINT}/translate`;

  const body = {
    q: text,
    source: fromLang,
    target: toLang,
  };

  const response = await axios.post(url, body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data.translatedText;
}

export async function translate(textArray, toLang = 'en', fromLang = 'en') {
  if (toLang === fromLang) return textArray;
  if (!LIBRE_TRANSLATE_ENDPOINT) return textArray;
  const url = `${LIBRE_TRANSLATE_ENDPOINT}/translate`;

  const promises = textArray.map((text) => {
    const body = {
      q: text,
      source: fromLang,
      target: toLang,
    };
    return axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  const responses = await Promise.all(promises);

  return responses.map((response) => response.data.translatedText);
}

export const getTranslateProducts = async (
  list,
  language,
  fields = ['productName']
) => {
  const newList = [];
  if (!list || !list.length) return newList;

  for (const item of list) {
    const translated = {};
    for (const field of fields) {
      if (item[field]) {
        switch (typeof item[field]) {
          case 'object':
            if (item[field][language]) {
              translated[field] = item[field][language];
            } else {
              translated[field] = await translateText(
                item[field].en || item[field].fr,
                language
              );
            }
            break;
          case 'string':
            translated[field] = await translateText(item[field], language);
            break;
        }
      }
    }
    newList.push({ ...item, translated });
  }

  return newList;
};

const TranslationProvider = ({ children }) => {
  const [utils, setUtils] = useState({
    isTranslating: false,
    content: TEXT,
    contentInLanguage: Object.keys(TEXT).reduce((acc, key) => {
      acc[key] = { en: TEXT[key] };
      return acc;
    }, {}),
    translateLanguage: 'en',
  });
  const updateUtils = (newUtils) => {
    setUtils((prev) => {
      const updated = { ...prev, ...newUtils };

      if (newUtils.translateLanguage) {
        localStorage.setItem('translateLanguage', newUtils.translateLanguage);
      }

      return updated;
    });
  };

  const { pathname } = useLocation();

  const { categories, recommendedProducts, updateGlobalContext } =
    useGlobalContext();

  const translateDynamicData = async ({
    name,
    data,
    fieldToTranslate = '',
    language,
  }) => {
    const objs = data.map((item) => item[fieldToTranslate]);
    const translatedItemNames = [];
    for (const item of objs) {
      const existingTranslation = getMeaningfulObjectTranslation(item, language);
      const staticCategoryTranslation =
        name === 'categories' && fieldToTranslate === 'name'
          ? getStaticCategoryTranslation(item?.en, language)
          : null;

      const newTranslated =
        existingTranslation ||
        staticCategoryTranslation ||
        (await translateText(item.en, language));
      translatedItemNames.push(newTranslated);
    }
    const translatedItems = data.map((item, index) => ({
      ...item,
      nameInLanguage: {
        ...(item.nameInLanguage || {}),
        [language]:
          translatedItemNames[index] ||
          (Array.isArray(fieldToTranslate)
            ? fieldToTranslate.reduce((acc, field) => acc[field], item)
            : item[fieldToTranslate]?.[language] ||
              item[fieldToTranslate]?.en ||
              item[fieldToTranslate]),
      },
    }));
    updateGlobalContext({ [name]: translatedItems });
  };

  useEffect(() => {
    if (
      categories?.length > 0 &&
      !hasMeaningfulTranslation(
        categories[0]?.nameInLanguage,
        utils.translateLanguage
      )
    ) {
      translateDynamicData({
        data: categories,
        name: 'categories',
        language: utils.translateLanguage,
        fieldToTranslate: 'name',
      });
    }
    if (
      recommendedProducts?.length > 0 &&
      !hasMeaningfulTranslation(
        recommendedProducts[0]?.nameInLanguage,
        utils.translateLanguage
      )
    ) {
      translateDynamicData({
        data: recommendedProducts,
        name: 'recommendedProducts',
        language: utils.translateLanguage,
        fieldToTranslate: 'productName',
      });
    }
  }, [utils.translateLanguage, categories, recommendedProducts]);

  const translatePages = async (pages, language) => {
    const nextContent = { ...utils.content };
    const nextContentInLanguage = { ...utils.contentInLanguage };

    for (const page of pages) {
      const cachedPage = utils.contentInLanguage?.[page]?.[language];
      if (cachedPage) {
        nextContent[page] = cachedPage;
        continue;
      }

      const staticPageContent = buildStaticPageContent(page, language);
      if (staticPageContent) {
        nextContent[page] = staticPageContent;
        nextContentInLanguage[page] = {
          ...nextContentInLanguage[page],
          [language]: staticPageContent,
        };
        continue;
      }

      try {
        const translated = await translate(Object.values(TEXT[page]), language);
        const pageContent = Object.fromEntries(
          Object.keys(TEXT[page]).map((key, index) => [key, translated[index]])
        );
        nextContent[page] = pageContent;
        nextContentInLanguage[page] = {
          ...nextContentInLanguage[page],
          [language]: pageContent,
        };
      } catch (error) {
        console.error(`Failed to translate ${page} for ${language}:`, error);
        nextContent[page] = TEXT[page];
      }
    }

    updateUtils({
      content: nextContent,
      contentInLanguage: nextContentInLanguage,
      isTranslating: false,
    });
  };

  useEffect(() => {
    if (utils.translateLanguage && i18n.language !== utils.translateLanguage) {
      i18n.changeLanguage(utils.translateLanguage);
    }
  }, [utils.translateLanguage]);

  useEffect(() => {
    if (utils.translateLanguage) {
      const pagesToTranslate = [];
      const page = pagesWithKeys[pathname];
      if (page) {
        pagesToTranslate.push(page);
      } else {
        if (pathname.startsWith('/product-details/'))
          pagesToTranslate.push('productDetails');
        if (
          pathname.startsWith('/thank-you') ||
          pathname.startsWith('/order-success')
        )
          pagesToTranslate.push('thankYou');
        if (pathname.startsWith('/reset-password'))
          pagesToTranslate.push('forgotPasswordPage');
        if (pathname.startsWith('/profile/')) {
          pagesToTranslate.push('profile');
        }
      }
      pagesToTranslate.push('common');
      translatePages(pagesToTranslate, utils.translateLanguage);
    }
  }, [utils.translateLanguage, pathname]);

  useLayoutEffect(() => {
    const getLanguageFromBrowser = () => {
      try {
        const browserLanguage = navigator.language || navigator.userLanguage;
        const languageCode = browserLanguage.split('-')[0];

        const detectedLanguage = LANGUAGECODES.includes(languageCode)
          ? languageCode
          : 'en';

        updateUtils({ translateLanguage: detectedLanguage });
      } catch (error) {
        console.error('Error detecting browser language:', error);
        updateUtils({ translateLanguage: 'en' });
      }
    };

    const savedLanguage = localStorage.getItem('translateLanguage');
    if (savedLanguage) {
      updateUtils({ translateLanguage: savedLanguage });
    } else {
      getLanguageFromBrowser();
    }
  }, []);

  return (
    <TranslationContext.Provider
      value={{
        ...utils,
        translatePages,
        updateTranslationContext: updateUtils,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

const useTranslationContext = () => {
  return useContext(TranslationContext);
};

export { useTranslationContext, TranslationProvider };

const pagesWithKeys = {
  '/': 'homepage',
  '/shopping-cart': 'cart',
  '/checkout': 'checkout',
  '/contact-us': 'contact',
  '/order-success': 'thankYou',
  '/auth': 'auth',
  '/forgot-password': 'forgotPasswordPage',
  '/gift-cards': 'giftCard',
  '/gift-cards/buy': 'buyGiftCard',
};
