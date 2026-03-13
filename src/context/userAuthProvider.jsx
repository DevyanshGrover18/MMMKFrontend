import React, { useState } from 'react';
import { createContext, useContext } from 'react';

const userAuthContext = createContext();

const UserAuthProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    if (localStorage.getItem('userToken')) {
      return JSON.parse(localStorage.getItem('userToken'));
    }
    return {};
  });
  return (
    <userAuthContext.Provider value={{ data, setData }}>
      {children}
    </userAuthContext.Provider>
  );
};

export const useUserAuthContext = () => {
  return useContext(userAuthContext);
};

export default UserAuthProvider;
