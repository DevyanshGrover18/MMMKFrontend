import { useTranslationContext } from '../../context/TranslationContext';
import { CommonButton } from '../global/UIButtons';
import { Link } from 'react-router-dom';

const ComingSoonSection = () => {
  const {
    content: { common, homepage },
  } = useTranslationContext();
  return (
    <div className="flex flex-col w-full sm:h-screen sm:overflow-hidden lg:py-10 md:flex-row">
      {/* Left Image */}
      <div className="flex flex-col flex-1">
        <div className="w-full flex-1 overflow-hidden">
          <img
            src="/commingsoon1a.jpg"
            alt={common.comingSoon}
            width="1200"
            height="1200"
            loading="lazy"
            decoding="async"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-full flex-1 overflow-hidden">
          <img
            src="/commingsoon2a.jpg"
            alt={common.comingSoon}
            width="1200"
            height="1200"
            loading="lazy"
            decoding="async"
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-10 min-h-[200px] sm:min-h-[500px] h-full bg-[rgb(83,49,37)] text-[rgb(248,238,188)]">
        <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
          <img
            src="Wode Logo.png"
            alt={common.mmmk}
            width="192"
            height="192"
            loading="lazy"
            decoding="async"
            className="object-contain w-full h-full"
          />
        </div>

        <CommonButton
          variant={1}
          size="md"
          isLink
          to="/product-listings?categories=Fragrance"
        >
          {common.shopNow} {common.fragrance}
        </CommonButton>

        {/* <p className="text-center text-3xl">{common.comingSoon}</p> */}
      </div>

      {/* Center Section */}
      <div
        className="flex flex-col items-center relative justify-between w-full text-white md:w-1/3 h-[200px] sm:h-1/3 md:h-full"
        // style={{
        //   background:
        //     "linear-gradient(to bottom left, #154689 50%, #0e6952 99%)",
        // }}
      >
        {/* Top: Logo */}
        <div className="flex justify-center h-full w-full">
          <img
            src="/comingsoon3.jpg"
            alt={common.comingSoon}
            width="1200"
            height="1200"
            loading="lazy"
            decoding="async"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ComingSoonSection;
