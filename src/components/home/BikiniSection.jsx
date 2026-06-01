import { Button4 } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';
import { getModuleUrl } from '../../utils/globalMethods';

const BikiniSection = () => {
  const {
    content: { common, homepage },
  } = useTranslationContext();

  return (
    <div className="grid w-full grid-cols-1 overflow-hidden md:min-h-screen md:grid-cols-12">
      {/* Box 1 */}
      <div className="col-span-12 h-[320px] sm:h-[400px] md:col-span-5 md:h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          src="/Bikni-left-section-(1).mp4"
        ></video>
      </div>

      {/* Box 2 - Updated with Hardcoded Bikini Heading */}
      <div className="col-span-12 flex min-h-[320px] flex-col items-center justify-center bg-yellow-900 p-4 py-10 text-center text-white md:col-span-2 md:min-h-0 md:p-6 md:py-[150px]">
        <img
          src="Wode Logo.png"
          className="w-20 h-20 mb-6 md:w-32 md:h-32"
          alt={common.mmmk}
          width="128"
          height="128"
          loading="lazy"
          decoding="async"
        />

        {/* Hardcoded Bikini Heading */}
        <p className="mb-8 flex flex-col gap-3 text-sm leading-8 tracking-[2px] md:gap-4 md:text-lg md:leading-10 md:tracking-[5px] lg:text-2xl">
          <span>{common.explore}</span>
          <span>{common.premium}</span>
          <span>{common.bikini}</span>
          <span>{common.collection}</span>
        </p>

        <Button4 isLink to={getModuleUrl('category', 'Design Bikni Swimwear')}>
          {common.shopNow}
        </Button4>
      </div>

      {/* Box 3 */}
      <div className="col-span-12 h-[320px] sm:h-[400px] md:col-span-5 md:h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          src="/rightside-(1).mp4"
        ></video>
      </div>
    </div>
  );
};

export default BikiniSection;
