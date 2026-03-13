import { Button4 } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';
import { getModuleUrl } from '../../utils/globalMethods';

const Section8 = () => {
  const {
    content: { common, homepage },
  } = useTranslationContext();

  return (
    <div className="grid w-full h-auto min-h-screen grid-cols-1 overflow-hidden md:grid-cols-12">
      {/* Box 1 */}
      <div
        className="flex items-center justify-center h-[400px] md:h-auto col-span-12 md:col-span-5"
        style={{
          backgroundImage: `url("/section8Left.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="p-4 text-center ">
          <h4 className="mb-6 text-lg font-bold md:mb-10 md:text-2xl">
            {/* {query.data?.data?.leftTitle[i18n.language]} */}
            {common.mmmk}
          </h4>
          <p className="text-lg md:text-xl lg:text-4xl tracking-[8px] md:tracking-[16px] leading-10 flex flex-col gap-4 mb-8">
            {/* {query.data?.data?.leftSubtitle[i18n.language] */}
            {homepage.section4Heading1?.split(' ').map((word) => (
              <span>{word}</span>
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
      <div className="col-span-12 md:col-span-2 h-full text-white flex flex-col justify-center items-center text-center p-4 md:p-6 py-10 md:py-[150px] bg-yellow-900  ">
        <img
          src="Wode Logo.png"
          className="w-20 h-20 mb-6 md:w-32 md:h-32"
          alt="Wode Logo"
        />
        <p className="text-sm md:text-lg lg:text-2xl tracking-[2px] md:tracking-[6px] leading-10 flex flex-col gap-4 mb-8">
          {/* {query.data?.data?.centerTitle[i18n.language] */}
          {homepage.section4Heading2?.split(' ').map((word) => (
            <span>{word}</span>
          ))}
        </p>

        <Button4 isLink to={getModuleUrl('category', 'Jewelry & Accessories')}>
          {common.shopNow}
        </Button4>
      </div>

      {/* Box 3 */}
      <div
        className="flex items-center justify-center h-[400px] md:h-auto col-span-12 md:col-span-5"
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
        <div className="p-4 text-center text-white">
          <h4 className="mb-6 text-lg font-bold md:mb-10 md:text-2xl">
            {/* {query.data?.data?.rightTitle[i18n.language]} */}
            {common.mmmk}
          </h4>
          <p className="text-lg md:text-xl lg:text-4xl tracking-[8px] md:tracking-[12px] leading-10 flex flex-col gap-4 mb-8">
            {/* {query.data?.data?.rightSubtitle[i18n.language] */}
            {homepage.section4Heading3?.split(' ').map((word) => (
              <span>{word}</span>
            ))}
          </p>
          <Button4
            isLink
            to={getModuleUrl('category', 'Jewelry & Accessories')}
          >
            {common.shopNow}
          </Button4>
        </div>
      </div>
    </div>
  );
};

export default Section8;
