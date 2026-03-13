import React, { useState } from 'react';
import { Form, Input, InputNumber, message } from 'antd';
import Banner from '../components/global/Banner';
import CategoryNavBar from '../components/global/CategoryNavBar';
import NewsLetter from '../components/global/NewsLetter';
import Section10 from '../components/home/Section10';
import { CommonButton } from '../components/global/UIButtons';
import { useTranslationContext } from '../context/TranslationContext';
import bg from '../assets/bg.png';
import { createGiftCard } from '../apis/user/giftCard';
import { useNavigate } from 'react-router-dom';

const BuyGiftCard = () => {
  const {
    content: { common, buyGiftCard },
  } = useTranslationContext();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const giftCardName = Form.useWatch('name', form);
  const amount = Form.useWatch('amount', form);

  // Predefined gift card amounts
  const predefinedAmounts = [25, 75, 100, 250, 500, 1000];

  const handleAmountSelect = (amount) => {
    form.setFieldValue('amount', amount);
  };

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value);
    setSelectedAmount(null);
    form.setFieldValue('amount', value);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (!values.amount || values.amount < 10 || values.amount > 10000) {
        message.error('Amount must be between $10 and $10000');
        setLoading(false);
        return;
      }

      if (!values.name || values.name.trim() === '') {
        message.error('Gift card name is required');
        setLoading(false);
        return;
      }

      console.log('Gift Card Purchase Data:', values);

      const res = await createGiftCard(values);

      // Here you would typically call your API
      // await purchaseGiftCard(giftCardData);

      message.success(
        'Gift card purchase initiated! Redirecting to payment...'
      );

      // Reset form
      form.resetFields();
      setLoading(false);
      navigate('/gift-cards');
    } catch (error) {
      console.error('Gift card purchase error:', error);
      message.error('Failed to process gift card purchase');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Banner bg={bg}>
        <div className="w-full md:mt-24 mt-36">
          <CategoryNavBar />

          {/* Header Section */}
          <div className="flex flex-col items-center justify-between w-full gap-4 px-6 py-6 text-black bg-white border-t border-b md:flex-row md:py-12 md:gap-5 md:px-10 lg:px-20">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold md:text-4xl lg:text-5xl">
                {buyGiftCard.title}
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                {buyGiftCard.subtitle}
              </p>
            </div>
            <CommonButton variant={6} isLink to="/product-listings">
              {common.continueShopping}
            </CommonButton>
          </div>

          {/* Main Content */}
          <main className="w-full px-4 py-8 text-black bg-white md:px-6 lg:px-20">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Side - Gift Card Preview */}
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl text-[#D6AD60] font-bold md:text-3xl">
                    {buyGiftCard.mmmkWoodGiftCard}
                  </h2>
                  <p className="mt-2 text-gray-600">
                    {buyGiftCard.giftCardDescription}
                  </p>
                </div>

                {/* Gift Card Visual */}
                <div className="relative mx-auto w-full max-w-md">
                  <div className="bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg shadow-lg p-6 aspect-[1.6/1] flex flex-col justify-between">
                    <div className="text-right flex justify-between">
                      {/* <h3 className="text-xl font-bold text-black">
                        {common.mmmk}
                      </h3>
                      <p className="text-sm text-gray-700">{common.giftCard}</p> */}
                      <img src="/logoIcon1.jpg" className="w-20" alt="" />
                      <img src="/logoIcon2.jpg" alt="" className="w-20" />
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-medium text-black mb-1">
                        {giftCardName || buyGiftCard.giftCardName}
                      </p>
                      <p className="text-3xl font-bold text-black">
                        ${amount || '000'}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        {common.validForOnlinePurchases}
                      </p>
                    </div>

                    <div className="text-left">
                      <p className="text-xs text-gray-600">
                        • {buyGiftCard.termsApply}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gift Card Benefits */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    {buyGiftCard.whyChoose}
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      {buyGiftCard.validForAYear}
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      {buyGiftCard.anyProduct}
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      {buyGiftCard.instantRedemption}
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      {buyGiftCard.giftCardDescription}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Side - Purchase Form */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">
                  {buyGiftCard.purchaseGiftCard}
                </h2>

                {/* Purchase Form */}
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  className="space-y-4"
                >
                  {/* Gift Card Name */}
                  <Form.Item
                    label={
                      <span className="text-lg font-semibold">
                        {buyGiftCard.giftCardName}:
                      </span>
                    }
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: buyGiftCard.pleaseEnterGiftCardName,
                      },
                      {
                        min: 2,
                        message: buyGiftCard.atLeast2Char,
                      },
                      {
                        max: 50,
                        message: buyGiftCard.atMost50Char,
                      },
                    ]}
                  >
                    <Input
                      placeholder={buyGiftCard.namePlaceholder}
                      className="py-3 text-base"
                      onChange={() => {
                        // Trigger re-render to update preview
                        const name = form.getFieldValue('name');
                        // Force component update by setting state
                        setSelectedAmount((prev) => prev);
                      }}
                    />
                  </Form.Item>

                  {/* Amount Selection */}
                  <div className="space-y-4">
                    <label className="text-lg font-semibold">
                      {buyGiftCard.selectAmount}:
                    </label>

                    {/* Predefined Amounts */}
                    <div className="grid grid-cols-3 gap-3">
                      {predefinedAmounts.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleAmountSelect(value)}
                          className={`p-3 border-2 rounded-lg font-semibold transition-all ${
                            value === amount
                              ? 'border-orange-200 bg-orange-50 text-orange-800'
                              : 'border-gray-300 hover:border-orange-200'
                          }`}
                        >
                          ${value}
                        </button>
                      ))}
                    </div>

                    <Form.Item
                      label={`${buyGiftCard.customAmount} ($10 - $10000):`}
                      name="amount"
                      rules={[
                        {
                          required: true,
                          message: buyGiftCard.pleaseEnterGiftCardAmount,
                        },
                      ]}
                    >
                      <InputNumber
                        min={10}
                        max={10000}
                        placeholder={buyGiftCard.enterAmount}
                        className="py-2 text-base w-full"
                      />
                    </Form.Item>
                  </div>

                  {/* Purchase Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">
                      {buyGiftCard.purchaseSummary}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span>{buyGiftCard.giftCardAmount}:</span>
                      <span className="font-bold">${amount || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                      <span className="font-semibold">{common.total}:</span>
                      <span className="font-bold text-lg">
                        ${amount || '0'}
                      </span>
                    </div>
                  </div>

                  <CommonButton
                    type="submit"
                    variant={3}
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading
                      ? `${buyGiftCard.processing}...`
                      : buyGiftCard.purchaseGiftCard}
                  </CommonButton>
                </Form>

                {/* Terms */}
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• {buyGiftCard.term1}</p>
                  <p>• {buyGiftCard.term2}</p>
                  <p>• {buyGiftCard.term3}</p>
                  <p>• {buyGiftCard.term4}</p>
                </div>
              </div>
            </div>
          </main>

          <div className="w-full text-black bg-white">
            <Section10 />
          </div>

          <div className="py-10">
            <NewsLetter />
          </div>
        </div>
      </Banner>
    </div>
  );
};

export default BuyGiftCard;
