import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getAddressBook } from '../../apis/user/profile';
import { Country, State } from 'country-state-city';
import {
  useElements,
  useStripe,
  CardElement,
  Elements,
} from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../../apis/user/payment';
import { message } from 'antd';
import { useCart } from '../../context/CartProvider';
import PaymentModal from './PaymentModal';
import { createManualOrder } from '../../apis/user/order';
import { useNavigate } from 'react-router-dom';
import countriesList from '../../countries.json';
import rateByWeight from '../../rateByWeight.json';
import { useTranslationContext } from '../../context/TranslationContext';
import { CommonButton } from '../global/UIButtons';
import { loadStripe } from '@stripe/stripe-js';

const calculateShippingCharges = (country, weight) => {
  const countryData = Country.getCountryByCode(country);
  const rate = countryData?.name
    ? rateByWeight[Number(weight)]?.[
        countriesList?.countries[countryData?.name]
      ]
    : 0;
  return parseFloat(rate) || 0;
};

export default function CheckoutForm() {
  const {
    content: { common, checkout },
  } = useTranslationContext();
  const navigate = useNavigate();
  const {
    data: cartData,
    couponCode,
    isCouponApply,
    setIsCouponApply,
    setCouponCode,
  } = useCart();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shippingStateList, setShippingStateList] = useState([]);
  const [billingStateList, setBillingStateList] = useState([]);
  const [formData, setFormData] = useState({
    shipping_firstName: '',
    shipping_lastName: '',
    shipping_streetAddress: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postalCode: '',
    shipping_country: '',
    shipping_company: '',
    shipping_phoneNumber: '',
    shipping_landmark: '',
    billing_firstName: '',
    billing_lastName: '',
    billing_streetAddress: '',
    billing_city: '',
    billing_state: '',
    billing_postalCode: '',
    billing_country: '',
    billing_company: '',
    billing_phoneNumber: '',
    billing_landmark: '',
  });
  const [totalProductWeight, setTotalProductWeight] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [isSameAsShipping, setIsSameAsShipping] = useState(false);

  const query = useQuery({
    queryKey: ['address-book'],
    queryFn: () => getAddressBook(),
  });

  const handleChange = (e) => {
    if (e.target?.name === 'shipping_country') {
      setShippingStateList(State.getStatesOfCountry(e.target?.value));
    }
    if (e.target?.name === 'billing_country') {
      setBillingStateList(State.getStatesOfCountry(e.target?.value));
    }
    setFormData({ ...formData, [e.target?.name]: e.target?.value });
  };

  const handleSameAsShippingChange = (e) => {
    const isChecked = e.target.checked;
    setIsSameAsShipping(isChecked);

    if (isChecked) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        billing_firstName: prevFormData.shipping_firstName,
        billing_lastName: prevFormData.shipping_lastName,
        billing_streetAddress: prevFormData.shipping_streetAddress,
        billing_city: prevFormData.shipping_city,
        billing_state: prevFormData.shipping_state,
        billing_postalCode: prevFormData.shipping_postalCode,
        billing_country: prevFormData.shipping_country,
        billing_company: prevFormData.shipping_company,
        billing_phoneNumber: prevFormData.shipping_phoneNumber,
        billing_landmark: prevFormData.shipping_landmark,
      }));
      setBillingStateList(State.getStatesOfCountry(formData.shipping_country));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        billing_firstName: '',
        billing_lastName: '',
        billing_streetAddress: '',
        billing_city: '',
        billing_state: '',
        billing_postalCode: '',
        billing_country: '',
        billing_company: '',
        billing_phoneNumber: '',
        billing_landmark: '',
      }));
      setBillingStateList([]);
    }
  };

  const handlePaymentChoice = async (mode) => {
    setIsModalVisible(false);

    const { shippingAddress, billingAddress } =
      formatShippingBillingAddress(formData);

    if (mode === 'card') {
      try {
        setLoading(true);

        const stripePromise = await loadStripe(
          import.meta.env.VITE_STRIPE_API_KEY
        );
        const data = await createPaymentIntent({
          products: cartData,
          shippingAddress,
          billingAddress,
          shippingCharges,
          couponCode: isCouponApply ? couponCode : null,
        });

        const result = await stripePromise.redirectToCheckout({
          sessionId: data.id,
        });

        if (result.error) {
          message.error(result.error.message);
        }
        message.success('Redirecting to payment gateway...');
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.log(err);
        message.error(err?.response?.data?.message || 'Failed to checkout');
      }
    } else {
      try {
        const res = await createManualOrder({
          products: cartData,
          shippingAddress,
          billingAddress,
          shippingCharges,
          couponCode: isCouponApply ? couponCode : null,
        });
        message.success('Order placed successfully');
        setCouponCode(null);
        setIsCouponApply(false);
        return navigate(`/thank-you/${res?.data}`);
      } catch (err) {
        console.log(err);
        message.error(err?.response?.data?.message);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalVisible(true);
  };

  useEffect(() => {
    if (query.data) {
      setShippingStateList(() =>
        State.getStatesOfCountry(query.data?.data.shippingAddress?.country)
      );

      setBillingStateList(() =>
        State.getStatesOfCountry(query.data?.data.billingAddress?.country)
      );

      setFormData({
        shipping_firstName: query.data?.data.shippingAddress?.firstName || '',
        shipping_lastName: query.data?.data.shippingAddress?.lastName || '',
        shipping_streetAddress:
          query.data?.data.shippingAddress?.street_address || '',
        shipping_city: query.data?.data.shippingAddress?.city || '',
        shipping_state: query.data?.data.shippingAddress?.state || '',
        shipping_postalCode: query.data?.data.shippingAddress?.postalCode || '',
        shipping_country: query.data?.data.shippingAddress?.country || '',
        shipping_company: query.data?.data.shippingAddress?.company || '',
        shipping_phoneNumber:
          query.data?.data.shippingAddress?.phone_number || '',
        shipping_landmark: query.data?.data.shippingAddress?.landmark || '',
        billing_firstName: query.data?.data.billingAddress?.firstName || '',
        billing_lastName: query.data?.data.billingAddress?.lastName || '',
        billing_streetAddress: query.data?.data.billingAddress?.city || '',
        billing_city: query.data?.data.billingAddress?.city || '',
        billing_state: query.data?.data.billingAddress?.state || '',
        billing_postalCode: query.data?.data.billingAddress?.postalCode || '',
        billing_country: query.data?.data.billingAddress?.state || '',
        billing_company: query.data?.data.billingAddress?.company || '',
        billing_phoneNumber:
          query.data?.data.billingAddress?.phone_number || '',
        billing_landmark: query.data?.data.billingAddress?.landmark || '',
      });
    }
  }, [query.data]);

  // calculating total products weight in cart
  useEffect(() => {
    setTotalProductWeight(() => {
      return cartData?.reduce((acc, list) => {
        const weight = parseFloat(list?.product?.weight) || 0;
        const quantity = parseFloat(list?.quantity) || 0;
        return acc + weight * quantity;
      }, 0);
    });
  }, [cartData]);

  // calculating shipping charges
  useEffect(() => {
    if (totalProductWeight) {
      setShippingCharges(() =>
        calculateShippingCharges(formData.shipping_country, totalProductWeight)
      );
    }
  }, [totalProductWeight, formData.shipping_country]);

  return (
    <>
      {/* <Elements stripe={stripePromise}> */}
      <PaymentModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectPayment={handlePaymentChoice}
        checkout={checkout}
      />

      <div className="max-w-sm  mx-auto bg-white  rounded-2xl p-5 border border-gray-200">
        <div className="flex  justify-between text-gray-600 text-sm border-b pb-2 mb-2">
          <span>Tax</span>
          <span className="font-medium">$11.21</span>
        </div>
        <div className="flex  justify-between text-gray-600 text-sm border-b pb-2 mb-2">
          <span>COD</span>
          <span className="font-medium">$10.31</span>
        </div>
        <div className="flex  justify-between text-gray-600 text-sm border-b pb-2 mb-2">
          <span>Extra Charges</span>
          <span className="font-medium">$232</span>
        </div>
        <div className="flex  justify-between text-gray-600 text-sm border-b pb-2 mb-2">
          <span>{checkout.shippingCharges}</span>
          <span className="font-medium">${shippingCharges}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl p-6 mx-auto">
        <div className="flex flex-col gap-10 md:flex-row">
          {/* Shipping Address */}
          <div className="w-full space-y-6">
            <h2 className="pb-2 text-xl font-normal md:text-5xl">
              {checkout.shippingAddress}
              <div className="bg-gray-900 border-b w-16 md:w-44 md:h-[4px] md:mt-4"></div>
            </h2>

            <div className="grid grid-cols-2 gap-6 md:text-lg sm:grid-cols-2">
              <input
                name="shipping_firstName"
                value={formData.shipping_firstName}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={'First Name'}
                required
              />
              <input
                name="shipping_lastName"
                value={formData.shipping_lastName}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={'Last Name'}
                required
              />
            </div>

            <input
              name="shipping_streetAddress"
              value={formData.shipping_streetAddress}
              onChange={handleChange}
              className="w-full md:h-[65px] md:text-lg border-b focus:outline-none"
              placeholder={checkout.streetAddress}
              required
            />

            <div className="grid grid-cols-2 gap-6 md:text-lg sm:grid-cols-2">
              <select
                name="shipping_country"
                value={formData.shipping_country}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                required
              >
                <option value="" disabled>
                  {checkout.country}
                </option>
                {Country.getAllCountries().map((list) => {
                  return (
                    <option value={list?.isoCode}>
                      {list?.name} {list?.flag}
                    </option>
                  );
                })}
              </select>
              <select
                name="shipping_state"
                value={formData.shipping_state}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                required
              >
                <option value="" disabled>
                  {checkout.state}
                </option>
                {shippingStateList?.map((list) => {
                  return (
                    <option value={list.isoCode}>
                      {list?.name} {list?.flag}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6 md:text-lg sm:grid-cols-2">
              <input
                name="shipping_postalCode"
                value={formData.shipping_postalCode}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={checkout.postalCode}
                required
              />
              <input
                name="shipping_city"
                value={formData.shipping_city}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={checkout.city}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:text-lg sm:grid-cols-2">
              <input
                name="shipping_landmark"
                value={formData.shipping_landmark}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={'Landmark'}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:text-lg sm:grid-cols-2">
              <input
                name="shipping_company"
                value={formData.shipping_company}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={checkout.company}
              />
              <input
                name="shipping_phoneNumber"
                value={formData.shipping_phoneNumber}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={checkout.phoneNumber}
                required
              />
            </div>
          </div>

          {/* Divider */}
          <div className="w-px mx-4 bg-black h-[70vh] md:h-auto md:block hidden"></div>

          {/* Billing Address */}
          <div className="w-full space-y-6">
            <h2 className="pb-2 text-xl font-normal md:text-5xl">
              {checkout.billingAddress}
              <div className="bg-gray-900 border-b w-16 md:w-44 md:h-[4px] md:mt-4"></div>
            </h2>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="sameAsShipping"
                checked={isSameAsShipping}
                onChange={handleSameAsShippingChange}
                className="mr-2"
              />
              <label htmlFor="sameAsShipping">Same as Shipping Address</label>
            </div>

            <div className="grid grid-cols-2 gap-6 md:text-lg sm:grid-cols-2">
              <input
                name="billing_firstName"
                value={formData.billing_firstName}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={'First Name'}
                required
                disabled={isSameAsShipping}
              />
              <input
                name="billing_lastName"
                value={formData.billing_lastName}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={'Last Name'}
                required
                disabled={isSameAsShipping}
              />
            </div>

            <input
              name="billing_streetAddress"
              value={formData.billing_streetAddress}
              onChange={handleChange}
              className="w-full md:text-lg md:h-[65px] border-b focus:outline-none"
              placeholder={checkout.streetAddress}
              required
              disabled={isSameAsShipping}
            />
            <div className="grid grid-cols-2 gap-6 md:text-lg sm:grid-cols-2">
              <select
                name="billing_country"
                value={formData.billing_country}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                required
                disabled={isSameAsShipping}
              >
                <option value="" disabled>
                  {checkout.country}
                </option>
                {Country.getAllCountries().map((list) => {
                  return (
                    <option value={list.isoCode}>
                      {list?.name} {list?.flag}
                    </option>
                  );
                })}
              </select>

              <select
                name="billing_state"
                value={formData.billing_state}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                required
                disabled={isSameAsShipping}
              >
                <option value="" disabled>
                  {checkout.state}
                </option>
                {billingStateList?.map((list) => {
                  return (
                    <option value={list.isoCode}>
                      {list?.name} {list?.flag}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-6 md:text-lg sm:grid-cols-2">
              <input
                name="billing_postalCode"
                value={formData.billing_postalCode}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={checkout.postalCode}
                required
                disabled={isSameAsShipping}
              />
              <input
                name="billing_city"
                value={formData.billing_city}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={checkout.city}
                required
                disabled={isSameAsShipping}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:text-lg sm:grid-cols-2">
              <input
                name="billing_landmark"
                value={formData.billing_landmark}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={'Landmark'}
                disabled={isSameAsShipping}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:text-lg sm:grid-cols-2">
              <input
                name="billing_company"
                value={formData.billing_company}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={checkout.company}
                disabled={isSameAsShipping}
              />
              <input
                name="billing_phoneNumber"
                value={formData.billing_phoneNumber}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={checkout.phoneNumber}
                required
                disabled={isSameAsShipping}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <CommonButton variant={6} disabled={loading} type="submit">
            {loading ? `${common.pleaseWait} ...` : `${common.checkout}`}
          </CommonButton>
        </div>
      </form>
      {/* </Elements> */}
    </>
  );
}

const formatShippingBillingAddress = (data) => {
  const shippingAddress = {
    firstName: data.shipping_firstName,
    lastName: data.shipping_lastName,
    streetAddress: data.shipping_streetAddress,
    country: data.shipping_country,
    state: data.shipping_state,
    postalCode: data.shipping_postalCode,
    city: data.shipping_city,
    company: data.shipping_company,
    phoneNumber: data.shipping_phoneNumber,
    landmark: data.shipping_landmark,
  };

  const billingAddress = {
    firstName: data.billing_firstName,
    lastName: data.billing_lastName,
    streetAddress: data.billing_streetAddress,
    country: data.billing_country,
    state: data.billing_state,
    postalCode: data.billing_postalCode,
    city: data.billing_city,
    company: data.billing_company,
    phoneNumber: data.billing_phoneNumber,
    landmark: data.billing_landmark,
  };

  return { shippingAddress, billingAddress };
};
