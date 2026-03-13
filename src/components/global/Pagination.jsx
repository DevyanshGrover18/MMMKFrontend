/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useTranslationContext } from '../../context/TranslationContext';

const Pagination = ({ totalItems, itemsPerPage, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    content: { common },
  } = useTranslationContext();

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageClick = (page) => {
    setCurrentPage(page);
    onPageChange(page);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageClick(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      handlePageClick(currentPage - 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 bg-[rgba(40,18,11,.3)] py-3 px-4 rounded-md md:mb-0 -mb-16">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className={`text-white text-sm md:text-lg cursor-pointer ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'underline'
        }`}
      >
        {common.previous}
      </button>

      {/* Page Numbers */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`text-white text-sm md:text-lg ${
                currentPage === page ? 'font-bold' : ''
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`text-white text-sm md:text-lg cursor-pointer ${
          currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed'
            : 'underline'
        }`}
      >
        {common.next}
      </button>
    </div>
  );
};

export default Pagination;
