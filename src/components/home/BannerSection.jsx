import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import bannerSide from '../../assets/Home/model6.png';
import { Button4 } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';
import { getModuleUrl } from '../../utils/globalMethods';
import leftImg from '../../assets/Home/banner-section/left.jpg';
import rightImg from '../../assets/Home/banner-section/right.jpg';

export default function BannerSection() {
  const {
    content: { common, homepage },
  } = useTranslationContext();

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Add event listener
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Auto-advance slides on mobile
  useEffect(() => {
    if (!isMobile) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sections.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isMobile]);

  // Define the sections data
  const sections = [
    {
      id: 'logo',
      type: 'logo',
      content: (
        <div className="flex flex-col items-center gap-2 text-center md:text-left w-full">
          {/* Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
            <img
              src="Wode Logo.png"
              alt={common.mmmk}
              className="object-contain w-full h-full"
            />
          </div>

          {/* Text and Button */}
          <div className="space-y-4 text-white text-center">
            <h2 className="text-xl font-semibold tracking-wider sm:text-2xl lg:text-3xl">
              {homepage.section6Heading1}
            </h2>
            <h1 className="text-3xl font-light tracking-widest sm:text-4xl lg:text-xl">
              {homepage.section6Description1}
            </h1>

            <Button4
              isLink
              to={getModuleUrl('category', 'Jewelry & Accessories')}
              className="relative top-10"
            >
              {common.shopNow}
            </Button4>
          </div>
        </div>
      ),
    },
    {
      id: 'image1',
      type: 'image',
      content: (
        <img
          src={leftImg}
          alt={common.productImageAlt}
          className="object-cover shadow w-full h-full"
        />
      ),
    },
    {
      id: 'image2',
      type: 'image',
      content: (
        <img
          src="/bannerSectionImage.jpg"
          alt={common.productImageAlt}
          className="object-cover shadow w-full h-full"
        />
      ),
    },
    {
      id: 'image3',
      type: 'image',
      content: (
        <img
          src={rightImg}
          alt={common.productImageAlt}
          className="object-cover shadow w-full h-full"
        />
      ),
    },
    {
      id: 'falcon',
      type: 'falcon',
      content: (
        <div className="relative text-[rgb(248,238,188)] w-full h-full flex items-center justify-center">
          <p className="absolute top-10 left-0 right-0 text-center text-2xl z-10">
            {common.comingSoon}
          </p>
          <img
            src="/africanFalcon.jpg"
            alt={common.productImageAlt}
            className="object-cover w-full h-full rounded-md"
          />
          <p className="absolute bottom-10 left-0 right-0 text-center text-2xl z-10">
            {homepage.section6Heading2}
          </p>
        </div>
      ),
    },
  ];

  // Calculate flex values based on hover state (desktop only)
  const getFlexValue = (index) => {
    if (isMobile) return 1; // All equal on mobile

    if (hoveredIndex === null) {
      // Default state: all sections equal size
      return 1;
    }
    // Hover state: hovered item larger, others much smaller
    return hoveredIndex === index ? 0.5 : 0.3;
  };

  // Handle mobile swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % sections.length);
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + sections.length) % sections.length);
    }
  };

  return (
    <div className="w-full flex overflow-hidden bg-[rgb(83,49,37)] h-[500px] relative">
      {/* Mobile slider indicators */}
      {isMobile && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {sections.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentSlide ? 'bg-white' : 'bg-gray-400'
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {sections.map((section, index) => (
        <motion.div
          key={section.id}
          className="flex items-center justify-center relative cursor-pointer h-full"
          initial={false}
          animate={{
            flex: isMobile
              ? index === currentSlide
                ? 1
                : 0
              : getFlexValue(index),
            x: isMobile ? `-${currentSlide * 100}%` : 0,
          }}
          transition={{
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1],
          }}
          onMouseEnter={() => !isMobile && setHoveredIndex(index)}
          onMouseLeave={() => !isMobile && setHoveredIndex(null)}
          onTouchStart={isMobile ? handleTouchStart : undefined}
          onTouchMove={isMobile ? handleTouchMove : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
          style={isMobile ? { minWidth: '100%' } : {}}
        >
          <div className="w-full h-full flex items-center justify-center">
            {section.content}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
