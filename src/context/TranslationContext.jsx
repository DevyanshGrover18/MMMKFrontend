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

const TranslationContext = createContext(null);

const LIBRE_TRANSLATE_ENDPOINT = import.meta.env.VITE_LIBRE_TRANSLATE_ENDPOINT;

export async function translateText(text, toLang = 'en', fromLang = 'en') {
  if (!text || typeof text !== 'string') return text;
  if (toLang === fromLang) return text;
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

      console.log(newUtils);

      // Save language preference to localStorage
      if (newUtils.translateLanguage) {
        localStorage.setItem('translateLanguage', newUtils.translateLanguage);
      }

      return updated;
    });
  };

  const { pathname } = useLocation();

  const { categories, recommendedProducts, updateGlobalContext } =
    useGlobalContext();

  console.log(categories);

  const translateDynamicData = async ({
    name,
    data,
    fieldToTranslate = '',
    language,
  }) => {
    const objs = data.map((item) => item[fieldToTranslate]);
    const translatedItemNames = [];
    console.log(objs, language);
    for (const item of objs) {
      console.log(item, language);
      const newTranslated =
        item[language] || (await translateText(item.en, language));
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
      !categories[0]?.nameInLanguage?.[utils.translateLanguage]
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
      !recommendedProducts[0]?.nameInLanguage?.[utils.translateLanguage]
    ) {
      translateDynamicData({
        data: recommendedProducts,
        name: 'recommendedProducts',
        language: utils.translateLanguage,
        fieldToTranslate: 'productName',
      });
    }
  }, [utils.translateLanguage, categories, recommendedProducts]);

  // console.log(utils.content);

  const translatePages = async (pages, language) => {
    const content = utils.content;
    const contentInLanguage = utils.contentInLanguage;
    for (const page of pages) {
      console.log(
        page,
        language,
        !!utils.contentInLanguage?.[page]?.[language]
      );
      if (utils.contentInLanguage?.[page]?.[language]) {
        content[page] = utils.contentInLanguage[page][language];
      } else {
        const translated = await translate(Object.values(TEXT[page]), language);
        const pageContent = Object.fromEntries(
          Object.keys(TEXT[page]).map((key, index) => [key, translated[index]])
        );
        content[page] = pageContent;
        contentInLanguage[page] = {
          ...contentInLanguage[page],
          [language]: pageContent,
        };
      }
    }
    updateUtils({
      content,
      contentInLanguage,
      isTranslating: false,
    });
  };

  console.log(pathname);

  useEffect(() => {
    if (utils.translateLanguage) {
      const pagesToTranslate = [];
      let page = pagesWithKeys[pathname];
      if (page) {
        pagesToTranslate.push(page);
        // translatePage(page, utils.translateLanguage, utils);
      } else {
        if (pathname.startsWith('/product-details/'))
          pagesToTranslate.push('productDetails');
        if (pathname.startsWith('/thank-you'))
          pagesToTranslate.push('thankYou');
        if (pathname.startsWith('/reset-password'))
          pagesToTranslate.push('forgotPasswordPage');
        if (pathname.startsWith('/profile/')) {
          pagesToTranslate.push('profile');
        }
      }
      pagesToTranslate.push('common');
      // translatePage("common", utils.translateLanguage, utils);
      translatePages(pagesToTranslate, utils.translateLanguage);
    }
  }, [utils.translateLanguage, pathname]);

  useLayoutEffect(() => {
    // get translate language based on browser language
    const getLanguageFromBrowser = () => {
      try {
        // Get language from browser locale
        const browserLanguage = navigator.language || navigator.userLanguage;
        const languageCode = browserLanguage.split('-')[0]; // Get just the language code (e.g., 'en' from 'en-US')

        const detectedLanguage = LANGUAGECODES.includes(languageCode)
          ? languageCode
          : 'en';

        updateUtils({ translateLanguage: detectedLanguage });
      } catch (error) {
        console.error('Error detecting browser language:', error);
        updateUtils({ translateLanguage: 'en' }); // Fallback to English
      }
    };

    // Check if language is already set in localStorage
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
  '/auth': 'auth',
  '/forgot-password': 'forgotPasswordPage',
  '/gift-cards': 'giftCard',
  '/gift-cards/buy': 'buyGiftCard',
};
