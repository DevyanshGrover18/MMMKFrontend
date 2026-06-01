import { Swiper, SwiperSlide } from 'swiper/react';
import { useRef, useState, useEffect } from 'react';
import { useInView } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { useTranslationContext } from '../../context/TranslationContext';

const VideoPlayer = ({ videoSrc }) => {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const isInView = useInView(ref, { margin: '200px 0px' });
  const [hasBeenViewed, setHasBeenViewed] = useState(false);

  useEffect(() => {
    if (isInView) {
      setHasBeenViewed(true);
    }
  }, [isInView]);

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView]);

  return (
    <div ref={ref} className="w-full">
      {hasBeenViewed ? (
        <video
          ref={videoRef}
          className="w-full h-auto object-contain"
          src={videoSrc}
          controls
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="w-full aspect-[9/16] bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export default function Section11() {
  const {
    content: { homepage },
  } = useTranslationContext();

  return (
    <div className="videoSwiper py-10 md:py-[50px]">
      <div className="flex w-full justify-between py-8 md:py-12">
        {/* Header */}
        <div className="px-4 text-black md:px-20">
          <h2 className="text-2xl font-semibold md:text-4xl lg:text-5xl">
            {homepage.section16Heading1}
          </h2>
        </div>
      </div>

      {/* Swiper Container */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-16">
        <Swiper
          slidesPerView={1} // Default to 1 for mobile
          spaceBetween={20}
          pagination={{ clickable: true }}
          modules={[Pagination]}
          className="mySwiper"
          breakpoints={{
            640: {
              slidesPerView: 2, // 2 slides for small devices
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3, // 3 slides for medium devices
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 4, // 4 slides for large devices
              spaceBetween: 40,
            },
          }}
          grabCursor={true}
          touchStartPreventDefault={false}
          touchMoveStopPropagation={false}
          loop={true}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <SwiperSlide key={i} className="flex justify-center pb-14">
              <div className="relative w-full max-w-xs bg-white border border-black shadow-md md:max-w-sm">
                <div className="relative flex items-center justify-center">
                  <VideoPlayer videoSrc={`/backstageVideo${i + 1}.mp4`} />
                </div>
              </div>
            </SwiperSlide>
          ))}
          {/* <SwiperSlide key={5} className="flex justify-center pb-14">
            <div className="relative w-full max-w-xs bg-white border border-black shadow-md md:max-w-sm">
              <div className="relative flex items-center justify-center aspect-video md:aspect-[16/9]">
                <img src={`/influencerImage1.jpg`} />
              </div>
            </div>
          </SwiperSlide> */}
        </Swiper>
      </div>
    </div>
  );
}
