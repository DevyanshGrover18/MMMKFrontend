import { TbGiftCard, TbGiftCardFilled, TbMenu } from 'react-icons/tb';
import Container from './Container';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MenuDrawer from './MenuDrawer';
import { BsMinecartLoaded } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import { IoSearchSharp } from 'react-icons/io5';
import { useCart } from '../../context/CartProvider';
import SearchDrawer from './SearchDrawer';
import { useTranslationContext } from '../../context/TranslationContext';
import { LANGUAGES } from '../../utils/staticData';

export default function Navbar({}) {
  const {
    translateLanguage,
    content: { common },
    updateTranslationContext,
  } = useTranslationContext();
  const { data } = useCart();
  const [utils, setUtils] = useState({
    isMenuOpen: false,
    isSearchOpen: false,
    isListOpen: false,
  });

  const updateUtils = (newUtils) =>
    setUtils((prev) => ({ ...prev, ...newUtils }));

  useEffect(() => {
    if (!translateLanguage) {
      updateTranslationContext({ translateLanguage: 'en' });
      document.dir = 'ltr';
    } else {
      document.dir = translateLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, [translateLanguage]);

  const changeLanguage = (lng) => {
    document.dir = lng === 'ar' ? 'rtl' : 'ltr';
    updateTranslationContext({ translateLanguage: lng });
  };

  return (
    <>
      <MenuDrawer
        isOpen={utils.isMenuOpen}
        onClose={() => updateUtils({ isMenuOpen: false })}
      />
      <SearchDrawer
        isOpen={utils.isSearchOpen}
        onClose={() => updateUtils({ isSearchOpen: false })}
      />
      <Container>
        <div className="w-full flex justify-between items-center py-4 relative bottom-10 z-8">
          {/* left - Menu */}
          <button
            className="flex items-center gap-4 text-md sm:mx-4 md:mx-8 lg:mx-14"
            onClick={() => updateUtils({ isMenuOpen: true })}
          >
            <TbMenu className="w-6 h-8" />
            <span className="hidden sm:block">{common.menu}</span>
          </button>

          {/* center - Logo */}
          <div className="absolute mt-56 transform -translate-x-1/2 md:mt-0 left-1/2 sm:mt-10">
            <Link to={'/'}>
              <img
                src="/Wode Logo.png"
                className="w-32 h-32 md:-mb-20 sm:w-48 sm:h-48"
              />
            </Link>
          </div>

          {/* right - Icons */}
          <div className="flex items-center gap-6 text-3rd">
            <select
              className="text-white bg-transparent text-sm tracking-widest"
              value={translateLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="text-black"
                >
                  {lang.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => updateUtils({ isSearchOpen: true })}
              className="flex items-center text-sm text-white bg-transparent outline-none mb-2"
            >
              <IoSearchSharp size={17} className="text-white" />
            </button>
            <Link
              to={'/gift-cards'}
              className="flex items-center text-sm text-white bg-transparent outline-none"
            >
              <TbGiftCardFilled size={24} className="text-white" />
            </Link>
            <Link to={'/profile/my-account'}>
              <FaUser size={17} className="text-white" />
            </Link>
            <span className="relative">
              <Link to={'/shopping-cart'}>
                {data?.length === 0 ? null : (
                  <span className="absolute right-[-20px] text-sm bg-red-500 rounded-full w-8 h-18 flex items-center justify-center">
                    {data?.length}
                  </span>
                )}

                <BsMinecartLoaded size={17} className="text-white" />
              </Link>
            </span>
          </div>
        </div>
      </Container>
    </>
  );
}
