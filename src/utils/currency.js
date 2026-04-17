const STORAGE_KEY = 'siteCurrency';
const STORAGE_MODE_KEY = 'siteCurrencyMode';

export const BASE_CURRENCY_CODE = 'USD';

export const CURRENCY_CONFIG = {
  USD: { code: 'USD', symbol: '$', rate: 1, name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, name: 'Pound Sterling' },
  CNY: { code: 'CNY', symbol: 'CN¥', rate: 7.24, name: 'Chinese Yuan' },
  MXN: { code: 'MXN', symbol: 'MX$', rate: 16.8, name: 'Mexican Peso' },
  AED: { code: 'AED', symbol: 'د.إ', rate: 3.67, name: 'UAE Dirham' },
  RUB: { code: 'RUB', symbol: '₽', rate: 92, name: 'Russian Ruble' },
  INR: { code: 'INR', symbol: '₹', rate: 83, name: 'Indian Rupee' },
};

const COUNTRY_TO_CURRENCY = {
  US: 'USD',
  PR: 'USD',
  GU: 'USD',
  VI: 'USD',
  GB: 'GBP',
  IE: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  PT: 'EUR',
  AT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  LU: 'EUR',
  CY: 'EUR',
  MT: 'EUR',
  CN: 'CNY',
  HK: 'CNY',
  MO: 'CNY',
  MX: 'MXN',
  AE: 'AED',
  RU: 'RUB',
  IN: 'INR',
};

const LANGUAGE_TO_CURRENCY = {
  de: 'EUR',
  en: 'USD',
  es: 'EUR',
  fr: 'EUR',
  it: 'EUR',
  pt: 'EUR',
  ru: 'RUB',
  zh: 'CNY',
  ar: 'AED',
  hi: 'INR',
};

const TIMEZONE_TO_CURRENCY = {
  'America/New_York': 'USD',
  'America/Chicago': 'USD',
  'America/Denver': 'USD',
  'America/Los_Angeles': 'USD',
  'Europe/London': 'GBP',
  'Europe/Dublin': 'EUR',
  'Europe/Paris': 'EUR',
  'Europe/Berlin': 'EUR',
  'Europe/Madrid': 'EUR',
  'Europe/Rome': 'EUR',
  'Europe/Amsterdam': 'EUR',
  'Europe/Brussels': 'EUR',
  'Europe/Vienna': 'EUR',
  'Europe/Athens': 'EUR',
  'Europe/Moscow': 'RUB',
  'Asia/Dubai': 'AED',
  'Asia/Kolkata': 'INR',
  'Asia/Shanghai': 'CNY',
  'Asia/Hong_Kong': 'CNY',
  'Asia/Macau': 'CNY',
  'Asia/Beirut': 'EUR',
  'America/Mexico_City': 'MXN',
  'America/Cancun': 'MXN',
};

const normalizeCurrencyCode = (value) => {
  const code = String(value || '').trim().toUpperCase();
  return CURRENCY_CONFIG[code] ? code : BASE_CURRENCY_CODE;
};

const getBrowserRegion = () => {
  if (typeof navigator !== 'undefined') {
    const locale = navigator.language || navigator.languages?.[0] || '';
    const localeMatch = String(locale).match(/-([A-Z]{2})$/i);
    if (localeMatch?.[1]) {
      return localeMatch[1].toUpperCase();
    }
  }

  return '';
};

const getBrowserLanguage = () => {
  if (typeof navigator !== 'undefined') {
    const locale = navigator.language || navigator.languages?.[0] || '';
    const normalized = String(locale).split('-')[0].trim().toLowerCase();
    return normalized || '';
  }

  return '';
};

const detectCurrencyCodeFromEnvironment = () => {
  if (typeof Intl !== 'undefined') {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone && TIMEZONE_TO_CURRENCY[timezone]) {
      return TIMEZONE_TO_CURRENCY[timezone];
    }
  }

  const region = getBrowserRegion();
  if (region && COUNTRY_TO_CURRENCY[region]) {
    return COUNTRY_TO_CURRENCY[region];
  }

  const language = getBrowserLanguage();
  if (language && LANGUAGE_TO_CURRENCY[language]) {
    return LANGUAGE_TO_CURRENCY[language];
  }

  return BASE_CURRENCY_CODE;
};

export const resolveCurrencyCode = (preferredCode) => {
  const storedCode =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_KEY)
      : '';
  const storedMode =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_MODE_KEY)
      : '';

  if (preferredCode) {
    return normalizeCurrencyCode(preferredCode);
  }

  if (storedMode === 'manual' && storedCode) {
    return normalizeCurrencyCode(storedCode);
  }

  return normalizeCurrencyCode(detectCurrencyCodeFromEnvironment());
};

export const getCurrencyConfig = (currencyCode) => {
  const code = resolveCurrencyCode(currencyCode);
  return CURRENCY_CONFIG[code] || CURRENCY_CONFIG[BASE_CURRENCY_CODE];
};

export const convertAmount = (amount, currencyCode) => {
  const numericAmount = Number(amount || 0);
  const { rate } = getCurrencyConfig(currencyCode);
  return Number((numericAmount * rate).toFixed(2));
};

export const formatCurrency = (amount, currencyCode) => {
  const { symbol } = getCurrencyConfig(currencyCode);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

  return `${symbol} ${formatted}`;
};

export const persistCurrencyCode = (currencyCode) => {
  if (typeof window === 'undefined') return resolveCurrencyCode(currencyCode);
  const normalized = resolveCurrencyCode(currencyCode);
  window.localStorage.setItem(STORAGE_KEY, normalized);
  return normalized;
};

export const persistManualCurrencyCode = (currencyCode) => {
  if (typeof window === 'undefined') return resolveCurrencyCode(currencyCode);
  const normalized = normalizeCurrencyCode(currencyCode);
  window.localStorage.setItem(STORAGE_KEY, normalized);
  window.localStorage.setItem(STORAGE_MODE_KEY, 'manual');
  return normalized;
};

export const clearManualCurrencyOverride = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_MODE_KEY);
};
