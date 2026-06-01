import { Button4 } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';
import { getModuleUrl } from '../../utils/globalMethods';

const Section8 = () => {
  const {
    content: { common, homepage },
  } = useTranslationContext();

  return (
    <div className="grid w-full grid-cols-1 overflow-hidden md:min-h-screen md:grid-cols-12">
      {/* Box 1 */}
      <div
        className="col-span-12 flex min-h-[320px] items-center justify-center px-4 py-10 md:col-span-5 md:min-h-0 md:px-0 md:py-0"
        style={{
          backgroundImage: `url("/section8Left.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
          <div className="max-w-full p-4 text-center">
          <h4 className="mb-6 text-lg font-bold md:mb-10 md:text-2xl">
            {/* {query.data?.data?.leftTitle[i18n.language]} */}
            {common.mmmk}
          </h4>
          <p className="mb-8 flex flex-col gap-3 text-lg leading-8 tracking-[4px] sm:text-xl md:gap-4 md:text-xl md:leading-10 md:tracking-[10px] lg:text-4xl lg:tracking-[14px]">
            {/* {query.data?.data?.leftSubtitle[i18n.language] */}
            {homepage.section4Heading1?.split(' ').map((word) => (
              <span key={word}>{word}</span>
            ))}
          </p>
          <Button4
            className="pointer-events-none"
            isLink
            to="/product-listings"
          >
            {common.comingSoon}
          </Button4>
        </div>
      </div>

      {/* Box 2 */}
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
        <p className="mb-8 flex flex-col gap-3 text-sm leading-8 tracking-[2px] md:gap-4 md:text-lg md:leading-10 md:tracking-[5px] lg:text-2xl">
          {/* {query.data?.data?.centerTitle[i18n.language] */}
          {homepage.section4Heading2?.split(' ').map((word) => (
            <span key={word}>{word}</span>
          ))}
        </p>

        <Button4 isLink to={getModuleUrl('category', 'Jewellery & Accessories')}>
          {common.shopNow}
        </Button4>
      </div>

      {/* Box 3 */}
      <div
        className="col-span-12 flex min-h-[320px] items-center justify-center px-4 py-10 md:col-span-5 md:min-h-0 md:px-0 md:py-0"
        style={{
          // backgroundImage: `url(${
          //   import.meta.env.VITE_IMAGE_URL + query.data?.data?.rightImage
          // })`,
          backgroundImage: `url("/static8Right.jpg")`,

          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="max-w-full p-4 text-center text-white">
          <h4 className="mb-6 text-lg font-bold md:mb-10 md:text-2xl">
            {/* {query.data?.data?.rightTitle[i18n.language]} */}
            {common.mmmk}
          </h4>
          <p className="mb-8 flex flex-col gap-3 text-lg leading-8 tracking-[4px] sm:text-xl md:gap-4 md:text-xl md:leading-10 md:tracking-[8px] lg:text-4xl lg:tracking-[10px]">
            {/* {query.data?.data?.rightSubtitle[i18n.language] */}
            {homepage.section4Heading3?.split(' ').map((word) => (
              <span key={word}>{word}</span>
            ))}
          </p>
          <Button4
            isLink
            to={getModuleUrl('category', 'Jewellery & Accessories')}
          >
            {common.shopNow}
          </Button4>
        </div>
      </div>
    </div>
  );
};

export default Section8;
