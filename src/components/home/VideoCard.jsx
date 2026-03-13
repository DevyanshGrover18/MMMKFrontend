import { ChevronLeft, ChevronRight, Heart, Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function VideoCard() {
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [playingStates, setPlayingStates] = useState({});
  const videoRefs = useRef({});

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

  // Effect to handle video loading and autoplay setup
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((id) => {
      const video = videoRefs.current[id];
      if (video) {
        // Set video properties for better autoplay compatibility
        video.muted = true;
        video.playsInline = true;

        // Add event listeners
        const handleCanPlay = () => {
          // Video is ready to play
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

        // Cleanup function
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
        // Try to play immediately, and if it fails, try again after a short delay
        const attemptPlay = () => {
          video.play().catch((e) => {
            console.log('Autoplay prevented, retrying:', e);
            // Retry after a short delay
            setTimeout(() => {
              video
                .play()
                .catch((e) => console.log('Second attempt failed:', e));
            }, 100);
          });
        };

        if (video.readyState >= 3) {
          // HAVE_FUTURE_DATA
          attemptPlay();
        } else {
          // Wait for the video to be ready
          video.addEventListener('canplay', attemptPlay, { once: true });
        }
      }
    } else {
      setHoveredVideo(null);
      const video = videoRefs.current[id];
      if (video && !video.paused) {
        video.pause();
        video.currentTime = 0; // Reset to beginning
      }
    }
  };

  return (
    <div className="bg-white py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
              Everyday Elegance: Wardrobe & Decor
            </h1>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onMouseEnter={() => handleVideoHover(product.id, true)}
              onMouseLeave={() => handleVideoHover(product.id, false)}
            >
              <div
                className={`relative aspect-square rounded-lg overflow-hidden ${product.backgroundColor} flex items-center justify-center`}
              >
                {/* Video Element */}
                <video
                  ref={(el) => (videoRefs.current[product.id] = el)}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src={product.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Product Info */}
              <div className="mt-3">
                <div className="flex">
                  <p className="text-gray-700 line-through text-lg">
                    {product.OriginalPrice}
                  </p>
                  <p className="text-gray-700 ml-3 text-lg">
                    {product.OfferedPrice}
                  </p>
                </div>
                <h3 className="text-gray-900 text-2xl">{product.title}</h3>
                <h3 className="font-semibold text-gray-900 text-md">
                  MMMK WODE
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
