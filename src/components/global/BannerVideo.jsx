/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import Navbar from './Navbar';

const BannerVideo = ({ children, minHight, bg, poster }) => {
  const { i18n } = useTranslation();
  const [isMuted, setIsMuted] = useState(true);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!i18n.language) {
      i18n.changeLanguage('en');
      document.dir = 'ltr';
    } else {
      document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [i18n.language]);

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.muted = isMuted;
    videoRef.current.defaultMuted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    let cancelled = false;
    const scheduleVideoLoad = () => {
      if (cancelled) return;
      setShouldLoadVideo(true);
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(scheduleVideoLoad, { timeout: 2500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(idleId);
      };
    }

    const timerId = window.setTimeout(scheduleVideoLoad, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, []);

  const toggleMute = () => {
    setIsMuted((prevState) => !prevState);
  };

  return (
    <>
      <div
        className="w-full text-white relative md:py-24 py-6"
        style={{ minHeight: minHight ? `${minHight}vh` : '100vh' }}
      >
        {/* Poster-first hero: this is the element Lighthouse should paint as LCP. */}
        {poster && (
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            width="1920"
            height="1080"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        )}
        {shouldLoadVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={bg}
            poster={poster}
            autoPlay
            loop
            playsInline
            preload="none"
            defaultMuted={isMuted}
            muted={isMuted}
            aria-hidden="true"
          />
        )}
        <div className="video-overlay"></div>

        {/* Black overlay */}
        <div className="absolute inset-0 bg-black opacity-0 -z-[1]"></div>

        {/* Sound Toggle Button */}
        <button
          onClick={toggleMute}
          type="button"
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-all"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          aria-pressed={!isMuted}
        >
          {isMuted ? (
            <FaVolumeMute className="text-xl" />
          ) : (
            <FaVolumeUp className="text-xl" />
          )}
        </button>

        <Navbar />
        <div className="w-full relative z-[2]">{children}</div>
      </div>
    </>
  );
};

export default BannerVideo;
