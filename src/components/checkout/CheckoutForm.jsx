import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  getAddressBook,
  getMyAccount,
  updateAddressBook,
} from '../../apis/user/profile';
import { Country, State } from 'country-state-city';
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
import { isUserSignedIn } from '../../utils/globalMethods';

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
  const queryClient = useQueryClient();
  const {
    data: cartData,
    couponCode,
    isCouponApply,
    setIsCouponApply,
    setCouponCode,
    couponData,
    calculateCartSummary,
    setCheckoutSummary,
    appliedCreditAmount,
    setAppliedCreditAmount,
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

  const derivedSummary = calculateCartSummary({
    items: cartData,
    couponData,
    isCouponApply,
    shippingCharges,
    appliedCreditAmount,
  });

  const query = useQuery({
    queryKey: ['address-book'],
    queryFn: () => getAddressBook(),
  });
  const profileQuery = useQuery({
    queryKey: ['my-account'],
    queryFn: () => getMyAccount(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target || {};
    if (name === 'shipping_country') {
      setShippingStateList(State.getStatesOfCountry(value));
    }
    if (name === 'billing_country') {
      setBillingStateList(State.getStatesOfCountry(value));
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSameAsShippingChange = (e) => {
    const isChecked = e.target.checked;
    setIsSameAsShipping(isChecked);

    if (isChecked) {
      setFormData((prevFormData) => {
        const nextFormData = {
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
        };
        setBillingStateList(
          State.getStatesOfCountry(nextFormData.shipping_country)
        );
        return nextFormData;
      });
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

  const persistAddressBook = async (shippingAddress, billingAddress) => {
    if (!isUserSignedIn()) return;
    try {
      const response = await updateAddressBook({ shippingAddress, billingAddress });
      queryClient.setQueryData(['address-book'], (oldData) => ({
        ...(oldData || {}),
        data: response?.data || {
          ...(oldData?.data || {}),
          shippingAddress,
          billingAddress,
        },
      }));
    } catch (error) {
      console.error('Failed to persist checkout address to profile:', error);
    }
  };

  const handlePaymentChoice = async (mode) => {
    setIsModalVisible(false);

    const { shippingAddress, billingAddress } =
      formatShippingBillingAddress(formData);

    await persistAddressBook(shippingAddress, billingAddress);

    if (mode === 'card') {
      try {
        setLoading(true);
        const publishableKey = getStripePublishableKey();
        if (!publishableKey) {
          throw new Error('Stripe publishable key is not configured');
        }
        const stripePromise = await loadStripe(publishableKey);
        const data = await createPaymentIntent({
          products: cartData,
          shippingAddress,
          billingAddress,
          shippingCharges,
          couponCode: isCouponApply ? couponCode : null,
          creditsUsed: appliedCreditAmount,
          totalAmount: derivedSummary.total, // ← final calculated total
        });

        if (data?.paidWithCredits && data?.orderId) {
          setCouponCode(null);
          setIsCouponApply(false);
          setAppliedCreditAmount(0);
          navigate(`/order-success/${data.orderId}`);
          return;
        }

        const result = await stripePromise.redirectToCheckout({
          sessionId: data.id,
        });

        if (result.error) {
          message.error(result.error.message);
          setLoading(false);
          return;
        }
        message.success(checkout.redirectingToPaymentGateway);
        setAppliedCreditAmount(0);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        message.error(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            checkout.checkoutFailed
        );
      }
    } else {
      try {
        const res = await createManualOrder({
          products: cartData,
          shippingAddress,
          billingAddress,
          shippingCharges,
          couponCode: isCouponApply ? couponCode : null,
          creditsUsed: appliedCreditAmount,
          totalAmount: derivedSummary.total, // ← final calculated total
        });
        message.success(res?.message || checkout.orderPlacedSuccessfully);
        setCouponCode(null);
        setIsCouponApply(false);
        setAppliedCreditAmount(0);
        return navigate(`/order-success/${res?.data}`);
      } catch (err) {
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
      const shippingAddress = query.data?.data?.shippingAddress || {};
      const billingAddress = query.data?.data?.billingAddress || {};

      setShippingStateList(() =>
        State.getStatesOfCountry(shippingAddress?.country)
      );
      setBillingStateList(() =>
        State.getStatesOfCountry(billingAddress?.country)
      );

      setFormData({
        shipping_firstName:
          shippingAddress?.firstName ||
          shippingAddress?.first_name ||
          profileQuery.data?.data?.firstName ||
          '',
        shipping_lastName:
          shippingAddress?.lastName ||
          shippingAddress?.last_name ||
          profileQuery.data?.data?.lastName ||
          '',
        shipping_streetAddress:
          shippingAddress?.street_address ||
          shippingAddress?.streetAddress ||
          '',
        shipping_city: shippingAddress?.city || '',
        shipping_state: shippingAddress?.state || '',
        shipping_postalCode: shippingAddress?.postalCode || '',
        shipping_country: shippingAddress?.country || '',
        shipping_company: shippingAddress?.company || '',
        shipping_phoneNumber:
          shippingAddress?.phone_number ||
          shippingAddress?.phoneNumber ||
          profileQuery.data?.data?.contactNumber ||
          '',
        shipping_landmark: shippingAddress?.landmark || '',
        billing_firstName:
          billingAddress?.firstName ||
          billingAddress?.first_name ||
          profileQuery.data?.data?.firstName ||
          '',
        billing_lastName:
          billingAddress?.lastName ||
          billingAddress?.last_name ||
          profileQuery.data?.data?.lastName ||
          '',
        billing_streetAddress:
          billingAddress?.street_address ||
          billingAddress?.streetAddress ||
          '',
        billing_city: billingAddress?.city || '',
        billing_state: billingAddress?.state || '',
        billing_postalCode: billingAddress?.postalCode || '',
        billing_country: billingAddress?.country || '',
        billing_company: billingAddress?.company || '',
        billing_phoneNumber:
          billingAddress?.phone_number ||
          billingAddress?.phoneNumber ||
          profileQuery.data?.data?.contactNumber ||
          '',
        billing_landmark: billingAddress?.landmark || '',
      });
    }
  }, [query.data, profileQuery.data]);

  useEffect(() => {
    if (profileQuery.data?.data) {
      const profile = profileQuery.data.data;
      setFormData((prev) => ({
        ...prev,
        shipping_firstName: prev.shipping_firstName || profile.firstName || '',
        shipping_lastName: prev.shipping_lastName || profile.lastName || '',
        shipping_phoneNumber:
          prev.shipping_phoneNumber || profile.contactNumber || '',
        billing_firstName: prev.billing_firstName || profile.firstName || '',
        billing_lastName: prev.billing_lastName || profile.lastName || '',
        billing_phoneNumber:
          prev.billing_phoneNumber || profile.contactNumber || '',
      }));
    }
  }, [profileQuery.data]);

  useEffect(() => {
    setTotalProductWeight(() => {
      return cartData?.reduce((acc, list) => {
        const weight = parseFloat(list?.product?.weight) || 0;
        const quantity = parseFloat(list?.quantity) || 0;
        return acc + weight * quantity;
      }, 0);
    });
  }, [cartData]);

  useEffect(() => {
    if (totalProductWeight) {
      setShippingCharges(() =>
        calculateShippingCharges(formData.shipping_country, totalProductWeight)
      );
    } else {
      setShippingCharges(0);
    }
  }, [totalProductWeight, formData.shipping_country]);

  useEffect(() => {
    setCheckoutSummary(derivedSummary);
  }, [derivedSummary, setCheckoutSummary]);

  return (
    <>
      <PaymentModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectPayment={handlePaymentChoice}
        checkout={checkout}
      />

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
                placeholder={checkout.firstName}
                required
              />
              <input
                name="shipping_lastName"
                value={formData.shipping_lastName}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={checkout.lastName}
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
                <option value="" disabled>{checkout.country}</option>
                {Country.getAllCountries().map((list) => (
                  <option key={list.isoCode} value={list?.isoCode}>
                    {list?.name} {list?.flag}
                  </option>
                ))}
              </select>
              <select
                name="shipping_state"
                value={formData.shipping_state}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                required
              >
                <option value="" disabled>{checkout.state}</option>
                {shippingStateList?.map((list) => (
                  <option key={list.isoCode} value={list.isoCode}>
                    {list?.name} {list?.flag}
                  </option>
                ))}
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
                placeholder={checkout.landmark}
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

            {/* Shipping charges display */}
            {shippingCharges > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping Charges</span>
                  <span className="font-semibold">${shippingCharges.toFixed(2)}</span>
                </div>
              </div>
            )}
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
              <label htmlFor="sameAsShipping">
                {checkout.sameAsShippingAddress}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-6 md:text-lg sm:grid-cols-2">
              <input
                name="billing_firstName"
                value={formData.billing_firstName}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={checkout.firstName}
                required
                disabled={isSameAsShipping}
              />
              <input
                name="billing_lastName"
                value={formData.billing_lastName}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                placeholder={checkout.lastName}
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
                <option value="" disabled>{checkout.country}</option>
                {Country.getAllCountries().map((list) => (
                  <option key={list.isoCode} value={list.isoCode}>
                    {list?.name} {list?.flag}
                  </option>
                ))}
              </select>
              <select
                name="billing_state"
                value={formData.billing_state}
                onChange={handleChange}
                className="w-full md:h-[65px] border-b focus:outline-none"
                required
                disabled={isSameAsShipping}
              >
                <option value="" disabled>{checkout.state}</option>
                {billingStateList?.map((list) => (
                  <option key={list.isoCode} value={list.isoCode}>
                    {list?.name} {list?.flag}
                  </option>
                ))}
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
                placeholder={checkout.landmark}
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

            {/* Order total summary */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 space-y-2 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>{common.subTotal}</span>
                <span>${derivedSummary.subtotal.toFixed(2)}</span>
              </div>
              {derivedSummary.couponDiscount > 0 && (
                <div className="flex items-center justify-between text-green-700">
                  <span>{common.coupon}</span>
                  <span>-${derivedSummary.couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {Number(appliedCreditAmount || 0) > 0 && (
                <div className="flex items-center justify-between text-green-700">
                  <span>My Credit</span>
                  <span>-${Number(appliedCreditAmount).toFixed(2)}</span>
                </div>
              )}
              {shippingCharges > 0 && (
                <div className="flex items-center justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>${shippingCharges.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 font-bold text-base">
                <span>{common.total}</span>
                <span>${derivedSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <CommonButton variant={6} disabled={loading} type="submit">
            {loading ? `${common.pleaseWait} ...` : `${common.checkout}`}
          </CommonButton>
        </div>
      </form>
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

const getStripePublishableKey = () => {
  const mode = (import.meta.env.VITE_STRIPE_MODE || 'live').toLowerCase();
  if (mode === 'test') {
    return (
      import.meta.env.VITE_STRIPE_TEST_API_KEY ||
      import.meta.env.VITE_STRIPE_API_KEY ||
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    );
  }
  return (
    import.meta.env.VITE_STRIPE_LIVE_API_KEY ||
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_STRIPE_API_KEY
  );
};