import { TranslationProvider } from '../context/TranslationContext';
import { Outlet } from 'react-router-dom';
import Seo from '../components/global/Seo';

const RootLayout = () => {
  return (
    <TranslationProvider>
      <Seo />
      <Outlet />
    </TranslationProvider>
  );
};

export default RootLayout;
