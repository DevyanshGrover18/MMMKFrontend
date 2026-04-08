import bgImg from '../assets/bg.png';
import { Instagram } from 'lucide-react';
import { FaSnapchat } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { FaTiktok } from 'react-icons/fa';
import { useTranslationContext } from '../context/TranslationContext';
import { useGlobalContext } from '../context/GlobalProvider';
import { getUrl } from '../utils/globalMethods';
import { getCategoryLabel } from '../utils/categoryTranslation';

const Footer = () => {
  const {
    translateLanguage,
    content: { common },
  } = useTranslationContext();
  const { categories } = useGlobalContext();
  const isRTL = translateLanguage === 'ar';
  return (
    <footer
        className={`relative bg-black text-white pt-12 md:pt-[100px] ${
          isRTL ? 'rtl' : 'ltr'
        }`}
      >
        {/* Background Overlay */}
        <div
          className="absolute inset-0 bg-black opacity-20"
          style={{
            background: `url(${bgImg})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        ></div>

        {/* Content */}
        <div className="container relative px-4 mx-auto max-w-[1400px] sm:px-6 lg:px-8 ">
          {/* Top Section */}
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:gap-20">
            {/* Collections Section (Left) */}
            <div
              className={`w-full text-center md:w-1/3 md:text-left ${
                isRTL ? 'text-right' : ''
              }`}
            >
              <h3 className="mb-4 text-base font-semibold uppercase md:text-xl">
                {common.collections}
              </h3>
              <ul className="space-y-6 text-sm cursor-pointer md:text-lg sm:text-xl">
                {categories.map((category) => (
                  <li key={category._id}>
                    <Link
                      className="hover:underline"
                      to={`/product-listings?categories=${getUrl(
                        category.name.en
                      )}`}
                    >
                      {getCategoryLabel(category, translateLanguage)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Logo and Description Section (Center) */}
            <div className="flex flex-col items-center justify-center w-full text-center md:w-1/3">
              <div className="py-10">
                <h3 className="mb-4 font-semibold uppercase md:text-2xl">
                  {common.followUsOn}
                </h3>
                <div className="flex justify-center gap-6 mb-6 text-4xl cursor-pointer sm:text-5xl">
                  <span className="w-10 h-10 text-black bg-white rounded-md hover:bg-yellow-300 hover:text-white">
                    <a href="https://www.instagram.com/mmmk_wode?igsh=MXRvbWZhOGJ6dXVyNA==">
                      <FaSnapchat className="w-6 h-6 mt-2 ml-2 mr-2" />
                    </a>
                  </span>
                  <span className="w-10 h-10 text-black bg-white rounded-md hover:text-white hover:bg-blue-800">
                    <a
                      href="https://www.instagram.com/mmmk_wode?igsh=MXRvbWZhOGJ6dXVyNA=="
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="w-6 h-6 mt-2 ml-2 mr-2" />
                    </a>
                  </span>
                  <span className="w-10 h-10 text-black bg-white rounded-md hover:text-white hover:bg-violet-800">
                    <a
                      href="https://www.instagram.com/mmmk_wode?igsh=MXRvbWZhOGJ6dXVyNA=="
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaTiktok className="w-6 h-6 mt-2 ml-2 mr-2" />
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src="/Wode Logo.png"
                    className="w-32 h-32 mx-auto md:h-48 md:w-48"
                  />
                  <img
                    src="/africanFalcon.jpg"
                    alt={common.productImageAlt}
                    className="object-contain w-30 rounded-full h-30 md:w-44 md:h-44"
                  />
                </div>
                <p className="mt-6 text-sm leading-relaxed text-center md:text-base">
                  {common.footerDescription}
                </p>
              </div>
            </div>

            {/* MMMK WOOD Section (Right) */}
            <div
              className={`w-full text-center md:w-1/3 md:text-right ${
                isRTL ? 'text-right' : ''
              }`}
            >
              <h3 className="mb-4 text-base font-semibold uppercase md:text-xl md:text-right">
                {common.mmmk}
              </h3>
              <ul className="space-y-6 text-sm cursor-pointer md:text-lg sm:text-xl md:text-right">
                <li>
                  <Link to="/contact-us" className="hover:underline">
                    {common.contactUs}
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="hover:underline">
                    {common.ourStory}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:underline">
                    {common.privacyPolicy}
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:underline">
                    {common.refundPolicy}
                  </Link>
                </li>
                <li>
                  <Link to="/terms-conditions" className="hover:underline">
                    {common.termsAndConditions}
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="hover:underline">
                    {common.customerSupport}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col items-center justify-between py-10 mt-4 text-center border-t border-white md:mt-8 md:flex-row">
            <p className="text-sm md:text-lg"> {common.mmmkOfficialWebsite}</p>
            <p className="mt-4 text-xs md:text-lg md:mt-0">
              {common.copyright}
            </p>
          </div>
        </div>
      </footer>
  );
};

export default Footer;
