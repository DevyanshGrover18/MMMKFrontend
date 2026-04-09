import { CommonButton } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';

const Section2 = () => {
  const {
    content: { common },
  } = useTranslationContext();

  return (
    <div className="grid w-full h-auto grid-cols-1 mb-12 md:grid-cols-3">
      {/* Image Box 1 */}
      <div className="relative w-full h-[200px] sm:h-[300px] md:h-auto lg:h-auto">
        <img
          src="/section2Left.jpg"
          alt={common.productImageAlt}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 flex items-end justify-center p-4">
          <CommonButton
            variant={1}
            size="md"
            isLink
            to="/product-details/690c937d2db5b6e58f73efa7"
            className="bg-gray-900 text-white"
          >
            {common.buyNow}
          </CommonButton>
        </div>
      </div>
      <div className="w-full h-[200px] sm:h-[300px] md:h-auto lg:h-auto">
        <video
          src="/section2Video.mp4"
          className="object-cover w-full h-full"
          autoPlay
          loop
          muted
          preload="metadata"
          // playsInline
          controls
        />
      </div>

      {/* Image Box 2 */}
      <div className="relative w-full h-[200px] sm:h-[300px] md:h-auto lg:h-auto">
        <img
          src="/section2Right.jpg"
          alt={common.productImageAlt}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 flex items-end justify-center p-4">
          <CommonButton
            variant={1}
            size="md"
            isLink
            to="/product-details/690c937d2db5b6e58f73efa7"
            className="bg-gray-900 text-white"
          >
            {common.buyNow}
          </CommonButton>
        </div>
      </div>
    </div>
  );
};

export default Section2;
