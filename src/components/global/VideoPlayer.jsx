/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useRef } from 'react';
import videoSuggest from '../../assets/video.mp4';

const VideoPlayer = ({ videoSrc }) => {
  const videoRef = useRef(null); // Reference to the video element

  return (
    <div className="max-w-xs border border-gray-300 shadow-md ">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-[500px] object-cover"
        src={videoSuggest} // Test with a public video
        controls={true} // Default video controls enabled
      />
    </div>
  );
};

export default VideoPlayer;
