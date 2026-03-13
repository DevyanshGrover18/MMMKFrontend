/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import Banner from '../components/global/Banner';
import ProductGrid from '../components/listing/ProductGrid';
import NewsLetter from '../components/global/NewsLetter';
import CheckoutForm from '../components/checkout/CheckoutForm';
import bg from '../assets/bg.png';
import Section10 from '../components/home/Section10';
import CategoryNavBar from '../components/global/CategoryNavBar';

import { useTranslationContext } from '../context/TranslationContext';
import { CommonButton } from '../components/global/UIButtons';

const Checkout = () => {
  const {
    content: { common },
  } = useTranslationContext();

  return (
    <div className="w-full">
      <Banner bg={bg}>
        <div className="w-full py-32 lg:py-24">
          {/* navbar */}
          <CategoryNavBar />

          {/* sort and bread crumbs tab */}

          <div className="flex flex-col items-center justify-between w-full gap-4 px-6 py-6 text-black bg-white border-t border-b md:flex-row md:py-12 md:gap-5 md:px-10 lg:px-20 brown-border">
            <h2 className="text-xl font-bold md:text-3xl lg:text-5xl ">
              {common.checkout}
            </h2>
            <CommonButton variant={6} isLink to="/product-listings">
              {common.continueShopping}
            </CommonButton>
          </div>

          {/* main section */}
          <main className="w-full text-black bg-white">
            {/* left - Form Section */}
            <div className="w-full mb-8">
              {/* Responsive form section */}
              <CheckoutForm />
            </div>

            {/* Middle Section with Heading and Button */}
            <div className="flex flex-col items-center justify-between w-full gap-4 px-8 py-8 text-black bg-white border-t border-b md:flex-row md:py-16 md:gap-5 brown-border">
              <h2 className="text-lg font-bold md:text-2xl lg:text-3xl">
                {common.continueShopping}
              </h2>
              <CommonButton variant={6} isLink to="/product-listings">
                {common.showAll}
              </CommonButton>
            </div>

            {/* right - Product Grid Section */}
            <div className="w-full col-span-10">
              {/* Responsive product grid */}
              <ProductGrid textColor="black" />
            </div>
          </main>

          <div className="w-full text-black bg-white">
            <Section10></Section10>
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
