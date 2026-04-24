import { createAdminApiClient } from './client';

const SHARED_UPLOAD_BASE_URL = (
  import.meta.env.VITE_SHARED_UPLOAD_BASE_URL ||
  'https://node.projects.codenap.in/mmk'
).replace(/\/$/, '');

const uploadApi = createAdminApiClient(
  `${SHARED_UPLOAD_BASE_URL}/api/v1/admin/upload`,
  30000
);

export const uploadAdminFiles = async (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file) => {
    if (file) {
      formData.append('files', file);
    }
  });

  const response = await uploadApi.post('/images', formData);
  return response?.data?.data?.files || [];
};

export const uploadSingleAdminFile = async (file) => {
  const [uploadedFile] = await uploadAdminFiles(file ? [file] : []);
  return uploadedFile || null;
};
