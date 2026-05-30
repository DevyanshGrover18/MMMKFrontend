import { useEffect, useState } from 'react';
import { MdOutlineFilterList } from 'react-icons/md';

import Banner from '../components/global/Banner';
import ProductGrid from '../components/listing/ProductGrid';
import NewsLetter from '../components/global/NewsLetter';
import bg from '../assets/bg.png';
import Pagination from '../components/global/Pagination';
import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '../apis/nonAuth/products';
import SidebarFilter from '../components/listing/SidebarFilter';
import { useSearchParams } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalProvider';
import {
  translateText,
  useTranslationContext,
} from '../context/TranslationContext';

import SkeletonCard from '../components/listing/SkeletonCard';
import { getCategoryLabel } from '../utils/categoryTranslation';


const ProductListing = () => {
  const { categories } = useGlobalContext();
  const {
    content: { common },
    translateLanguage,
  } = useTranslationContext();

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const [utils, setUtils] = useState({
    currentPage: 1,
    categories: [],
    gender: [],
    price: [],
    discount: [],
    category: [],
    brand: [],
    sort: '',
    q: null,
  });

  const updateUtils = (newData) =>
    setUtils((prevData) => ({ ...prevData, ...newData }));

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const searchedCategories = searchParams.get('categories');
    const gender = searchParams.get('gender');
    const brand = searchParams.get('brand');
    const price = searchParams.get('price');
    const discount = searchParams.get('discount');
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const sort = searchParams.get('sort');

    // Extract all other params as potential custom filters
    const knownParams = [
      'categories',
      'gender',
      'brand',
      'price',
      'discount',
      'category',
      'sort',
      'q',
    ];
    const customFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (!knownParams.includes(key)) {
        customFilters[key] = value ? value.split(',') : [];
      }
    }

    const searchedCats =
      searchedCategories?.split(',').map((item) => item.trim()) || [];

    updateUtils({
      categories: searchedCats,
      gender: gender ? gender.split(',') : [],
      price: price ? price.split(',') : [],
      discount: discount ? discount.split(',') : [],
      category: category ? category.split(',') : [],
      brand: brand ? brand.split(',') : [],
      sort: sort || '',
      q: q || null,
      ...customFilters,
      currentPage: 1,
    });
  }, [searchParams]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [resultsText, setResultsText] = useState(null);

  const onPageChange = (value) => {
    setUtils((prevData) => {
      return { ...prevData, currentPage: value };
    });
  };

  // fetching paginated products
  const query = useQuery({
    queryKey: ['products', utils, translateLanguage],
    queryFn: () => getAllProducts(utils, { translateLanguage }),
  });

  useEffect(() => {
    const element = document.getElementById('categories-navbar');
    element?.scrollIntoView({ top: 0, behavior: 'smooth' });
  }, [query.data]);

  const getResultText = async (length, total, language) => {
    if (!total) return null;
    const text = `${length} of ${total} results`;
    const newText =
      language === 'en' ? text : await translateText(text, language);
    setResultsText(newText);
  };

  useEffect(() => {
    getResultText(
      query.data?.data?.length,
      query.data?.pagination?.total,
      translateLanguage
    );
  }, [query.data, translateLanguage]);

  useEffect(() => {
    const matchedCategories =
      categories?.filter((item) => utils.categories?.includes(item.name.en)) || [];

    if (matchedCategories.length > 0) {
      setSelectedCategory(
        matchedCategories
          .map((item) => getCategoryLabel(item, translateLanguage))
          .join(', ')
      );
    } else {
      setSelectedCategory(utils.q ? `Search: ${utils.q}` : null);
    }

    setSelectedCategoryIds(matchedCategories.map((item) => item._id));
  }, [categories, translateLanguage, utils.categories, utils.q]);

  const handleSelectCategory = (item) => {
    setUtils((prevData) => {
      const currentCategories = prevData.categories || [];
      const nextCategories = currentCategories.includes(item.name.en)
        ? currentCategories.filter((name) => name !== item.name.en)
        : [...currentCategories, item.name.en];

      return {
        ...prevData,
        categories: nextCategories,
        currentPage: 1,
      };
    });
  };

  const toggleFilterSidebar = () => {
    setIsFilterSidebarOpen((prevState) => !prevState);
  };

  return (
    <div className="w-full">
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>
      <Banner bg={bg}>
        <div className="w-full md:mt-32 mt-36">
          {/* Navbar */}
          <div
            id="categories-navbar"
            className="flex items-center z-30 justify-start gap-3 px-6 py-8 border-t border-b lg:px-10 overflow-x-auto whitespace-nowrap no-scrollbar"
          >
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((item) => {
                if (!item || !item.name) return null;
                return (
                  <button
                    key={item._id || item.name?.en}
                    onClick={() => handleSelectCategory(item)}
                    className={`${
                      (utils.categories || []).includes(item.name?.en)
                        ? 'bg-white text-black'
                        : 'text-white'
                    } px-6 py-2 transition duration-300 border-2 border-transparent rounded-md hover:border-white hover:bg-white hover:text-black whitespace-nowrap`}
                  >
                    {getCategoryLabel(item, translateLanguage)}
                  </button>
                );
              })
            ) : (
              <div className="text-white">{common.loadingCategories}</div>
            )}
          </div>

          {/* Sort and breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between w-full gap-5 px-6 py-6 border-t border-b text-2nd md:px-10 lg:px-20">
            <div className="w-full md:w-auto">
              <div className="flex flex-wrap gap-3 mt-2 text-lg md:text-xl md:flex-nowrap md:gap-5">
                <p>
                  {/* {query.data?.pagination.total} {t("productDetails.ofResults")} */}
                  {resultsText}
                </p>
                <p className="text-base font-bold md:text-xl">
                  {common.home}{' '}
                  {selectedCategory ? ` > ${selectedCategory}` : ''}
                </p>
              </div>
            </div>
            
          </div>

          {/* Main Content Section */}
          <main className="grid w-full grid-cols-1 md:grid-cols-12">
            <div className="w-full md:col-span-3 lg:col-span-2 md:border-b-0">
              {/* Desktop Filter */}
              <div className="hidden md:block">
                <SidebarFilter
                  categories={selectedCategoryIds}
                  utils={utils}
                  setUtils={setUtils}
                />
              </div>

              {/* Mobile Filter Button */}
              <div className="flex items-end justify-end mr-2 md:hidden">
                <button
                  type="button"
                  onClick={toggleFilterSidebar}
                  className="flex items-center justify-center px-3 py-1 space-x-2 text-center text-white bg-transparent text-bold hover:bg-gray-300"
                  aria-label={common.filters}
                >
                  <MdOutlineFilterList className="text-xl" />
                  <span>{common.filters}</span>
                </button>
              </div>
            </div>

            {/* Right (ProductGrid component) */}
            <div className="w-full md:col-span-9 lg:col-span-10">
              {query.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <SkeletonCard key={`skeleton-${i}`} />
                  ))}
                </div>
              ) : (
                <>
                  <ProductGrid list={query.data?.data || []} />

                  {query.data?.data?.length > 0 && (
                    <div className="py-20">
                      <Pagination
                        totalItems={query.data?.pagination?.total || 0}
                        itemsPerPage={12}
                        onPageChange={onPageChange}
                        currentPage={utils.currentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </main>

          {/* Sidebar Filter (Mobile Only) */}
          <div
            className={`fixed inset-y-0 right-0 z-[30] w-[80%] max-w-sm bg-black border-l border-white p-5 transform transition-transform duration-300 ${
              isFilterSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            } md:hidden`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-600">
              <h3 className="text-xl font-bold text-white">
                {common.filters}
              </h3>
              <button
                type="button"
                onClick={toggleFilterSidebar}
                className="text-white hover:text-yellow-500"
                aria-label={common.close}
              >
                {common.close}
              </button>
            </div>
            <div className="mt-5">
              <SidebarFilter
                categories={selectedCategoryIds}
                utils={utils}
                setUtils={setUtils}
              />
            </div>
          </div>

          {/* Overlay for Sidebar (Mobile Only) */}
          {isFilterSidebarOpen && (
            <div
              onClick={toggleFilterSidebar}
              className="fixed inset-0 z-12 bg-black bg-opacity-50 md:hidden"
            ></div>
          )}

          <div className="py-10">
            <NewsLetter />
          </div>
        </div>
      </Banner>
    </div>
  );
};

export default ProductListing;
