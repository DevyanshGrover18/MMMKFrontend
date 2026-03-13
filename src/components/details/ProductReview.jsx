import React, { useEffect, useState } from 'react';
import { Form, Input, Rate, Button, Card, message } from 'antd';
import { addReview } from '../../apis/user/review';
import { useQuery } from '@tanstack/react-query';
import { getReviewsByProduct } from '../../apis/nonAuth/review';
import {
  translate,
  useTranslationContext,
} from '../../context/TranslationContext';

const ProductReview = ({ product }) => {
  const {
    content: { productDetails, common },
    translateLanguage,
  } = useTranslationContext();
  const [form] = Form.useForm();
  const [reviews, setReviews] = useState([]);

  const query = useQuery({
    queryKey: ['product-reviews'],
    queryFn: () => getReviewsByProduct(product),
    enabled: Boolean(product),
  });

  const handleSubmit = async (values) => {
    try {
      const res = await addReview({ ...values, product });
      form.resetFields();
      query.refetch();
      message.success('Thanks for adding review');
    } catch (err) {
      console.log(err);
      message.error(err?.response?.data?.message || 'Failed to add review');
    }
  };

  const handleTranslateReviewData = async (data, language) => {
    const toTranslate = data.map((review) => review.review);

    if (language === 'en')
      setReviews(
        data.map((review) => ({
          ...review,
          translated: {
            review: review.review,
          },
        }))
      );

    const translatedReviews = await translate(toTranslate, language);
    const translatedReviewsData = data.map((review, index) => ({
      ...review,
      translated: {
        review: translatedReviews[index],
      },
    }));

    setReviews(translatedReviewsData);
  };

  useEffect(() => {
    if (query.data?.data?.length > 0) {
      handleTranslateReviewData(
        query.data.data?.map((item) => ({
          rating: item.rating,
          review: item.review,
        })),
        translateLanguage
      );
    } else setReviews([]);
  }, [query.data, translateLanguage]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen  p-4">
      {reviews.length > 0 && (
        <div className="w-full mt-6 p-4  bg-opacity-0 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            {common.reviews}
          </h3>
          {reviews.map((review, index) => (
            <div key={index} className="border-b border-gray-300 pb-4 mb-4">
              <Rate
                allowHalf
                value={review.rating}
                disabled
                className="text-yellow-500"
              />
              <p className="text-white mt-2">{review.translated.review}</p>
            </div>
          ))}
        </div>
      )}
      <div className="w-full p-6 rounded-2xl shadow-lg backdrop-blur-lg bg-white/10">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {productDetails.addYourReview}
        </h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            name="rating"
            label={
              <span className="text-white font-medium">{common.rating}</span>
            }
            rules={[{ required: true, message: 'Please provide a rating!' }]}
          >
            <Rate
              allowHalf
              className="[&_.ant-rate-star]:text-gray-400 [&_.ant-rate-star.ant-rate-star-full]:text-yellow-400"
            />
          </Form.Item>

          <Form.Item
            name="review"
            label={
              <span className="text-white font-medium">
                {productDetails.yourReview}
              </span>
            }
            rules={[{ required: true, message: 'Review cannot be empty!' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Write your review here..."
              className="rounded-lg bg-gray-900/30 text-white border border-gray-600 p-2 
               focus:ring-2 focus:ring-blue-400 focus:bg-gray-900/30 hover:bg-gray-900/30"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-32 bg-blue-500 hover:bg-blue-600 border-none rounded-lg py-1 text-white font-semibold"
            >
              {common.submit}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ProductReview;
