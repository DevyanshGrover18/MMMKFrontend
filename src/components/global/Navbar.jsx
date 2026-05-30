import { TbGiftCard, TbGiftCardFilled, TbMenu } from 'react-icons/tb';
import Container from './Container';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MenuDrawer from './MenuDrawer';
import { BsMinecartLoaded } from 'react-icons/bs';
import { FaHeart, FaUser } from 'react-icons/fa';
import { IoSearchSharp } from 'react-icons/io5';
import { useCart } from '../../context/CartProvider';
import SearchDrawer from './SearchDrawer';
import { useTranslationContext } from '../../context/TranslationContext';
import LanguageDropdown from './LanguageDropdown';
import CurrencyDropdown from './CurrencyDropdown';

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
            type="button"
            className="flex items-center gap-4 text-md sm:mx-4 md:mx-8 lg:mx-14"
            onClick={() => updateUtils({ isMenuOpen: true })}
            aria-label={common.menu}
          >
            <TbMenu className="w-6 h-8" />
            <span className="hidden sm:block">{common.menu}</span>
          </button>

          {/* center - Logo */}
          <div className="absolute mt-56 transform -translate-x-1/2 md:mt-0 left-1/2 sm:mt-10">
            <Link to={'/'} aria-label={common.mmmk}>
              <img
                src="/Wode Logo.png"
                alt={common.mmmk}
                width="192"
                height="192"
                decoding="async"
                className="w-32 h-32 md:-mb-20 sm:w-48 sm:h-48"
              />
            </Link>
          </div>

          {/* right - Icons */}
          <div className="flex items-center gap-6 text-3rd">
            <div className="flex items-center gap-4">
              <LanguageDropdown />
              <CurrencyDropdown />
            </div>

            <button
              onClick={() => updateUtils({ isSearchOpen: true })}
              type="button"
              className="flex items-center text-sm text-white bg-transparent outline-none mb-2"
              aria-label={common.search || 'Search'}
            >
              <IoSearchSharp size={17} className="text-white" />
            </button>
            <Link
              to={'/gift-cards'}
              className="flex items-center text-sm text-white bg-transparent outline-none"
              aria-label={common.giftCards || 'Gift cards'}
            >
              <TbGiftCardFilled size={24} className="text-white" />
            </Link>
            <Link
              to={'/profile/saved-items'}
              aria-label={common.savedItems || 'Saved items'}
            >
              <FaHeart />
            </Link>
            <Link
              to={'/profile/my-account'}
              aria-label={common.myAccount || 'My account'}
            >
              <FaUser size={17} className="text-white" />
            </Link>
            <span className="relative">
              <Link
                to={'/shopping-cart'}
                aria-label={common.shoppingCart || 'Shopping cart'}
              >
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
