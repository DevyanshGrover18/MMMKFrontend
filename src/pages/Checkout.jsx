import React from 'react';

import Banner from '../components/global/Banner';
import NewsLetter from '../components/global/NewsLetter';
import CheckoutForm from '../components/checkout/CheckoutForm';
import bg from '../assets/bg.png';
import Section10 from '../components/home/Section10';
import CategoryNavBar from '../components/global/CategoryNavBar';

import { useTranslationContext } from '../context/TranslationContext';
import { CommonButton } from '../components/global/UIButtons';
import { useCart } from '../context/CartProvider';
import { getPercentageOf } from '../utils/globalMethods';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const {
    content: { common, cart },
    translateLanguage,
  } = useTranslationContext();
  const {
    data: cartItems,
    appliedCreditAmount,
    calculateCartSummary,
    couponData,
    isCouponApply,
  } = useCart();

  const liveSummary = calculateCartSummary({
    items: cartItems,
    couponData,
    isCouponApply,
    appliedCreditAmount,
  });

  return (
    <div className="w-full">
      <Banner bg={bg}>
        <div className="w-full py-32 lg:py-24">
          <CategoryNavBar />

          <div className="flex flex-col items-center justify-between w-full gap-4 px-6 py-6 text-black bg-white border-t border-b md:flex-row md:py-12 md:gap-5 md:px-10 lg:px-20 brown-border">
            <h2 className="text-xl font-bold md:text-3xl lg:text-5xl">
              {common.checkout}
            </h2>
            <CommonButton variant={6} isLink to="/product-listings">
              {common.continueShopping}
            </CommonButton>
          </div>

          <main className="w-full text-black bg-white">
            <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">

              {/* Order Summary */}
              <section className="border-b w-3/4 mx-auto brown-border">
                <div className="flex flex-col gap-3 px-2 py-6 md:px-0 md:py-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/50">
                    {common.checkout}
                  </p>
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold md:text-4xl">
                        Order Summary
                      </h3>
                      <p className="mt-2 text-sm text-black/60">
                        Review your selected products before payment.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-black/60">
                      {cartItems?.length || 0} item
                      {cartItems?.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                {cartItems?.length > 0 ? (
                  <div className="border-t brown-border">
                    {cartItems.map((item) => {
                      const unitPrice = Number(
                        getPercentageOf(
                          item?.product?.price || 0,
                          item?.product?.discount || 0
                        )
                      );
                      const lineTotal = unitPrice * Number(item?.quantity || 0);
                      const productImage =
                        item?.product?.image || item?.product?.images?.[0];
                      const productName =
                        item?.product?.translated?.productName ||
                        item?.product?.productName?.[translateLanguage] ||
                        item?.product?.productName?.en;

                      return (
                        <div
                          key={`${item?.product?._id}-${item?.sku}`}
                          className="grid gap-4 border-b px-2 py-5 brown-border md:grid-cols-[120px_minmax(0,1fr)_160px] md:items-center md:px-0"
                        >
                          <Link
                            to={`/product-details/${item?.product?._id}`}
                            className="block overflow-hidden border brown-border bg-[#f8f8f8]"
                          >
                            <img
                              src={
                                productImage
                                  ? import.meta.env.VITE_IMAGE_URL + productImage
                                  : ''
                              }
                              alt={productName || common.productImageAlt}
                              className="h-[100px] w-auto object-cover"
                            />
                          </Link>

                          <div className="min-w-0">
                            <Link
                              to={`/product-details/${item?.product?._id}`}
                              className="block text-md font-bold text-black transition hover:opacity-70 md:text-xl"
                            >
                              {productName}
                            </Link>
                            {item?.filters && Object.keys(item.filters).length > 0 && (
                              <p className="mt-2 text-sm text-black/60">
                                {Object.entries(item.filters)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(' | ')}
                              </p>
                            )}
                            <p className="mt-3 text-sm text-black/60">
                              Qty {item?.quantity} x ${unitPrice.toFixed(2)}
                            </p>
                          </div>

                          <div className="text-left md:text-right">
                            {item?.product?.discount > 0 && (
                              <p className="text-sm text-black/35 line-through">
                                $
                                {(
                                  Number(item?.product?.price || 0) *
                                  Number(item?.quantity || 0)
                                ).toFixed(2)}
                              </p>
                            )}
                            <p className="text-xl font-bold md:text-2xl">
                              ${lineTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Totals */}
                    <div className="px-2 py-6 md:px-0">
                      <div className="ml-auto w-full max-w-sm space-y-3">
                        <div className="flex items-center justify-between text-sm text-black/60">
                          <span>{common.subTotal}</span>
                          <span>${liveSummary.subtotal.toFixed(2)}</span>
                        </div>

                        {liveSummary.couponDiscount > 0 && (
                          <div className="flex items-center justify-between text-sm text-green-700">
                            <span>{common.coupon}</span>
                            <span>-${liveSummary.couponDiscount.toFixed(2)}</span>
                          </div>
                        )}

                        {Number(appliedCreditAmount || 0) > 0 && (
                          <div className="flex items-center justify-between text-sm text-green-700">
                            <span>My Credit</span>
                            <span>-${Number(appliedCreditAmount).toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t pt-3 brown-border text-lg font-bold">
                          <span>{common.total}</span>
                          <span>${liveSummary.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-2 py-10 text-center md:px-0">
                    <p className="text-lg font-medium">{cart.shoppingCart}</p>
                    <p className="mt-2 text-sm text-black/60">
                      Your checkout is empty. Add products before proceeding.
                    </p>
                    <CommonButton
                      variant={6}
                      isLink
                      to="/product-listings"
                      className="mt-5"
                    >
                      {common.showAll}
                    </CommonButton>
                  </div>
                )}
              </section>

              {/* Checkout Form */}
              <section className="pt-8 md:pt-10">
                <CheckoutForm />
              </section>
            </div>

            <div className="flex flex-col items-center justify-between w-full gap-4 px-8 py-8 text-black bg-white border-t border-b md:flex-row md:py-16 md:gap-5 brown-border">
              <h2 className="text-lg font-bold md:text-2xl lg:text-3xl">
                {common.continueShopping}
              </h2>
              <CommonButton variant={6} isLink to="/product-listings">
                {common.showAll}
              </CommonButton>
            </div>
          </main>

          <div className="w-full text-black bg-white">
            <Section10 />
          </div>

          <div className="pb-10">
            <NewsLetter />
          </div>
        </div>
      </Banner>
    </div>
  );
};

export default Checkout;