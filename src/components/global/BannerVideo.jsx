/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Container from './Container';
import { TbMenu } from 'react-icons/tb';
import { Button, Divider, Drawer, Space } from 'antd';
import { IoSearchSharp } from 'react-icons/io5';
import { FaUser, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { BsMinecartLoaded } from 'react-icons/bs';
import { RiArrowDropDownLine } from 'react-icons/ri';
import BannerSlider from './BannerSlider';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartProvider';
import { useQuery } from '@tanstack/react-query';
import { getAllCategory } from '../../apis/nonAuth/category';
import { getUrl } from '../../utils/globalMethods';
import MenuDrawer from './MenuDrawer';
import SearchDrawer from './searchDrawer';
import Navbar from './Navbar';

const BannerVideo = ({ children, minHight, bg }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Start muted by default
  const videoRef = useRef(null);
  const { data } = useCart();

  const showDrawer = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    if (!i18n.language) {
      i18n.changeLanguage('en');
      document.dir = 'ltr';
    } else {
      document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [i18n.language]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.dir = lng === 'ar' ? 'rtl' : 'ltr';
    setListOpen(false);
  };

  const showSearchDrawer = () => {
    setIsSearch(true);
  };

  const closeSearchDrawer = () => {
    setIsSearch(false);
  };

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
          muted={isMuted}
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
