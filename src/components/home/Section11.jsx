/* eslint-disable no-unused-vars */
import { Swiper, SwiperSlide } from 'swiper/react';
import video from '../../assets/video.mp4';

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
      preload="metadata"
    />
  );

  return (
    <div className="py-[50px] videoSwiper">
      <div className="flex justify-between w-full py-12">
        {/* Header */}
        <div className="px-4 text-black md:px-20">
          <h2 className="text-2xl font-semibold md:text-4xl lg:text-5xl">
            {homepage.section16Heading1}
          </h2>
        </div>
      </div>

      {/* Swiper Container */}
      <div className="px-6 md:px-12 lg:px-16">
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

const dataSource = [
  { id: 1, videoSrc: video },
  { id: 2, videoSrc: video },
  { id: 3, videoSrc: video },
  { id: 4, videoSrc: video },
  { id: 5, videoSrc: video },
  { id: 6, videoSrc: video },
];
