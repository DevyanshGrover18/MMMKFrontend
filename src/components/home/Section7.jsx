/* eslint-disable react-hooks/rules-of-hooks */

import { Button3, Button4 } from '../global/UIButtons';
import { useTranslationContext } from '../../context/TranslationContext';
import { FiHeart } from 'react-icons/fi';
import { getPercentageOf } from '../../utils/globalMethods';
import { getHomePageBottomSection } from '../../apis/nonAuth/products';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { convertPrice, formatPrice } from '../../utils/currency';
import { useCurrency } from '../../context/CurrencyContext';
import { resolveAssetUrl } from '../../utils/assetUrl';

const section7 = () => {
  const {
    translateLanguage,
    content: { common, homepage },
  } = useTranslationContext();
  const navigate = useNavigate();
  const { currency, rates } = useCurrency();
  const formatConvertedPrice = (amount) =>
    formatPrice(convertPrice(amount, currency, rates), currency);

  const productsQuery = useQuery({
    queryKey: ['home-bottomSection-products'],
    queryFn: () => getHomePageBottomSection(),
  });


  let textColor = 'white';
  const getProductName = (product) =>
    product?.translated?.productName ||
    product?.productName?.[translateLanguage] ||
    product?.productName?.en ||
    '';

  return (
    <div className="relative py-10 bg-[var(--primary-dark)]">
      {/* 30% off badge */}
      {/* <div className="absolute top-[45%] left-[46.5%] z-10 hidden md:block ">
          <div className="flex items-center justify-center text-2xl font-bold text-white bg-black rounded-full w-28 h-28">
            {t("discountLabel")}
          </div>
        </div> */}

      {/* {products.map((product, i) => {
        const productName = homepage[`section9ProductName${i + 1}`];

        return (
          <div
            key={product._id}
            className="flex flex-col items-center w-full p-4 py-8 overflow-hidden transition-all duration-300 transform bg-[var(--primary-beige)] border border-[var(--primary-dark)] shadow-lg"
          >
            <div className="relative flex items-center justify-center w-full h-64 mb-4">
              <img
                src={product.image}
                alt={productName}
                className="object-contain w-full h-full transition-transform duration-300 hover:scale-110"
              />
            </div>

            <div className="flex flex-col items-center px-4 space-y-2 text-center">
              <p className="text-xl font-bold text-gray-800">
                $ {product.price}
              </p>

              <h3 className="max-w-full text-lg font-semibold text-gray-700 truncate">
                {productName}
              </h3>

              {product.brand && (
                <p className={`text-sm font-bold text-${textColor}`}>
                  {product.brand}
                </p>
              )}

              <Button3
                isLink
                to={product._id ? `/product-details/${product._id}` : ""}
                className="!py-2 !mt-4"
              >
                {common.buyNow}
              </Button3>
            </div>
          </div>
        );
      })} */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-0">
        {productsQuery?.data?.map((product, index) => (
          <div
            key={index}
            className="relative p-4 text-white border border-white"
          >
            {/* Display discount badge only on the first product as an example */}
            {/* {product.discount > 0 && (
              <div className="absolute top-[-20px] right-[-2%] z-10 bg-black text-white h-20 lg:h-16 lg:w-16 w-20 md:h-20 md:w-20 flex items-center justify-center rounded-full">
                <p className="text-[16px] md:text-[22px]">
                  {" "}
                  {product.discount}%
                </p>
              </div>
            )} */}

            <div className="text-center min-h-[350px] flex flex-col">
              <div className="flex-1">
                <img
                  src={resolveAssetUrl(product?.image)}
                  alt={getProductName(product) || common.productImageAlt}
                  width="1200"
                  height="1200"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-full min-h-[300px] w-full mb-4 object-cover"
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
                  <span className="line-through text-sm">
                    {formatConvertedPrice(product?.price)}
                  </span>
                  <span className="text-lg font-semibold md:text-xl">
                    {formatConvertedPrice(product?.websitePrice)}
                  </span>
                </p>
              ) : (
                common.itemUnavailable
              )}
              <h3
                className={`text-base md:text-xl font-bold text-${textColor}`}
              >
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
                aria-label={`${common.view} ${getProductName(product)}`}
              >
                {common.view}
              </Button4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default section7;

const products = [
  {
    _id: '6851357a366f5ccebb1b630c',
    // name: "M Queen",
    image: '/staticProduct3.jpg',
    price: 97,
  },
  {
    _id: '685142ee366f5ccebb1b6525',
    // name: "MMM Gift Box Set",
    image: '/staticProduct4.jpg',
    price: 225,
  },
  {
    _id: '6852b786321062a20722d664',
    // name: "MO5",
    image: '/staticProduct1.jpg',
    price: 70,
  },
  {
    _id: '6853f3ece5f7d8af316612ed',
    // name: "MO8",
    image: '/staticProduct2.jpg',
    price: 69,
  },
];
