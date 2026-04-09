export const getStoredUserAuth = () => {
  try {
    const stored = localStorage.getItem('userToken');
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getStoredUserToken = () => {
  const auth = getStoredUserAuth();

  return (
    auth?.token ||
    auth?.accessToken ||
    auth?.jwt ||
    auth?.data?.token ||
    auth?.data?.accessToken ||
    null
  );
};

export const getStoredUserId = () => {
  const auth = getStoredUserAuth();

  return auth?.id || auth?._id || auth?.userId || auth?.user?.id || auth?.user?._id || null;
};

export const normalizeUserAuthPayload = (payload) => {
  const source = payload?.data && typeof payload.data === 'object' ? payload.data : payload;
  const user = source?.user && typeof source.user === 'object' ? source.user : {};

  const token =
    source?.token ||
    source?.accessToken ||
    source?.jwt ||
    user?.token ||
    user?.accessToken ||
    null;

  const id =
    source?.id ||
    source?._id ||
    source?.userId ||
    user?.id ||
    user?._id ||
    null;

  return {
    ...source,
    ...user,
    ...(token ? { token } : {}),
    ...(id ? { id } : {}),
  };
};
