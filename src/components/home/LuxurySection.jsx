import { Button4 } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';

const LuxurySection = () => {
  const {
    content: { common, homepage },
  } = useTranslationContext();

  return (
    <div
      className="relative flex items-center justify-center h-screen px-4 bg-center bg-cover sm:px-8"
      style={{
        backgroundImage: `url("/luxurySectionImage.jpg")`,
      }}
    >
      {/* Logo Section */}
      <div className="absolute top-4 left-4 sm:left-8">
        <img
          src="/Wode Logo.png"
          alt={common.mmmk}
          className="w-24 h-24 sm:w-32 sm:h-32"
        />
      </div>

      {/* Content Section */}
      <div className="px-4 space-y-4 text-center text-white">
        <p className="text-sm font-light tracking-widest sm:text-base sm:mr-7">
          {common.mmmk}
        </p>
        <h2 className="text-3xl font-medium leading-tight uppercase sm:text-4xl md:text-5xl space-y-8">
          {homepage.section14Heading1}
        </h2>

        <Button4 isLink to="/product-listings">
          {common.shopNow}
        </Button4>
      </div>
    </div>
  );
};

export default LuxurySection;
