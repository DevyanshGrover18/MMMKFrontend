/* eslint-disable no-unused-vars */
import Section2 from '../components/home/Section2';
import Section3 from '../components/home/Section3';
import Section6 from '../components/home/Section6';
import Section7 from '../components/home/Section7';
import Section8 from '../components/home/Section8';
import Section9 from '../components/home/Section9';
import Enquiry from '../components/home/Enquiry';
import NewsLetter from '../components/global/NewsLetter';
import ShopInstant from '../components/home/ShopInstant';
import Slider from '../components/global/Slider';
import BikiniSection from '../components/home/BikiniSection';
import Section5 from '../components/home/Section5';
import Section10 from '../components/home/Section10';
import LuxurySection from '../components/home/LuxurySection';
import RecommendedSection from '../components/home/RecommendedSection';
import BannerSection from '../components/home/BannerSection';
import BannerVideo from '../components/global/BannerVideo';
import { CommonButton } from '../components/global/UIButtons';
import Section11 from '../components/home/Section11';
import ComingSoonSection from '../components/home/ComingSoonSection';
import { useTranslationContext } from '../context/TranslationContext';
import VideoCard from '../components/home/VideoCard';

const Home = () => {
  const {
    content: { common, homepage },
  } = useTranslationContext();

  return (
    <div className="w-full">
      <BannerVideo bg="/heroSectionBg1.mp4">
        <div className="text-white text-center md:h-[70vh] h-[80vh] flex flex-col items-center justify-center md:mt-16 md:mb-0 -mb-56">
          <h4 className="my-4 text-[23px] sm:text-7xl md:text-8xl lg:text-7xl sm:my-6 md:my-10 text-orange-200">
            {common.mmmk}
          </h4>
          {/* <h1 className="my-4 text-[23px] sm:text-7xl md:text-8xl lg:text-7xl sm:my-6 md:my-10">
            {homepage.section1Heading1}
          </h1> */}
          <CommonButton variant={1} size="md" isLink to="/product-listings">
            {common.shopNow}
          </CommonButton>
        </div>
      </BannerVideo>
      <Section8></Section8>
      <Slider></Slider>
      <Section2></Section2>
      <BikiniSection></BikiniSection>
      <RecommendedSection />
      {/* <Slider dataSource={slides}></Slider> */}
      {/* <Section5></Section5> */}
      <BannerSection></BannerSection>
      <ShopInstant></ShopInstant>
      <Section6 />
      <VideoCard />
      <ComingSoonSection />
      <Section7 />
      <Section3 />
      <Section9></Section9>
      <Enquiry></Enquiry>
      <LuxurySection></LuxurySection>
      <Section10></Section10>
      <Section11></Section11>
      <NewsLetter></NewsLetter>
    </div>
  );
};

export default Home;
