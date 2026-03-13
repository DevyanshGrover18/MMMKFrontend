/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Link, useNavigate } from 'react-router-dom';

// Import your images and video

import { Button3, Button4 } from '../global/UIButtons';
import CustomCarousel from '../global/Carousal';
import { useTranslationContext } from '../../context/TranslationContext';
import { useGlobalContext } from '../../context/GlobalProvider';

export default function RecommendedSection() {
  const {
    translateLanguage,
    content: { common, homepage },
  } = useTranslationContext();
  const { recommendedProducts } = useGlobalContext();
  const navigate = useNavigate();
  const isArabic = translateLanguage === 'ar';

  const totalSlides = recommendedProducts.length;

  return (
    <section className="w-full py-12">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center justify-between mb-8 md:flex-row md:ml-12">
          <h2 className="text-xl text-[#FFA500] font-bold text-center sm:text-3xl md:text-4xl lg:text-5xl">
            {homepage.section5Heading1}
          </h2>
          <Button3 isLink to="/product-listings" className="!text-sm !py-2">
            {common.viewAll}
          </Button3>
        </div>

        <CustomCarousel
          items={recommendedProducts}
          renderItem={(product, i) => (
            <div
              key={product._id}
              className="relative group flex-shrink-0 w-full sm:w-[300px] md:w-[340px] lg:w-[430px] h-[300px] md:h-[350px] lg:h-[400px] mx-auto"
            >
              <div
                className="w-full h-full overflow-hidden"
                style={{
                  backgroundImage: `url(${
                    import.meta.env.VITE_IMAGE_URL + product.image
                  })`,
                  // backgroundImage: `url("/section2Left.jpg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <div className="absolute z-[1] bottom-0 transition-all duration-500 shadow-2xl w-full max-h-[100px] h-full text-white">
                <Link
                  to={`/product-details/${product._id}`}
                  className="absolute z-[-1] left-0 right-0 bottom-0 h-full bg-gradient-to-t from-black/60 to-transparent transition-all duration-500"
                >
                  <span className="block w-full h-full opacity-0 border-4 border-white origin-left group-hover:opacity-100 transition-all duration-500"></span>
                </Link>
                <div className="absolute bottom-4 px-4">
                  {product.price && product.websitePrice ? (
                    <p
                      className={`font-medium text-white flex justify-center items-center gap-2`}
                    >
                      <span className="line-through text-sm">
                        ${product?.price}
                      </span>
                      <span className="text-lg font-semibold md:text-xl">
                        {product?.websitePrice}
                      </span>
                    </p>
                  ) : (
                    'Coming Soon'
                  )}

                  <p className="text-xl px-4">
                    {product.nameInLanguage?.[translateLanguage]}
                  </p>
                </div>
              </div>
              {/* <Button4
                isLink
                to={`/product-details/${product._id}`}
                className="absolute z-[2] top-1/2 left-1/2 -translate-x-1/2 -translate-y-full transition-all duration-500 scale-0 opacity-0 group-hover:opacity-100 group-hover:scale-100"
              >
                {common.view}
              </Button4>
              <div className="absolute z-[1] bottom-0 transition-all duration-500 shadow-2xl w-full max-h-[100px] group-hover:max-h-[500px] h-full text-white">
                <div className="absolute z-[-1] left-0 right-0 bottom-0 h-full bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-4">
                  <span className="px-4">$ {product.price}</span>
                  <p className="text-xl px-4">
                    {product.nameInLanguage?.[translateLanguage]}
                  </p>
                </div>
              </div> */}
            </div>
          )}
        />
      </div>
    </section>
  );
}
