/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';
import { Button4 } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';
import { FiHeart } from 'react-icons/fi';
import { notification } from 'antd';
import { addItemToWishList } from '../../apis/user/wishList';
import { getStoredUserId } from '../../utils/authStorage';
import { convertPrice, formatPrice } from '../../utils/currency';
import { useCurrency } from '../../context/CurrencyContext';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { useQueryClient } from '@tanstack/react-query';
import { getSingleProduct, getProductSkus } from '../../apis/nonAuth/products';

const ProductGrid = ({ list = [], textColor = 'white' }) => {
  const {
    content: { common },
  } = useTranslationContext();
  const { currency, rates } = useCurrency();
  const queryClient = useQueryClient();

  const prefetchProductDetails = (productId) => {
    queryClient.prefetchQuery({
      queryKey: ['product-details', productId],
      queryFn: () => getSingleProduct(productId),
      staleTime: 60000,
    });
    queryClient.prefetchQuery({
      queryKey: ['product-skus', productId],
      queryFn: () => getProductSkus(productId),
      staleTime: 60000,
    });
  };

  const formatConvertedPrice = (amount) =>
    formatPrice(convertPrice(amount, currency, rates), currency);


  const getProductName = (product) =>
    product?.translated?.productName ||
    product?.productName?.en ||
    product?.productName ||
    common.itemUnavailable;

  const getProductImage = (product) =>
    product?.image || product?.images?.[0] || '';

  const handleAddWishList = async (id) => {
    const userId = getStoredUserId();
    if (!userId) {
      notification.error({
        message: common.signInToContinue || 'Please sign in to continue',
        placement: 'topRight',
      });
      navigate('/auth', { state: { from: window.location.pathname } });
      return null;
    }

    try {
      await addItemToWishList({
        productId: id,
        userId,
      });
      notification.success({
        message: common.wishlistAdded,
        placement: 'topRight',
      });
    } catch (err) {
      console.log(err);
      notification.error({
        message: common.wishlistAddFailed,
        placement: 'topRight',
      });
    }
  };

  const navigate = useNavigate();
  return list?.length > 0 ? (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      {list.map((product, index) => (
        <div
          key={product._id}
          onMouseEnter={() => prefetchProductDetails(product._id)}
          className="relative border border-white p-2 text-white sm:p-4"
        >
          <button
            type="button"
            title={common.addToWishlist}
            onClick={() => {
              handleAddWishList(product._id);
            }}
            aria-label={`${common.addToWishlist} ${getProductName(product)}`}
            className="absolute top-2 right-2 z-10"
          >
            <FiHeart className="absolute right-1 top-1 h-5 w-5 text-red-500 sm:right-4 sm:top-2 sm:h-6 sm:w-6" />
          </button>

          <div className="flex flex-col gap-2 text-center">
            {/* Fixed image container */}
            <div className="h-[210px] overflow-hidden sm:h-[300px] md:h-[350px] bg-gray-800 flex items-center justify-center">
              {getProductImage(product) ? (
                <img
                  src={resolveAssetUrl(getProductImage(product))}
                  alt={getProductName(product)}
                  width="400"
                  height="500"
                  className="h-full w-full object-cover object-top transition-opacity duration-300"
                  loading={index < 4 ? 'eager' : 'lazy'}
                  fetchPriority={index < 4 ? 'high' : 'auto'}
                  decoding="async"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                />
              ) : (
                <div className="text-gray-500 text-xs italic">{common.itemUnavailable}</div>
              )}
            </div>

            {/* Price */}
            {product.price && product.websitePrice ? (
              <p className="flex flex-wrap items-center justify-center gap-1 text-white sm:gap-2 sm:font-medium">
                <span className="text-xs line-through sm:text-sm">
                  {formatConvertedPrice(product?.price)}
                </span>
                <span className="text-sm font-semibold sm:text-lg md:text-xl">
                  {formatConvertedPrice(product?.websitePrice)}
                </span>
              </p>
            ) : (
              <p className="text-white">{common.itemUnavailable}</p>
            )}

            {/* Product Name */}
            <h3 className={`text-sm sm:text-base md:text-xl font-bold text-${textColor}`}>
              {getProductName(product)}
            </h3>

            {/* Brand */}
            {product.brand && (
              <p className={`text-sm font-bold text-${textColor}`}>
                {product.brand}
              </p>
            )}

            {/* Buy Now Button */}
            <Button4
              onClick={() => navigate(`/product-details/${product._id}`)}
              className="!top-0 !border !px-2 !py-1 !text-xs sm:!px-4 sm:!py-2 sm:!text-sm"
              disabled={
                product.quantity <= 0 || product.status === 'Out of stock'
              }
            >
              {product.quantity <= 0 || product.status === 'Out of stock'
                ? common.soldOut
                : common.buyNow}
            </Button4>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center font-semibold text-lg py-20">
      {common.noResultsFound}
    </div>
  );
};

export default ProductGrid;
