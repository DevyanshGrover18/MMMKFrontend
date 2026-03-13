import React, { useState } from 'react';
import { createContext, useContext } from 'react';

const adminAuthContext = createContext();

const AdminAuthProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    if (localStorage.getItem('adminAuthToken')) {
      return JSON.parse(localStorage.getItem('adminAuthToken'));
    }
    return {};
  });
  return (
    <adminAuthContext.Provider value={{ data, setData }}>
      {children}
    </adminAuthContext.Provider>
  );
};

export const useAdminAuthContext = () => {
  return useContext(adminAuthContext);
};

export default AdminAuthProvider;
