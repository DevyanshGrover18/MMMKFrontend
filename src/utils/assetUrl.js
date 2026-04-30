const ASSET_BASE_URL = (import.meta.env.VITE_IMAGE_URL || '').replace(/\/$/, '');
const DEPLOYED_UPLOADS_BASE_URL =
  import.meta.env.VITE_PUBLIC_UPLOAD_BASE_URL ||
  'https://node.projects.codenap.in/mmk/uploads';

const shouldRewriteAbsoluteUrl = (value) => {
  try {
    const parsedUrl = new URL(value);
    const host = parsedUrl.hostname.toLowerCase();

    return (
      parsedUrl.pathname.includes('/uploads/') &&
      (host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '0.0.0.0' ||
        host.endsWith('.local'))
    );
  } catch {
    return false;
  }
};

export const isAbsoluteAssetUrl = (value = '') =>
  /^(?:https?:)?\/\//i.test(value) ||
  value.startsWith('data:') ||
  value.startsWith('blob:');

export const resolveAssetUrl = (value = '') => {
  if (!value) return '';
  if (isAbsoluteAssetUrl(value)) {
    if (shouldRewriteAbsoluteUrl(value)) {
      const normalizedValue = String(value)
        .split('/uploads/')
        .pop()
        ?.replace(/^\/+/, '');

      return normalizedValue
        ? `${DEPLOYED_UPLOADS_BASE_URL.replace(/\/$/, '')}/${normalizedValue}`
        : value;
    }

    return value;
  }

  const normalizedValue = String(value).replace(/^\/+/, '');
  return ASSET_BASE_URL
    ? `${ASSET_BASE_URL}/${normalizedValue}`
    : `/${normalizedValue}`;
};
