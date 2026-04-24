const ASSET_BASE_URL = (import.meta.env.VITE_IMAGE_URL || '').replace(/\/$/, '');

export const isAbsoluteAssetUrl = (value = '') =>
  /^(?:https?:)?\/\//i.test(value) ||
  value.startsWith('data:') ||
  value.startsWith('blob:');

export const resolveAssetUrl = (value = '') => {
  if (!value) return '';
  if (isAbsoluteAssetUrl(value)) return value;

  const normalizedValue = String(value).replace(/^\/+/, '');
  return ASSET_BASE_URL
    ? `${ASSET_BASE_URL}/${normalizedValue}`
    : `/${normalizedValue}`;
};
