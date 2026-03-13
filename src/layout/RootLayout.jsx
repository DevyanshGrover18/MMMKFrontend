import { TranslationProvider } from '../context/TranslationContext';
import { Outlet } from 'react-router-dom';

const RootLayout = () => {
  return (
    <TranslationProvider>
      <Outlet />
    </TranslationProvider>
  );
};

export default RootLayout;
