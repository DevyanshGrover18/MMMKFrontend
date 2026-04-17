import { useState, useRef, useEffect } from 'react';
import { useTranslationContext } from '../../context/TranslationContext';
import { convertPrice, formatPrice } from '../../utils/currency';
import { useCurrency } from '../../context/CurrencyContext';

export default function VideoCard() {
  const {
    content: { common, homepage },
  } = useTranslationContext();
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [playingStates, setPlayingStates] = useState({});
  const videoRefs = useRef({});
  const { currency, rates } = useCurrency();
  const formatConvertedPrice = (amount) =>
    formatPrice(convertPrice(amount, currency, rates), currency);

  const products = [
    {
      id: 1,
      video: '/homeVideos/one.mp4',
      backgroundColor: 'bg-pink-200',
      isNew: true,
      type: 'product',
      title: 'Maaliyah',
      OriginalPrice: '$418',
      OfferedPrice: '$379',
    },
    {
      id: 2,
      video: '/homeVideos/two.mp4',
      backgroundColor: 'bg-gray-200',
      isNew: true,
      type: 'product',
      title: 'Mada',
      OriginalPrice: '$59',
      OfferedPrice: '$54',
    },
    {
      id: 3,
      video: '/homeVideos/three.mp4',
      backgroundColor: 'bg-blue-200',
      isNew: true,
      type: 'product',
      title: 'Mandingo',
      OriginalPrice: '$268',
      OfferedPrice: '$245',
    },
    {
      id: 4,
      video: '/homeVideos/four.mp4',
      backgroundColor: 'bg-gradient-to-br from-purple-400 to-pink-400',
      isNew: false,
      isBefore: true,
      type: 'model',
      hasQuickShop: true,
      title: 'Maelhys',
      OriginalPrice: '$216',
      OfferedPrice: '$197',
    },
  ];

  useEffect(() => {
    Object.keys(videoRefs.current).forEach((id) => {
      const video = videoRefs.current[id];
      if (video) {
        video.muted = true;
        video.playsInline = true;

        const handleCanPlay = () => {
          if (hoveredVideo === parseInt(id)) {
            video.play().catch((e) => console.log('Autoplay prevented:', e));
          }
        };

        const handlePlay = () => {
          setPlayingStates((prev) => ({ ...prev, [id]: true }));
        };

        const handlePause = () => {
          setPlayingStates((prev) => ({ ...prev, [id]: false }));
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
        };
      }
    });
  }, [hoveredVideo]);

  const togglePlay = (id) => {
    const video = videoRefs.current[id];
    if (video) {
      if (video.paused) {
        video.play().catch((e) => console.log('Play failed:', e));
      } else {
        video.pause();
      }
    }
  };

  const handleVideoHover = (id, isHovering) => {
    if (isHovering) {
      setHoveredVideo(id);
      const video = videoRefs.current[id];
      if (video) {
        const attemptPlay = () => {
          video.play().catch((e) => {
            console.log('Autoplay prevented, retrying:', e);
            setTimeout(() => {
              video
                .play()
                .catch((err) => console.log('Second attempt failed:', err));
            }, 100);
          });
        };

        if (video.readyState >= 3) {
          attemptPlay();
        } else {
          video.addEventListener('canplay', attemptPlay, { once: true });
        }
      }
    } else {
      setHoveredVideo(null);
      const video = videoRefs.current[id];
      if (video && !video.paused) {
        video.pause();
        video.currentTime = 0;
      }
    }
  };

  return (
    <div className="bg-white py-8 px-4 md:px-8 md:py-12">
      <div className="mx-auto max-w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-black md:text-4xl">
              {homepage.section17Heading1}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onMouseEnter={() => handleVideoHover(product.id, true)}
              onMouseLeave={() => handleVideoHover(product.id, false)}
            >
              <div
                className={`relative aspect-square overflow-hidden rounded-lg ${product.backgroundColor} flex items-center justify-center`}
              >
                <video
                  ref={(el) => (videoRefs.current[product.id] = el)}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src={product.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="mt-3">
                <div className="flex">
                  <p className="text-lg text-gray-700 line-through">
                    {formatConvertedPrice(product.OriginalPrice)}
                  </p>
                  <p className="ml-3 text-lg text-gray-700">
                    {formatConvertedPrice(product.OfferedPrice)}
                  </p>
                </div>
                <h3 className="text-2xl text-gray-900">{product.title}</h3>
                <h3 className="text-md font-semibold text-gray-900">
                  {common.mmmk}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
