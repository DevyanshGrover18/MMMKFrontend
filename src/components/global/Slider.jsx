/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button3 } from './UIButtons';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CustomCarousel from './Carousal';
import { useTranslationContext } from '../../context/TranslationContext';
import { useGlobalContext } from '../../context/GlobalProvider';

export default function Slider() {
  const {
    translateLanguage,
    content: { common, homepage },
  } = useTranslationContext();
  const { categories } = useGlobalContext();
  const carouselRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const handlePrevPage = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft -= 300;
    }
  };

  const handleNextPage = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += 300;
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || isHovering) return;

    const scrollInterval = setInterval(() => {
      if (carousel.scrollWidth > carousel.clientWidth) {
        if (carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth) {
          carousel.scrollLeft += 1;
        } else {
          carousel.scrollLeft = 0;
        }
      }
    }, 50);

    return () => clearInterval(scrollInterval);
  }, [categories, isHovering]);

  return (
    <section className="w-full py-12">
      <div className="container px-4 mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between mb-8 md:flex-row md:ml-12">
          <h2 className="text-xl text-[#05682F] font-bold text-center sm:text-3xl md:text-4xl lg:text-5xl">
            {homepage.section2Heading1}
          </h2>
          <Button3 isLink to="/product-listings" className="!text-sm !py-2">
            {common.viewAll}
          </Button3>
        </div>

        <div className="relative">
          <CustomCarousel
            ref={carouselRef}
            items={categories}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            renderItem={(product, i) => (
              <div
                key={product._id}
                className="relative group flex-shrink-0 w-full sm:w-[300px] md:w-[340px] lg:w-[430px] h-[300px] md:h-[350px] lg:h-[550px] mx-auto"
              >
                <div
                  className="w-full h-full overflow-hidden"
                  style={{
                    backgroundImage: `url(${import.meta.env.VITE_IMAGE_URL + product.image})`,
                    // backgroundImage: `url("/section2Left.jpg")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                ></div>
                <div className="absolute z-[1] bottom-0 transition-all duration-500 shadow-2xl w-full max-h-[100px] h-full text-white">
                  <Link
                    to={
                      '/product-listings?categories=' +
                      encodeURIComponent(product.name.en).replace(/%20/g, '+')
                    }
                    className="absolute z-10 left-0 right-0 bottom-0 h-full bg-gradient-to-t from-black/60 to-transparent transition-all duration-500 flex items-center justify-center group-hover:shadow-[inset_0_0_0_4px_white]"
                  >
                    <h3 className="text-lg font-semibold sm:text-xl md:text-2xl text-center w-full">
                      {product.nameInLanguage?.[translateLanguage]}
                    </h3>
                  </Link>
                </div>
              </div>
            )}
          />
          {/* <button
            className="absolute left-[2%] lg:-left-14 top-1/2 -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-80 pointer-events-auto flex items-center justify-center"
            onClick={handlePrevPage}
            aria-label="Scroll Left"
          >
            <FaChevronLeft />
          </button>
          <button
            className="absolute right-[2%] lg:-right-14 top-1/2 -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-80 pointer-events-auto flex items-center justify-center"
            onClick={handleNextPage}
            aria-label="Scroll Right"
          >
            <FaChevronRight />
          </button> */}
        </div>
      </div>
    </section>
  );
}
