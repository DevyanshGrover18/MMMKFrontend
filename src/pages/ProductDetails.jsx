import { useEffect, useState } from 'react';

import Banner from '../components/global/Banner';
import ProductGrid from '../components/listing/ProductGrid';
import NewsLetter from '../components/global/NewsLetter';
import Accordion from '../components/details/Accordion';
import Slider from '../components/details/Slider';
import bg from '../assets/bg.png';
import { useQuery } from '@tanstack/react-query';
import Section10 from '../components/home/Section10';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { message, notification } from 'antd';
import { addCartItem } from '../apis/user/cart';
import {
  getProductSkus,
  getRelatedProducts,
  getSingleProduct,
} from '../apis/nonAuth/products';
import { useCart } from '../context/CartProvider';
import CategoryNavBar from '../components/global/CategoryNavBar';
import { IoCartOutline } from 'react-icons/io5';
import { getPercentageOf } from '../utils/globalMethods';
import ProductReview from '../components/details/ProductReview';
import {
  translate,
  translateText,
  useTranslationContext,
  getTranslateProducts,
} from '../context/TranslationContext';
import { CommonButton } from '../components/global/UIButtons';

const ProductDetails = () => {
  const {
    content: { common, productDetails },
    translateLanguage,
  } = useTranslationContext();
  const [count, setCount] = useState(1);
  const params = useParams();
  const { addProductToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [selectedSku, setSelectedSku] = useState(null);

  const query = useQuery({
    queryKey: ['product-details', params.id],
    queryFn: () => getSingleProduct(params.id),
    enabled: Boolean(params.id),
  });
  const SkuQuery = useQuery({
    queryKey: ['product-skus', params.id],
    queryFn: () => getProductSkus(params.id),
    enabled: Boolean(params.id),
  });

  // fetching paginated products
  const list = useQuery({
    queryKey: ['getRelatedProducts', params.id, translateLanguage],
    queryFn: () => getRelatedProducts(params.id, translateLanguage),
  });

  const handleTranslateProductData = async (data, language) => {
    const allFieldsToTranslate = {
      productName: data.productName,
      category: data.category?.name,
      subCategory: data.subCategory,
      productDescription: data.productDescription,
      uses: data.uses,
      benefits: data.benefits,
    };

    const keys = Object.keys(allFieldsToTranslate);

    const translated = {};

    for (const key of keys) {
      if (key === 'subCategory') {
        translated[key] = await translateText(
          allFieldsToTranslate[key],
          language
        );
        continue;
      }
      translated[key] =
        allFieldsToTranslate[key]?.[language] ||
        (await translateText(allFieldsToTranslate[key]?.en, language));
    }

    setProduct({
      ...data,
      translated,
    });
  };

  useEffect(() => {
    console.log(query.data?.data);
    if (query.data?.data) {
      handleTranslateProductData(query.data.data, translateLanguage);
    } else {
      setProduct({});
      setSelectedSku(null);
    }
  }, [query.data, translateLanguage]);

  useEffect(() => {
    if (SkuQuery.data?.length > 0 && !selectedSku) {
      setSelectedSku(SkuQuery.data[0].sku);
    }
  }, [SkuQuery.data]);

  const handleAddToWishList = async (e) => {
    try {
      if (!selectedSku) {
        notification.warning({
          message: 'Please select a ' + query.data?.data?.filters?.join(' / '),
        });
        return;
      }

      // Find the selected SKU details
      const skuDetails = SkuQuery.data?.find((sku) => sku.sku === selectedSku);

      if (!skuDetails) {
        message.error('Selected SKU not found');
        return;
      }

      await addProductToCart({
        productId: params.id,
        sku: selectedSku,
        quantity: count,
        showMessage: true,
      });

      if (e.target?.name === 'buyNow') {
        navigate('/shopping-cart');
      }
    } catch (err) {
      console.log('Error adding to cart:', err);
      message.error(
        err?.response?.data?.message || 'Failed to add item to cart'
      );
    }
  };

  const handleSelectSku = (skuId) => {
    const selected = SkuQuery.data.find((sku) => sku._id === skuId);
    if (selected && selected.quantity > 0) {
      setSelectedSku(selected.sku);
    }
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
        <div className="w-full md:mt-24 mt-36">
          {/* navbar */}
          <CategoryNavBar />

          {/* sort and bread crumbs tab */}

          <div className="flex flex-wrap items-center justify-between w-full gap-5 px-6 py-6 border-t border-b text-2nd md:px-10 lg:px-20">
            <div className="w-full md:w-auto">
              <div className="flex flex-wrap gap-3 mt-2 text-lg md:text-xl md:flex-nowrap md:gap-5">
                <p className="text-base font-bold md:text-xl">
                  {common.home} {'>'} {product?.translated?.category}
                </p>
              </div>
            </div>
          </div>

          {/* main section */}
          <main className="w-full px-4 md:px-6 lg:px-4">
            {/* left */}
            <div className="grid w-full grid-cols-1 lg:grid-cols-12">
              <div className="col-span-1 p-6 border lg:col-span-3 md:p-10">
                <div className="flex flex-col justify-between">
                  <h3 className="text-base font-bold md:text-xl">
                    {product?.translated?.productName}
                  </h3>
                  {/* <p
                  className="my-4 text-sm md:text-base"
                  dangerouslySetInnerHTML={{
                    __html: product?.translated?.productDescription,
                  }}
                ></p> */}
                  {query.data?.data?.price && query.data?.data?.websitePrice ? (
                    <>
                      <h2 className="text-base font-semibold md:text-lg flex gap-3">
                        {query.data?.data?.price && (
                          <span className="line-through text-gray-400 text-sm md:text-base">
                            ${query.data?.data?.price}
                          </span>
                        )}

                        <span className="font-semibold text-lg md:text-xl">
                          {query.data?.data?.discount
                            ? query.data?.data?.websitePrice
                            : 'Coming Soon'}
                        </span>
                      </h2>
                    </>
                  ) : (
                    <>Coming Soon</>
                  )}

                  {query.data?.data?.filters?.length > 0 &&
                    SkuQuery.data?.length > 0 && (
                      <div className="mt-4">
                        Select {query.data?.data?.filters?.join(' / ')}
                        <div className="flex flex-wrap gap-x-2">
                          {SkuQuery.data.map((sku) => (
                            <CommonButton
                              key={sku._id}
                              onClick={() => handleSelectSku(sku._id)}
                              variant={selectedSku === sku.sku ? 7 : 1}
                              size="sm"
                              className="!px-2"
                              disabled={sku.quantity <= 0}
                              title={sku.quantity <= 0 ? 'Out of stock' : ''}
                            >
                              <span>
                                {query.data?.data?.filters
                                  ?.map((filter) => sku.filters[filter])
                                  .join(' / ')}
                              </span>
                              {sku.quantity <= 0 ? (
                                <span className="block text-[8px]">
                                  Out of stock
                                </span>
                              ) : (
                                ''
                              )}
                            </CommonButton>
                          ))}
                        </div>
                      </div>
                    )}

                  <div>
                    <div className="flex items-center gap-3 mt-5">
                      <div className="flex items-center border border-white">
                        <button
                          className="px-3 text-2nd"
                          onClick={() =>
                            setCount((prevData) =>
                              prevData === 1 ? 1 : prevData - 1
                            )
                          }
                        >
                          -
                        </button>
                        <span className="px-3 font-semibold text-3rd">
                          {count}
                        </span>
                        <button
                          className="px-3 text-2nd"
                          onClick={() => setCount(count + 1)}
                        >
                          +
                        </button>
                      </div>
                      {query.data?.data?.price &&
                        query.data?.data?.websitePrice && (
                          <button
                            name="buyNow"
                            onClick={handleAddToWishList}
                            className="w-full px-3 py-1 font-semibold text-black bg-white md:px-4 md:py-2"
                          >
                            {common.buyNow}
                          </button>
                        )}
                    </div>

                    <button
                      name="wishList"
                      onClick={handleAddToWishList}
                      className="w-full py-2 mt-3 font-semibold text-black bg-white"
                    >
                      {common.addToCart}
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-1 p-6 border lg:col-span-5 md:p-8">
                <Slider images={query.data?.data?.images} />
                {/* <div className="absolute top-[%] right-[487px] z-10 hidden md:block ">
                  <div className="flex items-center justify-center w-16 h-16 text-white bg-red-700 rounded-full">
                    30% {t("productDetails.off")}
                  </div>
                </div> */}
              </div>

              <div className="col-span-1 p-6 border lg:col-span-4 md:p-10">
                <Accordion data={product} />
              </div>
            </div>

            {/* product review section */}
            <ProductReview product={params.id} />

            {/* right */}
            <div className="w-full mt-6">
              <div className="flex flex-col items-center justify-between w-full gap-4 px-4 py-6 border border-b md:flex-row md:py-8 lg:py-6 md:gap-5 text-2nd sm:px-10 lg:px-20">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold md:text-xl">
                    {productDetails.relatedProducts}
                  </h3>
                </div>
                <CommonButton
                  variant={4}
                  size="sm"
                  isLink
                  to={`/product-listings?categories=${encodeURIComponent(
                    product?.category?.name?.en || ''
                  )}`}
                >
                  {common.showAll}
                </CommonButton>
              </div>

              <div className="w-full md:col-span-9 lg:col-span-10">
                <ProductGrid list={list.data || []} />
                {/* <div className="py-20">
                  <Pagination
                    totalItems={500}
                    itemsPerPage={50}
                    onPageChange={onPageChange}
                  />
                </div> */}
              </div>
            </div>
          </main>

          <div className="w-full text-black bg-white">
            <Section10></Section10>
          </div>

          <div className="py-10">
            <NewsLetter />
          </div>
        </div>
      </Banner>
    </div>
  );
};

export default ProductDetails;
