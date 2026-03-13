import { forwardRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const CustomCarousel = forwardRef(
  ({ items = [], renderItem, onMouseEnter, onMouseLeave }, ref) => {
    return (
      <div
        className="relative max-w-full mt-8 mx-4 select-none"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Scrollable Items */}
        <div
          ref={ref}
          className="overflow-x-auto flex items-center my-carousel"
          style={{
            scrollBehavior: 'smooth',
            transition: 'scroll-left 1s ease-in-out',
          }}
        >
          {items.map(renderItem)}
        </div>
      </div>
    );
  }
);

export default CustomCarousel;
