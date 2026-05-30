import { CommonButton } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';
import { PRODUCTIDS } from '../../utils/staticData';
import { getModuleUrl } from '../../utils/globalMethods';

const Section3 = () => {
  const {
    content: { common, homepage },
  } = useTranslationContext();
  return (
    <div className="grid w-full grid-cols-1 md:grid-cols-2 bg-[rgb(83,49,37)] sm:pb-0">
      {/* Text Section */}
      <div className="flex flex-col justify-start px-4 pt-10 text-white md:pt-20 md:px-8 lg:px-12 lg:pt-28 xl:px-16">
        <h4 className="text-xl font-bold md:text-2xl lg:text-3xl xl:text-4xl">
          {homepage.section11Heading1}
        </h4>
        <p className="my-3 text-sm md:text-base lg:text-lg xl:text-xl">
          {homepage.section11Description1}
        </p>
        <CommonButton
          variant={1}
          className="w-fit mt-8"
          size="md"
          isLink
          to={getModuleUrl('product', PRODUCTIDS.silkyMusk)}
        >
          {common.buyNow}
        </CommonButton>
      </div>
      <div className="w-full h-[300px] md:h-[900px] flex items-center justify-end">
        <img
          src="/section3Product1.jpg"
          alt={homepage.section11Heading1}
          width="1200"
          height="1200"
          loading="lazy"
          decoding="async"
          className="h-full w-[100%] ms:w-[97%] object-cover"
        />
      </div>
    </div>
  );
};

export default Section3;
