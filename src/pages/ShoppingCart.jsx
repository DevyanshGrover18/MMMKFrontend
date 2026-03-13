/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';

import Banner from '../components/global/Banner';
import ProductGrid from '../components/listing/ProductGrid';
import NewsLetter from '../components/global/NewsLetter';
import bg from '../assets/bg.png';
import Section10 from '../components/home/Section10';
import { Link, NavLink } from 'react-router-dom';
import CategoryNavBar from '../components/global/CategoryNavBar';
import { useCart } from '../context/CartProvider';
import { message } from 'antd';
import {
  getPercentageOf,
  percentageValue,
  showTranslatedMessage,
} from '../utils/globalMethods';
import { applyCoupon, getValidTokens } from '../apis/user/coupon';
import { useQuery } from '@tanstack/react-query';
import { LuX } from 'react-icons/lu';
import {
  translate,
  useTranslationContext,
} from '../context/TranslationContext';
import { Button4, CommonButton } from '../components/global/UIButtons';

const ShoppingCart = () => {
  const {
    content: { cart, common },
    translateLanguage,
  } = useTranslationContext();
  const {
    data,
    refetch,
    couponCode,
    setCouponCode,
    isCouponApply,
    setIsCouponApply,
    setCouponData,
    couponData,
    removeFromCart,
    addProductToCart,
  } = useCart();
  const [subTotal, setSubTotal] = useState(0);
  const [couponInput, setCouponInput] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loadings, setLoadings] = useState([]);

  const addLoading = (index) => {
    setLoadings((prev) => [...prev, index]);
  };
  const removeLoading = (index) => {
    setLoadings((prev) => prev.filter((item) => item !== index));
  };

  const handleApplyCoupon = async (coupon) => {
    if (!coupon) return;

    try {
      const res = await applyCoupon(coupon);
      const validCoupon = res?.data;
      console.log(validCoupon);
      setCouponData(validCoupon);
      setCouponInput('');

      setSubTotal((prevData) => {
        return getPercentageOf(prevData, validCoupon?.discount);
      });
      setCouponCode(validCoupon?.couponCode);
      setIsCouponApply(true);
    } catch (err) {
      console.log(err);
      showTranslatedMessage({
        msg: err?.response?.data?.message || 'Failed to apply coupon',
        language: translateLanguage,
        type: 'error',
      });
      // message.error(err.response?.data?.message || "Failed to apply coupon");
    }
  };

  const handleRemoveCart = async (id, sku, i) => {
    try {
      addLoading(i);
      await removeFromCart({ productId: id, sku, showMessage: false });
      removeLoading(i);
    } catch (err) {
      removeLoading(i);
      console.log(err);
      showTranslatedMessage({
        msg: err?.response?.data?.message || 'Failed to remove cart item',
        language: translateLanguage,
        type: 'error',
      });
      // message.error(
      //   err?.response?.data?.message || "Failed to remove cart item"
      // );
    }
  };

  const handleAdjustQuantity = async (id, sku, action, i) => {
    try {
      addLoading(i);
      if (action === 'inc')
        await addProductToCart({
          productId: id,
          sku,
          quantity: 1,
          showMessage: false,
        });
      else
        await removeFromCart({
          productId: id,
          sku,
          quantity: 1,
          showMessage: false,
        });
      removeLoading(i);
    } catch (err) {
      removeLoading(i);
      console.log(err);
      message.error(
        err?.response?.data?.message || 'Failed to adjust cart item quantity'
      );
    }
  };

  const handleTranslateCartData = async (data, language) => {
    const toTranslate = data.map((item) => ({
      productName: item?.product?.productName?.en,
    }));
    if (language === 'en') {
      return setCartItems(
        data.map((item, index) => ({
          ...item,
          translated: {
            productName: item?.product?.productName?.en,
          },
        }))
      );
    }
    const translatedProductNames = await translate(
      toTranslate.map((item) => item.productName || ''),
      language
    );

    const translatedCartItems = data.map((item, index) => ({
      ...item,
      translated: {
        productName: translatedProductNames[index],
      },
    }));
    setCartItems(translatedCartItems);
  };

  useEffect(() => {
    if (data?.length > 0) {
      handleTranslateCartData(data, translateLanguage);
    } else {
      setCartItems([]);
    }
    setSubTotal(() => {
      return data?.reduce((acc, item) => {
        return (
          acc +
          getPercentageOf(item?.product?.price, item?.product?.discount) *
            item?.quantity
        );
      }, 0);
    });
  }, [data, translateLanguage]);

  console.log(cartItems);

  return (
    <div className="w-full">
      <Banner bg={bg}>
        <div className="w-full py-36 md:py-12 md:mt-12">
          {/* Navbar */}
          <CategoryNavBar />

          {/* Sort and Breadcrumbs */}
          <div className="flex items-center justify-between w-full gap-5 px-5 py-8 text-black bg-white border-t border-b border-black text-2nd md:px-20">
            <h2 className=" text-base md:text-5xl font-[700]">
              {cart.shoppingCart}
            </h2>
          </div>

          {/* Main Section */}
          <main className="w-full text-black bg-white">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              {/* Left Side: Cart Items */}
              <div className="col-span-12 p-2 px-12 border md:px-0 brown-border md:col-span-7 md:p-5">
                {cartItems?.map((list, i) => (
                  <div
                    key={list._id}
                    className="w-full py-6 px-6 md:px-10 mb-10 bg-white shadow-lg rounded-lg"
                  >
                    <div className="flex flex-col items-center md:flex-row md:items-start gap-4">
                      {/* Product Image */}
                      <img
                        src={
                          import.meta.env.VITE_IMAGE_URL +
                          list?.product?.images?.[0]
                        }
                        className="object-cover rounded-lg shadow-md w-[180px] md:w-[220px] border"
                        alt={list.translated?.productName}
                      />

                      {/* Product Info */}
                      <div className="flex-1 mt-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-gray-800">
                            {list.translated?.productName}
                          </h3>
                          {list?.filters && (
                            <span>
                              (
                              {Object.keys(list?.filters || {})
                                .map((key) => `${key}: ${list?.filters[key]}`)
                                .join(', ')}
                              )
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {/* Original Price */}
                          {list?.product?.discount > 0 && (
                            <p className="text-gray-500 text-sm">
                              <span className="line-through">
                                {' '}
                                ${list?.product?.price * list?.quantity}
                              </span>
                              <span className="font-[600]">
                                {' '}
                                {list?.product?.discount} % off
                              </span>
                            </p>
                          )}

                          {/* Discounted Price (10% off) */}
                          <h3 className="flex items-end gap-2">
                            <span className="text-lg font-semibold text-red-600">
                              $
                              {getPercentageOf(
                                list?.product?.price,
                                list?.product?.discount
                              ) * list.quantity}
                            </span>
                            <span className="text-sm text-gray-500">
                              ($
                              {getPercentageOf(
                                list?.product?.price,
                                list?.product?.discount
                              )}{' '}
                              * {list.quantity})
                            </span>
                          </h3>

                          {/* Quantity */}
                        </div>
                      </div>

                      {/* Pricing Section */}
                    </div>
                    <div className="flex items-center justify-end gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <CommonButton
                          onClick={() =>
                            handleAdjustQuantity(
                              list.product?._id,
                              list.sku,
                              'dec',
                              i
                            )
                          }
                          size="xs"
                          variant="primary1"
                          disabled={loadings.includes(i)}
                          className="w-[40px] text-center"
                        >
                          -
                        </CommonButton>
                        <span className="text-gray-600 px-2 text-lg">
                          {list.quantity}
                        </span>
                        <CommonButton
                          onClick={() =>
                            handleAdjustQuantity(
                              list.product?._id,
                              list.sku,
                              'inc',
                              i
                            )
                          }
                          size="xs"
                          variant="primary1"
                          disabled={loadings.includes(i)}
                          className="w-[40px] text-center"
                        >
                          +
                        </CommonButton>
                      </div>

                      {/* Remove Button */}
                      <CommonButton
                        variant="danger1"
                        onClick={() =>
                          handleRemoveCart(list.product?._id, list.sku, i)
                        }
                        size="sm"
                        disabled={loadings.includes(i)}
                      >
                        {common.remove}
                      </CommonButton>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Side: Payment Breakdown */}
              <div className="col-span-12 p-5 border brown-border md:col-span-5 md:p-10">
                <div className="py-5 px-5 md:px-10 bg-[#d9d9d9]">
                  <h3 className="font-bold text-center md:text-left">
                    {cart.paymentBreakdown}
                  </h3>
                  <div className="flex items-center justify-between my-5 ">
                    <p>{common.subTotal}</p>
                    <p>$ {subTotal}</p>
                  </div>

                  {isCouponApply && (
                    <div className="flex items-center my-5 gap-2">
                      <div className="flex items-center flex-1 justify-between">
                        <p>{common.coupon}</p>
                        <p className="text-green-500">
                          - ${' '}
                          {(
                            subTotal / (1 - (couponData?.discount || 0) / 100) -
                            subTotal
                          ).toFixed(2)}{' '}
                          ({couponData?.discount}% off)
                        </p>
                      </div>
                      <button
                        className="mb-2"
                        onClick={() => {
                          setCouponInput('');
                          setCouponCode(null);
                          setIsCouponApply(false);
                          setSubTotal(
                            (prevData) =>
                              +prevData /
                              (1 - (couponData?.discount || 0) / 100)
                          );
                        }}
                      >
                        <LuX />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between my-5 font-bold ">
                    <p>{common.total}</p>
                    <p>${subTotal}</p>
                  </div>

                  {/* Promo Code Section */}
                  <div className="mt-5">
                    <h4 className="font-bold text-center md:text-left">
                      {cart.enterPromoCode}
                    </h4>
                    <div className="flex flex-col lg:flex-row gap-2 my-5">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        className="flex-1 p-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                        placeholder={cart.enterPromoCode}
                      />
                      <button
                        onClick={() => handleApplyCoupon(couponInput)}
                        className="px-6 py-3 font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!couponInput}
                      >
                        {common.apply}
                      </button>
                    </div>
                    <CommonButton
                      variant={6}
                      className="w-full mb-6 ms-auto block"
                      isLink
                      size="md"
                      to="/checkout"
                    >
                      {common.checkout}
                    </CommonButton>
                    {/* <NavLink to="/checkout">
                      <button className="w-full px-3 py-1 font-bold text-white bg-black border-2 md:px-5 md:py-2 brown-border hover:bg-white hover:text-black ">
                        {common.checkout}
                      </button>
                    </NavLink> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Shopping Section */}
            <div className="flex flex-col items-center justify-between w-full gap-5 px-5 py-12 text-black bg-white border-t border-b md:flex-row brown-border text-2nd md:px-20">
              <h2 className="text-base font-bold text-center md:text-4xl md:text-left">
                {cart.continueShopping}
              </h2>
              <CommonButton variant={6} isLink to="/product-listings">
                {common.showAll}
              </CommonButton>
            </div>

            {/* Product Grid Section */}
            <div className="w-full">
              <ProductGrid textColor={'black'} />
            </div>
          </main>

          {/* Additional Section */}
          <div className="w-full text-black bg-white">
            <Section10 />
          </div>

          {/* Newsletter Section */}
          <div className="py-10">
            <NewsLetter />
          </div>
        </div>
      </Banner>
    </div>
  );
};

export default ShoppingCart;
