import dayjs from 'dayjs';
import { getPercentageOf, percentageValue } from '../../utils/globalMethods';
import { LuArrowLeft } from 'react-icons/lu';
import { FaExchangeAlt } from 'react-icons/fa';
import {
  translate,
  useTranslationContext,
} from '../../context/TranslationContext';
import { useEffect } from 'react';
import { convertPrice, convertStoredPrice, formatPrice } from '../../utils/currency';
import { useCurrency } from '../../context/CurrencyContext';
import { resolveAssetUrl } from '../../utils/assetUrl';

const ParticularOrder = ({ activeOrder, setActiveOrder }) => {
  const {
    content: { profile, common },
    translateLanguage,
  } = useTranslationContext();
  const { currency, rates } = useCurrency();
  const formatConvertedPrice = (amount) =>
    formatPrice(convertPrice(amount, currency, rates), currency);
  const formatOrderPrice = (amount) =>
    formatPrice(
      convertStoredPrice(amount, activeOrder?.currency, currency, rates),
      currency
    );
  const paymentSummary = {
    subtotal:
      Number(activeOrder?.price?.subtotal) ||
      activeOrder?.products.reduce((a, b) => {
        return a + b?.amount;
      }, 0),
    shippingCharges: Number(activeOrder?.price?.shippingCharges || 0),
    couponDiscount: Number(activeOrder?.price?.couponDiscount || 0),
    total: Number(activeOrder?.price?.total || activeOrder?.amount || 0),
  };

  const handleTranslateProductData = async (data, language) => {
    const allFieldsToTranslate = {
      shippingStreet: data.shippingAddress?.streetAddress,
      shippingCity: data.shippingAddress?.city,
      shippingState: data.shippingAddress?.state,
      shippingPostalCode: data.shippingAddress?.postalCode,
      shippingCountry: data.shippingAddress?.country,
      shippingCompany: data.shippingAddress?.company,
      shippingPhone: data.shippingAddress?.phoneNumber,
      billingStreet: data.billingAddress?.streetAddress,
      billingCity: data.billingAddress?.city,
      billingState: data.billingAddress?.state,
      billingPostalCode: data.billingAddress?.postalCode,
      billingCountry: data.billingAddress?.country,
      billingCompany: data.billingAddress?.company,
      billingPhone: data.billingAddress?.phoneNumber,
    };

    data.products?.forEach((product, i) => {
      allFieldsToTranslate[`productName_${i}`] =
        product?.id?.productName?.en || '';
      allFieldsToTranslate[`productDescription_${i}`] =
        product?.id?.productDescription?.en || '';
    });

    if (language === 'en') {
      setActiveOrder({
        ...data,
        translated: allFieldsToTranslate,
        translatedTo: 'en',
      });
      return;
    }

    const toTranslate = Object.entries(allFieldsToTranslate).reduce(
      (acc, [key, value]) => {
        if (value && typeof value === 'string') {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    const translatedData = await translate(
      Object.values(toTranslate),
      language
    );

    setActiveOrder({
      ...data,
      translated: Object.keys(toTranslate).reduce((acc, key, index) => {
        acc[key] = translatedData[index];
        return acc;
      }, {}),
      translatedTo: language,
    });
  };

  useEffect(() => {
    if (activeOrder && activeOrder.translatedTo !== translateLanguage)
      handleTranslateProductData(activeOrder, translateLanguage);
  }, [activeOrder, translateLanguage]);
  return (
    <div className="container p-4 mx-auto">
      {/* Header */}
      <div className="flex flex-col items-start justify-between pb-4 mb-6 border-b md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          <button onClick={() => setActiveOrder(null)}>
            <LuArrowLeft size={28} />
          </button>
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-semibold">{activeOrder?.orderId}</h2>
            <p className="text-gray-600">
              {dayjs(activeOrder?.createdAt).format('DD/MM/YYYY hh:mm A')}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <span className="px-4 py-2 text-white bg-yellow-400 rounded-full">
            {activeOrder?.status}
          </span>
          <div className="flex ml-4 space-x-4">
            {/* Eye Icon */}
            {/* <button
              aria-label="View details"
              className="transition-all duration-200 hover:text-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.5C7.305 4.5 3.5 8.305 3.5 13C3.5 17.695 7.305 21.5 12 21.5C16.695 21.5 20.5 17.695 20.5 13C20.5 8.305 16.695 4.5 12 4.5ZM12 15.5C11.172 15.5 10.5 14.828 10.5 14C10.5 13.172 11.172 12.5 12 12.5C12.828 12.5 13.5 13.172 13.5 14C13.5 14.828 12.828 15.5 12 15.5Z"
                />
              </svg>
            </button> */}
            {/* Left Arrow Icon */}
            {/* <button
              aria-label="Previous"
              className="transition-all duration-200 hover:text-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button> */}
            {/* Right Arrow Icon */}
            {/* <button
              aria-label="Next"
              className="transition-all duration-200 hover:text-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button> */}
          </div>
        </div>
      </div>

      {/* Product Items */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Product List */}
        <div className="md:col-span-2 h-min">
          {activeOrder?.products.map((product, index) => (
            <div
              key={index}
              className="flex flex-col p-4 transition-all duration-200 bg-gray-100 border rounded-lg hover:shadow-md"
            >
              <div className="flex">
                <img
                  src={resolveAssetUrl(product?.id?.images[0])}
                  className="object-cover w-20 h-20 mr-4 rounded"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    {activeOrder.translated?.[`productName_${index}`]}
                  </h3>
                  <div
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html:
                        activeOrder.translated?.[`productDescription_${index}`],
                    }}
                  ></div>
                  <div className="text-right flex items-center gap-2">
                    {product.id.discount > 0 && (
                      <p className="text-gray-500 text-sm">
                        <span className="line-through">
                          {' '}
                          {formatConvertedPrice(
                            Number(product?.id?.price || 0) *
                              Number(product?.quantity || 0)
                          )}
                        </span>
                        <span className="font-[600]">
                          {' '}
                          {product?.id?.discount} % off
                        </span>
                      </p>
                    )}

                    {/* Discounted Price (10% off) */}
                    <h3 className="text-lg font-semibold text-red-600">
                      {formatConvertedPrice(
                        Number(
                          getPercentageOf(
                            product?.id?.price,
                            product?.id?.discount
                          )
                        ) * Number(product?.quantity || 0)
                      )}
                    </h3>

                    {/* Quantity */}
                    <p className="text-gray-600 text-sm">
                      {profile.quantity}: {product?.quantity}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="p-6 border rounded-lg bg-gray-50">
          {/* Shipping Information */}
          <div className="mb-6">
            <h4 className="font-semibold">{profile.shippingInformation}</h4>
            <p className="text-gray-600">
              {profile.street}: {activeOrder?.translated?.shippingStreet} <br />
              {profile.city}:{' '}
              <strong>{activeOrder?.translated?.shippingCity}</strong> <br />
              {profile.state}: {activeOrder?.translated?.shippingState} <br />
              {profile.postalCode}: {activeOrder?.shippingAddress?.postalCode}{' '}
              <br />
              {profile.country}: {activeOrder?.translated?.shippingCountry}
            </p>
          </div>

          {/* Delivery Information */}
          <div className="mb-6">
            <h4 className="font-semibold">{profile.deliveryInformation}</h4>
            <div className="text-gray-600">
              <span className="font-semibold">{profile.deliveryStatus}: </span>
              <span
                className={`font-medium ${
                  activeOrder?.deliveryStatus === 'Delivered'
                    ? 'text-green-600'
                    : activeOrder?.deliveryStatus === 'In Transit' ||
                        activeOrder?.deliveryStatus === 'Out for Delivery'
                      ? 'text-blue-500'
                      : activeOrder?.deliveryStatus === 'Failed' ||
                          activeOrder?.deliveryStatus === 'Returned'
                        ? 'text-red-500'
                        : 'text-gray-600'
                }`}
              >
                {activeOrder?.deliveryStatus || profile.pending}
              </span>
              <br />
              <span className="font-semibold">{profile.shipper}: </span>
              {activeOrder?.shipperName || '-'} <br />
              <span className="font-semibold">{profile.awb}: </span>
              {activeOrder?.awb || '-'}
              {activeOrder?.trackingUrl && (
                <div className="mt-1">
                  <a
                    href={activeOrder.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline font-medium flex items-center gap-1"
                  >
                    {profile.trackPackage}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="font-semibold">{profile.contactInformation}</h4>
            <p className="text-gray-600">
              <span className="font-semibold">{profile.phone}: </span>
              {activeOrder?.userId?.contactNumber} <br />
              <span className="font-semibold">{profile.email}: </span>
              {activeOrder?.userId?.email}
            </p>
          </div>

          {/* Billing Address */}
          <div className="mb-6">
            <h4 className="font-semibold">{profile.billingAddress}</h4>
            <p className="text-gray-600">
              {profile.street}: {activeOrder?.translated?.billingStreet} <br />
              {profile.city}:{' '}
              <strong>{activeOrder?.translated?.billingCity}</strong> <br />
              {profile.state}: {activeOrder?.translated?.billingState} <br />
              {profile.postalCode}: {activeOrder?.billingAddress?.postalCode}{' '}
              <br />
              {profile.country}: {activeOrder?.translated?.billingCountry}
            </p>
          </div>

          {/* Support Information */}
          <div>
            <h4 className="font-semibold">{profile.support}</h4>
            <p className="text-gray-600">
              {profile.email}: support@mMMMK WODE.com <br />
              {profile.phone}: +971-7837647890
            </p>
          </div>
        </div>

        <div>
          {/* Payment Breakdown */}
          <div className="w-[620px] p-4 mt-6 bg-gray-100 border rounded-lg">
            <h4 className="mb-2 text-lg font-semibold md:text-xl">
              {profile.paymentBreakdown}
            </h4>
            <div className="flex justify-between mb-2 text-gray-600">
              <p>{profile.subTotal}</p>
              <p>{formatOrderPrice(paymentSummary.subtotal)}</p>
            </div>
            {activeOrder?.couponCode && (
              <div className="flex justify-between mb-2 text-gray-600">
                <p>{profile.couponCodeApplied}</p>
                <p>{activeOrder.couponCode}</p>
              </div>
            )}
            {paymentSummary.couponDiscount > 0 && (
              <div className="flex justify-between mb-2 text-green-700">
                <p>{common.coupon}</p>
                <p>-{formatOrderPrice(paymentSummary.couponDiscount)}</p>
              </div>
            )}
            {paymentSummary.shippingCharges > 0 && (
              <div className="flex justify-between mb-2 text-gray-600">
                <p>Shipping</p>
                <p>{formatOrderPrice(paymentSummary.shippingCharges)}</p>
              </div>
            )}

            {/* <div className="flex justify-between mb-2 text-gray-600">
              <p>{t("particularOrder.shippingCharges")}</p>
              <p>{formatCurrency(30, activeOrder?.currency || currencyCode)}</p>
            </div>
            <div className="flex justify-between mb-2 text-gray-600">
              <p>{t("particularOrder.taxes")}</p>
              <p>{formatCurrency(98, activeOrder?.currency || currencyCode)}</p>
            </div> */}
            <div className="flex justify-between pt-2 mt-4 font-semibold text-black border-t">
              <p>{profile.totalPaidByCustomer}</p>
              <p>{formatOrderPrice(paymentSummary.total)}</p>
            </div>
          </div>

          {/* Return / Exchange + Cancel Buttons */}
          <div className="mt-4 flex items-center gap-3">
            {['delivered', 'completed'].includes(
              activeOrder?.status?.toLowerCase()
            ) && (
              <button
                onClick={() =>
                  window.open(
                    `https://juraa.co/general/return-order?id=${activeOrder.orderId}&website=MMMK+WODE`,
                    '_blank'
                  )
                }
                className="px-6 py-2 text-amber-600 transition-all duration-200 border border-amber-600 rounded hover:bg-amber-50 flex items-center gap-2"
              >
                <FaExchangeAlt size={13} />
                Return / Exchange
              </button>
            )}
            <button
              onClick={() => setActiveOrder(null)}
              className="px-16 py-2 text-gray-500 transition-all duration-200 border border-gray-500 rounded hover:bg-gray-100"
            >
              {common.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticularOrder;
