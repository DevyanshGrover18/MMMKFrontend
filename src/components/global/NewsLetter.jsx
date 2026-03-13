import { CommonButton } from './UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';

const NewsLetter = () => {
  const {
    content: { common },
  } = useTranslationContext();
  return (
    <div className="w-full bg-white flex flex-col md:flex-row justify-between py-[50px] md:py-[100px]">
      {/* Left */}
      <div className="max-w-4xl px-4 mb-4 text-black md:px-20 md:mb-0">
        <h2 className="text-2xl font-bold sm:text-5xl md:text-4xl ">
          {common.newsLetterHeading}
        </h2>
        <p className="text-sm sm:text-lg md:text-lg">
          {common.newsLetterDescription}
        </p>
      </div>

      {/* Right */}
      <div className="flex justify-center px-4 py-2 md:py-8 md:px-20 md:justify-start">
        <CommonButton variant={3} isLink to="/auth">
          {common.signUp}
        </CommonButton>
      </div>
    </div>
  );
};

export default NewsLetter;
