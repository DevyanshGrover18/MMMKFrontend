import { Button4 } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';
import { getModuleUrl } from '../../utils/globalMethods';

const BikiniSection = () => {
  const {
    content: { common, homepage },
  } = useTranslationContext();

  return (
    <div className="grid w-full h-auto min-h-screen grid-cols-1 overflow-hidden md:grid-cols-12">
      {/* Box 1 */}
      <div className="col-span-12 md:col-span-5 h-[400px] md:h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          src="/Bikni-left-section-(1).mp4"
        ></video>
      </div>

      {/* Box 2 - Updated with Hardcoded Bikini Heading */}
      <div className="col-span-12 md:col-span-2 h-full text-white flex flex-col justify-center items-center text-center p-4 md:p-6 py-10 md:py-[150px] bg-yellow-900">
        <img
          src="Wode Logo.png"
          className="w-20 h-20 mb-6 md:w-32 md:h-32"
          alt={common.mmmk}
        />

        {/* Hardcoded Bikini Heading */}
        <p className="text-sm md:text-lg lg:text-2xl tracking-[2px] md:tracking-[6px] leading-10 flex flex-col gap-4 mb-8">
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
      <div className="col-span-12 md:col-span-5 h-[400px] md:h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          src="/rightside-(1).mp4"
        ></video>
      </div>
    </div>
  );
};

export default BikiniSection;
