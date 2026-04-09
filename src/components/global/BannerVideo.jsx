/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import Navbar from './Navbar';

const BannerVideo = ({ children, minHight, bg }) => {
  const { i18n } = useTranslation();
  const [isMuted, setIsMuted] = useState(false); // Start muted by default
  const videoRef = useRef(null);

  useEffect(() => {
    if (!i18n.language) {
      i18n.changeLanguage('en');
      document.dir = 'ltr';
    } else {
      document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [i18n.language]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      <div
        className={`w-full min-h-[${minHight}vh] text-white relative md:py-24 py-6`}
      >
        {/* Video Background */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={bg}
          autoPlay
          loop
          playsInline
          preload="metadata"
          muted={isMuted}
          aria-hidden="true"
        ></video>
        <div className="video-overlay"></div>

        {/* Black overlay */}
        <div className="absolute inset-0 bg-black opacity-0 -z-[1]"></div>

        {/* Sound Toggle Button */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-all"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
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
