/* eslint-disable no-unused-vars */
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { useTranslationContext } from '../../context/TranslationContext';

export default function Section11() {
  const {
    content: { homepage },
  } = useTranslationContext();

  const VideoPlayer = ({ videoSrc }) => (
    <video
      className="object-cover w-full"
      src={videoSrc}
      controls
      muted
      autoPlay
      loop
      playsInline
      preload="none"
    />
  );

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
                <div className="relative flex items-center justify-center aspect-video md:aspect-[16/9]">
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
