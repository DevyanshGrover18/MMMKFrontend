/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';
import { getPercentageOf } from '../../utils/globalMethods';
import { Button4 } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';
import { FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { notification } from 'antd';
import { addItemToWishList } from '../../apis/user/wishList';
import { getStoredUserId } from '../../utils/authStorage';
import { convertPrice, formatPrice } from '../../utils/currency';
import { useCurrency } from '../../context/CurrencyContext';
import { resolveAssetUrl } from '../../utils/assetUrl';

const ProductGrid = ({ list = [], textColor = 'white' }) => {
  const {
    content: { common },
  } = useTranslationContext();
  const { currency, rates } = useCurrency();
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
        message: common.signInToContinue,
        placement: 'topRight',
      });
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {list.map((product, index) => (
        <div
          key={product._id}
          className="relative p-4 text-white border border-white"
        >
          <button
            title={common.addToWishlist}
            onClick={() => {
              handleAddWishList(product._id);
            }}
            className="absolute top-2 right-2 z-10"
          >
            <FiHeart
              size={24}
              className="absolute top-2 right-4 text-red-500"
            />
          </button>

          <div className="text-center flex flex-col gap-2">
            {/* Fixed image container */}
            <div className="overflow-hidden h-[350px]">
              <img
                src={
                  getProductImage(product)
                    ? resolveAssetUrl(getProductImage(product))
                    : ''
                }
                alt={getProductName(product)}
                className="h-full w-full object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Price */}
            {product.price && product.websitePrice ? (
              <p className="font-medium text-white flex justify-center items-center gap-2">
                <span className="line-through text-sm">
                  {formatConvertedPrice(product?.price)}
                </span>
                <span className="text-lg font-semibold md:text-xl">
                  {formatConvertedPrice(product?.websitePrice)}
                </span>
              </p>
            ) : (
              <p className="text-white">{common.itemUnavailable}</p>
            )}

            {/* Product Name */}
            <h3 className={`text-base md:text-xl font-bold text-${textColor}`}>
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
              className="!top-0 !py-2 !border"
            >
              {common.buyNow}
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
