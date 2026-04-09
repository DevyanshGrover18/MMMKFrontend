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

const ProductGrid = ({ list = [], textColor = 'white' }) => {
  const {
    content: { common },
  } = useTranslationContext();

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ">
      {list.map((product, index) => (
        <div
          key={product._id}
          className="relative p-4 text-white border border-white"
        >
          {/* Display discount badge only on the first product as an example
          // {product.discount > 0 && (
          //   <div className="absolute top-[-20px] right-[-2%] z-10 bg-black text-white h-20 lg:h-16 lg:w-16 w-20 md:h-20 md:w-20 flex items-center justify-center rounded-full">
          //     <p className="text-[16px] md:text-[22px]"> {product.discount}%</p>
          //   </div>
          // )} */}

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

          <div className="text-center md:h-[450px] h-[550px] flex flex-col">
            <div className="flex-1">
              <img
                src={
                  getProductImage(product)
                    ? import.meta.env.VITE_IMAGE_URL + getProductImage(product)
                    : ''
                }
                alt={getProductName(product)}
                className="h-full w-full mb-4 object-cover"
              />
            </div>
            {/* <p
              className={`font-medium text-${textColor} flex justify-center items-center gap-2`}
            >
              {product?.price && (
                <span className="text-sm text-gray-400 line-through md:text-base">
                  ${product.price}
                </span>
              )}
              <span className="text-lg font-semibold md:text-xl">
                {product?.discount ? product?.discount : "Coming Soon"}
              </span>
            </p> */}
            {product.price && product.websitePrice ? (
              <p
                className={`font-medium text-white flex justify-center items-center gap-2`}
              >
                <span className="line-through text-sm">${product?.price}</span>
                <span className="text-lg font-semibold md:text-xl">
                  ${product?.websitePrice}
                </span>
              </p>
            ) : (
              common.itemUnavailable
            )}
            <h3 className={`text-base md:text-xl font-bold text-${textColor}`}>
              {getProductName(product)}
            </h3>

            {product.brand && (
              <p className={`text-sm font-bold text-${textColor}`}>
                {product.brand}
              </p>
            )}

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
