import { Button4 } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';
import { PRODUCTIDS } from '../../utils/staticData';
import { getModuleUrl } from '../../utils/globalMethods';

const Section6 = () => {
  const {
    content: { common, homepage },
  } = useTranslationContext();
  // console.log("Product in Section6:", product);
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 overflow-hidden bg-[#99ddff]">
      {/* Image Section */}
      <div className="flex items-center justify-center w-full">
        <img
          src="/section6Product.jpg"
          alt={common.productImageAlt}
          width="1200"
          height="1200"
          loading="lazy"
          decoding="async"
          className="object-contain shadow w-full h-auto"
        />
      </div>
      {/* Text Content Section */}
      <div className="flex flex-col justify-center w-full h-full px-6 py-20 text-white text-center py-12 md:py-16 md:px-10 lg:px-16 xl:px-20">
        <p className="text-[12px] md:text-[14px] font-bold">
          {homepage.section8Heading1}
        </p>

        {/* <Link to={`/product-details/${product?._id}`}> */}
        <Button4
          isLink
          to={getModuleUrl('product', PRODUCTIDS.melMoney)}
          className="!hover:text-[var(--primary-olive)] w-fit mx-auto"
        >
          {common.buyNow}
        </Button4>
        {/* </Link> */}
      </div>
      {/* Image Section */}
      <div className="flex items-center justify-center w-full">
        <img
          src="/melMoneyRight2.jpg"
          alt={common.productImageAlt}
          width="1200"
          height="1200"
          loading="lazy"
          decoding="async"
          className="object-contain shadow w-full h-auto"
        />
      </div>
    </div>
  );
};

export default Section6;
