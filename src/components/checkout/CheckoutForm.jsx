import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  getAddressBook,
  getMyAccount,
  getUserCredits,
} from '../../apis/user/profile';
import { Country, State } from 'country-state-city';
import { createPaymentIntent } from '../../apis/user/payment';
import { message } from 'antd';
import { useCart } from '../../context/CartProvider';
import PaymentModal from './PaymentModal';
import { createManualOrder } from '../../apis/user/order';
import { useNavigate, Link } from 'react-router-dom';
import countriesList from '../../countries.json';
import rateByWeight from '../../rateByWeight.json';
import { useTranslationContext } from '../../context/TranslationContext';
import { CommonButton } from '../global/UIButtons';
import { loadStripe } from '@stripe/stripe-js';
import { getPercentageOf, isUserSignedIn } from '../../utils/globalMethods';
import {
  BASE_CURRENCY,
  convertPrice,
  convertStoredPrice,
  formatPrice,
} from '../../utils/currency';
import { useCurrency } from '../../context/CurrencyContext';
import { resolveAssetUrl } from '../../utils/assetUrl';

const calculateShippingCharges = (countryCode, weight) => {
  if (!countryCode) return 0;
  const countryData = Country.getCountryByCode(countryCode);
  if (!countryData?.name) return 0;

  // Round weight up to nearest 0.5 increment, minimum 0.5
  const roundedWeight = Math.max(0.5, Math.ceil(Number(weight || 0) * 2) / 2);

  // Try to find the zone for the country
  // Use flexible matching for country names (e.g., 'Saudi Arabia' matches 'Saudi')
  let zone = countriesList?.countries[countryData.name];
  if (!zone) {
    const entry = Object.entries(countriesList?.countries || {}).find(
      ([name]) =>
        countryData.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(countryData.name.toLowerCase())
    );
    if (entry) zone = entry[1];
  }

  const rate = zone ? rateByWeight[String(roundedWeight)]?.[zone] : 0;
  return parseFloat(rate) || 0;
};

const EMPTY_FORM = {
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
};

const addressToShippingFields = (addr, prefix) => ({
  [`${prefix}_firstName`]: addr?.firstName || '',
  [`${prefix}_lastName`]: addr?.lastName || '',
  [`${prefix}_streetAddress`]:
    addr?.street_address || addr?.streetAddress || '',
  [`${prefix}_city`]: addr?.city || '',
  [`${prefix}_state`]: addr?.state || '',
  [`${prefix}_postalCode`]: addr?.postalCode || '',
  [`${prefix}_country`]: addr?.country || '',
  [`${prefix}_company`]: addr?.company || '',
  [`${prefix}_phoneNumber`]: addr?.phone_number || addr?.phoneNumber || '',
  [`${prefix}_landmark`]: addr?.landmark || '',
});

// ─── Saved Address Selector ───────────────────────────────────────────────────

const AddressSelector = ({
  addresses = [],
  selectedId,
  onSelect,
  onNewAddress,
  label,
}) => {
  if (addresses.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-black/60 mb-3">
        Saved {label} addresses
      </p>
      <div className="flex flex-col gap-2">
        {addresses.map((addr) => {
          const isSelected = selectedId === addr._id;
          return (
            <button
              key={addr._id}
              type="button"
              onClick={() => onSelect(addr)}
              className={`text-left px-4 py-3 border rounded-lg transition-all text-sm ${
                isSelected
                  ? 'border-black bg-black/5 font-medium'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <span className="inline-block text-xs uppercase tracking-wide text-black/40 mr-2">
                {addr.label || 'Home'}
              </span>
              {addr.isDefault && (
                <span className="inline-block text-xs bg-black text-white px-1.5 py-0.5 rounded-full mr-2">
                  Default
                </span>
              )}
              <span className="font-medium">
                {addr.firstName} {addr.lastName}
              </span>
              {' · '}
              <span className="text-black/60">
                {addr.street_address}, {addr.city}, {addr.state}{' '}
                {addr.postalCode}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onNewAddress}
          className={`text-left px-4 py-3 border rounded-lg transition-all text-sm ${
            selectedId === 'new'
              ? 'border-black bg-black/5 font-medium'
              : 'border-gray-200 hover:border-gray-400'
          }`}
        >
          <span className="text-black/60">+ Enter a new address</span>
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CheckoutForm({
  onShippingChange,
  liveSummary,
  shippingCharges: shippingChargesProp,
  appliedCreditAmount: appliedCreditAmountProp,
  cartItems,
  translateLanguage,
  common: commonProp,
  cart,
}) {
  const {
    content: { common: commonCtx, checkout },
  } = useTranslationContext();
  const common = commonProp || commonCtx;

  const navigate = useNavigate();
  const {
    data: cartData,
    couponCode,
    isCouponApply,
    couponData,
    calculateCartSummary,
    setCheckoutSummary,
    appliedCreditAmount,
    setAppliedCreditAmount,
    isBagAdded,
    clearCart,
  } = useCart();
  const { currency, rates } = useCurrency();
  const currencyRate = Number(rates?.[currency] || 1);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shippingStateList, setShippingStateList] = useState([]);
  const [billingStateList, setBillingStateList] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [totalProductWeight, setTotalProductWeight] = useState(0);
  const [isSameAsShipping, setIsSameAsShipping] = useState(false);

  // Track which saved address is selected per section ('new' = manual entry)
  const [selectedShippingId, setSelectedShippingId] = useState(null);
  const [selectedBillingId, setSelectedBillingId] = useState(null);
  const formatConvertedPrice = (amount) =>
    formatPrice(convertPrice(amount, currency, rates), currency);

  const calculatedShippingCharges = totalProductWeight
    ? calculateShippingCharges(formData.shipping_country, totalProductWeight)
    : 0;
  const effectiveShippingCharges =
    Number(shippingChargesProp || 0) > 0
      ? Number(shippingChargesProp)
      : calculatedShippingCharges;

  const derivedSummary =
    liveSummary ||
    calculateCartSummary({
      items: cartData,
      couponData,
      isCouponApply,
      isBagAdded,
      shippingCharges: effectiveShippingCharges,
      appliedCreditAmount,
      currency,
      rates,
    });

  const effectiveAppliedCredit = appliedCreditAmountProp ?? appliedCreditAmount;
  const items = cartItems || cartData;

  const query = useQuery({
    queryKey: ['address-book'],
    queryFn: getAddressBook,
  });
  const profileQuery = useQuery({
    queryKey: ['my-account'],
    queryFn: getMyAccount,
  });
  const creditsQuery = useQuery({
    queryKey: ['credit'],
    queryFn: getUserCredits,
    enabled: isUserSignedIn(),
    retry: false,
  });

  const availableCredits = Number(creditsQuery.data?.credits || 0);
  const availableCreditsInCurrency = convertPrice(
    availableCredits,
    currency,
    rates
  );

  const handleApplyCredits = () => {
    const baseSummary = calculateCartSummary({
      items: cartData,
      couponData,
      isCouponApply,
      isBagAdded,
      shippingCharges: effectiveShippingCharges,
      appliedCreditAmount: 0,
      currency,
      rates,
    });
    
    // Convert order total to base currency for accurate comparison
    const neededAmountInCurrency = baseSummary.total + (baseSummary.creditApplied || 0);
    const neededAmountBase = convertStoredPrice(neededAmountInCurrency, currency, BASE_CURRENCY, rates);
    
    const eligibleAmountBase = Math.min(availableCredits, neededAmountBase);

    if (eligibleAmountBase <= 0) {
      message.warning('No wallet credit available to apply');
      return;
    }

    // If we can cover the whole thing, use the exact neededAmountBase to ensure total becomes 0
    const finalAmountBaseToSet = Math.abs(eligibleAmountBase - neededAmountBase) < 0.01 
      ? neededAmountBase 
      : eligibleAmountBase;

    setAppliedCreditAmount(Number(finalAmountBaseToSet.toFixed(2)));
    message.success(
      `Applied ${formatConvertedPrice(finalAmountBaseToSet)} from My Credit`
    );
  };

  const handleRemoveCredits = () => {
    setAppliedCreditAmount(0);
    message.success('Removed applied wallet credit');
  };

  const shippingAddresses = query.data?.data?.shippingAddresses || [];
  const billingAddresses = query.data?.data?.billingAddresses || [];

  // ── Populate form from a saved address ──────────────────────────────────────

  const applyShippingAddress = (addr) => {
    setSelectedShippingId(addr._id);
    const fields = addressToShippingFields(addr, 'shipping');
    setFormData((prev) => {
      const next = { ...prev, ...fields };
      // Calculate shipping for the new country immediately
      const weight = totalProductWeight;
      const newRate = calculateShippingCharges(next.shipping_country, weight);
      onShippingChange?.(newRate);
      return next;
    });
    setShippingStateList(State.getStatesOfCountry(addr.country));
  };

  const applyBillingAddress = (addr) => {
    setSelectedBillingId(addr._id);
    const fields = addressToShippingFields(addr, 'billing');
    setFormData((prev) => ({ ...prev, ...fields }));
    setBillingStateList(State.getStatesOfCountry(addr.country));
  };

  const clearShippingAddress = () => {
    setSelectedShippingId('new');
    setFormData((prev) => {
      const next = {
        ...prev,
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
      };
      onShippingChange?.(0);
      return next;
    });
    setShippingStateList([]);
  };

  const clearBillingAddress = () => {
    setSelectedBillingId('new');
    setIsSameAsShipping(false);
    setFormData((prev) => ({
      ...prev,
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
  };

  // ── Form field change ────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'shipping_country') {
      setShippingStateList(State.getStatesOfCountry(value));
      const newRate = calculateShippingCharges(value, totalProductWeight);
      onShippingChange?.(newRate);
    }
    if (name === 'billing_country')
      setBillingStateList(State.getStatesOfCountry(value));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSameAsShippingChange = (e) => {
    const isChecked = e.target.checked;
    setIsSameAsShipping(isChecked);
    if (isChecked) {
      setFormData((prev) => {
        const next = {
          ...prev,
          billing_firstName: prev.shipping_firstName,
          billing_lastName: prev.shipping_lastName,
          billing_streetAddress: prev.shipping_streetAddress,
          billing_city: prev.shipping_city,
          billing_state: prev.shipping_state,
          billing_postalCode: prev.shipping_postalCode,
          billing_country: prev.shipping_country,
          billing_company: prev.shipping_company,
          billing_phoneNumber: prev.shipping_phoneNumber,
          billing_landmark: prev.shipping_landmark,
        };
        setBillingStateList(State.getStatesOfCountry(next.shipping_country));
        return next;
      });
      setSelectedBillingId(selectedShippingId);
    } else {
      clearBillingAddress();
    }
  };

  // ── Payment ──────────────────────────────────────────────────────────────────

  const handlePaymentChoice = async (mode) => {
    setIsModalVisible(false);
    const { shippingAddress, billingAddress } =
      formatShippingBillingAddress(formData);

    if (mode === 'card') {
      try {
        setLoading(true);
        const data = await createPaymentIntent({
          products: cartData,
          shippingAddress,
          billingAddress,
          shippingCharges: effectiveShippingCharges,
          couponCode: isCouponApply ? couponCode : null,
          creditsUsed: derivedSummary.creditApplied,
          creditsUsedBase: appliedCreditAmount,
          totalAmount: derivedSummary.total,
          isBagAdded,
          currency,
          currencyRate,
        });

        if (data?.paidWithCredits && data?.orderId) {
          clearCart({ updateOnBackend: true });
          navigate(`/order-success/${data.orderId}`);
          setAppliedCreditAmount(0);
          return;
        }

        const publishableKey = getStripePublishableKey();
        if (!publishableKey)
          throw new Error('Stripe publishable key is not configured');
        const stripePromise = await loadStripe(publishableKey);

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
          shippingCharges: effectiveShippingCharges,
          couponCode: isCouponApply ? couponCode : null,
          creditsUsed: derivedSummary.creditApplied,
          creditsUsedBase: appliedCreditAmount,
          totalAmount: derivedSummary.total,
          isBagAdded,
          currency,
          currencyRate,
        });
        message.success(res?.message || checkout.orderPlacedSuccessfully);
        clearCart({ updateOnBackend: true });
        navigate(`/order-success/${res?.data}`);
      } catch (err) {
        message.error(err?.response?.data?.message);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (derivedSummary.total === 0) {
      handlePaymentChoice('card');
    } else {
      setIsModalVisible(true);
    }
  };

  // ── Effects ──────────────────────────────────────────────────────────────────

  // On load: pre-select default saved addresses if available
  useEffect(() => {
    if (!query.data) return;

    const defaultShipping =
      shippingAddresses.find((a) => a.isDefault) || shippingAddresses[0];
    const defaultBilling =
      billingAddresses.find((a) => a.isDefault) || billingAddresses[0];

    if (defaultShipping) {
      applyShippingAddress(defaultShipping);
    } else {
      // Fall back to old flat address fields for backward compatibility
      const addr = query.data?.data?.shippingAddress || {};
      if (addr.street_address || addr.streetAddress) {
        setFormData((prev) => ({
          ...prev,
          ...addressToShippingFields(addr, 'shipping'),
        }));
        setShippingStateList(State.getStatesOfCountry(addr.country));
        setSelectedShippingId('new');
      }
    }

    if (defaultBilling) {
      applyBillingAddress(defaultBilling);
    } else {
      const addr = query.data?.data?.billingAddress || {};
      if (addr.street_address || addr.streetAddress) {
        setFormData((prev) => ({
          ...prev,
          ...addressToShippingFields(addr, 'billing'),
        }));
        setBillingStateList(State.getStatesOfCountry(addr.country));
        setSelectedBillingId('new');
      }
    }
  }, [query.data]);

  // Fill name/phone from profile if still empty after address hydration
  useEffect(() => {
    if (!profileQuery.data?.data) return;
    const p = profileQuery.data.data;
    setFormData((prev) => ({
      ...prev,
      shipping_firstName: prev.shipping_firstName || p.firstName || '',
      shipping_lastName: prev.shipping_lastName || p.lastName || '',
      shipping_phoneNumber: prev.shipping_phoneNumber || p.contactNumber || '',
      billing_firstName: prev.billing_firstName || p.firstName || '',
      billing_lastName: prev.billing_lastName || p.lastName || '',
      billing_phoneNumber: prev.billing_phoneNumber || p.contactNumber || '',
    }));
  }, [profileQuery.data]);

  useEffect(() => {
    setTotalProductWeight(
      cartData?.reduce((acc, item) => {
        return (
          acc +
          (parseFloat(item?.product?.weight) || 0) *
            (parseFloat(item?.quantity) || 0)
        );
      }, 0) || 0
    );
  }, [cartData]);

  useEffect(() => {
    onShippingChange?.(calculatedShippingCharges);
  }, [calculatedShippingCharges, onShippingChange]);

  useEffect(() => {
    setCheckoutSummary(derivedSummary);
  }, [derivedSummary, setCheckoutSummary]);

  // ── Shared input/label classes ───────────────────────────────────────────────

  const inputCls = 'w-full md:h-[65px] border-b focus:outline-none md:text-lg';
  const selectCls = 'w-full md:h-[65px] border-b focus:outline-none md:text-lg';

  // Whether to show the manual form for each section
  const showShippingForm =
    selectedShippingId === 'new' || shippingAddresses.length === 0;
  const showBillingForm =
    !isSameAsShipping &&
    (selectedBillingId === 'new' || billingAddresses.length === 0);

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
          {/* ── Shipping ── */}
          <div className="w-full space-y-6">
            <h2 className="pb-2 text-xl font-normal md:text-5xl">
              {checkout.shippingAddress}
              <div className="bg-gray-900 border-b w-16 md:w-44 md:h-[4px] md:mt-4" />
            </h2>

            <AddressSelector
              addresses={shippingAddresses}
              selectedId={selectedShippingId}
              onSelect={applyShippingAddress}
              onNewAddress={clearShippingAddress}
              label="shipping"
            />

            {showShippingForm && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <input
                    name="shipping_firstName"
                    value={formData.shipping_firstName}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder={checkout.firstName}
                    required
                  />
                  <input
                    name="shipping_lastName"
                    value={formData.shipping_lastName}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder={checkout.lastName}
                    required
                  />
                </div>
                <input
                  name="shipping_streetAddress"
                  value={formData.shipping_streetAddress}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder={checkout.streetAddress}
                  required
                />
                <div className="grid grid-cols-2 gap-6">
                  <select
                    name="shipping_country"
                    value={formData.shipping_country}
                    onChange={handleChange}
                    className={selectCls}
                    required
                  >
                    <option value="" disabled>
                      {checkout.country}
                    </option>
                    {Country.getAllCountries().map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name} {c.flag}
                      </option>
                    ))}
                  </select>
                  <select
                    name="shipping_state"
                    value={formData.shipping_state}
                    onChange={handleChange}
                    className={selectCls}
                    required
                  >
                    <option value="" disabled>
                      {checkout.state}
                    </option>
                    {shippingStateList.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <input
                    name="shipping_postalCode"
                    value={formData.shipping_postalCode}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder={checkout.postalCode}
                    required
                  />
                  <input
                    name="shipping_city"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder={checkout.city}
                    required
                  />
                </div>
                <input
                  name="shipping_landmark"
                  value={formData.shipping_landmark}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder={checkout.landmark}
                />
                <input
                  name="shipping_company"
                  value={formData.shipping_company}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder={checkout.company}
                />
                <input
                  name="shipping_phoneNumber"
                  value={formData.shipping_phoneNumber}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder={checkout.phoneNumber}
                  required
                />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px mx-4 bg-black h-[70vh] md:h-auto md:block hidden" />

          {/* ── Billing ── */}
          <div className="w-full space-y-6">
            <h2 className="pb-2 text-xl font-normal md:text-5xl">
              {checkout.billingAddress}
              <div className="bg-gray-900 border-b w-16 md:w-44 md:h-[4px] md:mt-4" />
            </h2>

            <div className="flex items-center mb-2">
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

            {!isSameAsShipping && (
              <AddressSelector
                addresses={billingAddresses}
                selectedId={selectedBillingId}
                onSelect={applyBillingAddress}
                onNewAddress={clearBillingAddress}
                label="billing"
              />
            )}

            {showBillingForm && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <input
                    name="billing_firstName"
                    value={formData.billing_firstName}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder={checkout.firstName}
                    required
                    disabled={isSameAsShipping}
                  />
                  <input
                    name="billing_lastName"
                    value={formData.billing_lastName}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder={checkout.lastName}
                    required
                    disabled={isSameAsShipping}
                  />
                </div>
                <input
                  name="billing_streetAddress"
                  value={formData.billing_streetAddress}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder={checkout.streetAddress}
                  required
                  disabled={isSameAsShipping}
                />
                <div className="grid grid-cols-2 gap-6">
                  <select
                    name="billing_country"
                    value={formData.billing_country}
                    onChange={handleChange}
                    className={selectCls}
                    required
                    disabled={isSameAsShipping}
                  >
                    <option value="" disabled>
                      {checkout.country}
                    </option>
                    {Country.getAllCountries().map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name} {c.flag}
                      </option>
                    ))}
                  </select>
                  <select
                    name="billing_state"
                    value={formData.billing_state}
                    onChange={handleChange}
                    className={selectCls}
                    required
                    disabled={isSameAsShipping}
                  >
                    <option value="" disabled>
                      {checkout.state}
                    </option>
                    {billingStateList.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <input
                    name="billing_postalCode"
                    value={formData.billing_postalCode}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder={checkout.postalCode}
                    required
                    disabled={isSameAsShipping}
                  />
                  <input
                    name="billing_city"
                    value={formData.billing_city}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder={checkout.city}
                    required
                    disabled={isSameAsShipping}
                  />
                </div>
                <input
                  name="billing_landmark"
                  value={formData.billing_landmark}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder={checkout.landmark}
                  disabled={isSameAsShipping}
                />
                <input
                  name="billing_company"
                  value={formData.billing_company}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder={checkout.company}
                  disabled={isSameAsShipping}
                />
                <input
                  name="billing_phoneNumber"
                  value={formData.billing_phoneNumber}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder={checkout.phoneNumber}
                  required
                  disabled={isSameAsShipping}
                />
              </div>
            )}

            {/* Show summary of selected saved billing address when form is hidden */}
            {isSameAsShipping && (
              <p className="text-sm text-black/50">
                Billing address same as shipping.
              </p>
            )}
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="mt-12 border-t brown-border pt-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/50 mb-1">
                {common.checkout}
              </p>
              <h3 className="text-2xl font-bold md:text-4xl">Order Summary</h3>
            </div>
            <p className="text-sm text-black/60">
              {items?.length || 0} item{items?.length === 1 ? '' : 's'}
            </p>
          </div>

          {items?.length > 0 && (
            <div className="space-y-0 border-t brown-border">
              {items.map((item) => {
                const unitPrice = Number(
                  getPercentageOf(
                    item?.product?.price || 0,
                    item?.product?.discount || 0
                  )
                );
                const lineTotal = unitPrice * Number(item?.quantity || 0);
                const productImage =
                  item?.product?.thumbnail ||
                  item?.product?.image ||
                  item?.product?.images?.[0];
                const productName =
                  item?.product?.translated?.productName ||
                  item?.product?.productName?.[translateLanguage] ||
                  item?.product?.productName?.en;

                return (
                  <div
                    key={`${item?.product?._id}-${item?.sku}`}
                    className="grid gap-4 border-b px-0 py-5 brown-border md:grid-cols-[120px_minmax(0,1fr)_160px] md:items-center"
                  >
                    <Link
                      to={`/product-details/${item?.product?._id}`}
                      className="block overflow-hidden border brown-border bg-[#f8f8f8]"
                    >
                      <img
                        src={productImage ? resolveAssetUrl(productImage) : ''}
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
                      {item?.filters &&
                        Object.keys(item.filters).length > 0 && (
                          <p className="mt-2 text-sm text-black/60">
                            {Object.entries(item.filters)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' | ')}
                          </p>
                        )}
                      <p className="mt-3 text-sm text-black/60">
                        Qty {item?.quantity} x {formatConvertedPrice(unitPrice)}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      {item?.product?.discount > 0 && (
                        <p className="text-sm text-black/35 line-through">
                          {formatConvertedPrice(
                            Number(item?.product?.price || 0) *
                              Number(item?.quantity || 0)
                          )}
                        </p>
                      )}
                      <p className="text-xl font-bold md:text-2xl">
                        {formatConvertedPrice(lineTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 ml-auto w-full max-sm:px-4 md:max-w-sm">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-black/60">
                <span>{common.subTotal}</span>
                <span>{formatPrice(derivedSummary.subtotal, currency)}</span>
              </div>
              {derivedSummary.couponDiscount > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-green-700">
                    <span>{common.coupon}</span>
                    <span>
                      -{formatPrice(derivedSummary.couponDiscount, currency)}
                    </span>
                  </div>
                  {couponData?.scope && couponData.scope !== 'All' && (
                    <p className="text-right text-[10px] text-gray-500 italic">
                      Applied to:{' '}
                      {couponData.scope === 'Category'
                        ? couponData.scopeCategory?.name?.[translateLanguage] ||
                          couponData.scopeCategory?.name?.en
                        : couponData.scopeProduct?.productName?.[
                            translateLanguage
                          ] || couponData.scopeProduct?.productName?.en}
                    </p>
                  )}
                </div>
              )}

              {(effectiveShippingCharges > 0 || formData.shipping_country) && (
                <>
                  <div className="flex items-center justify-between text-black/60">
                    <span>Shipping</span>
                    <span>
                      {derivedSummary.shipping > 0
                        ? formatPrice(derivedSummary.shipping, currency)
                        : 'Free'}
                    </span>
                  </div>
                  {derivedSummary.deliveryCouponDiscount > 0 && (
                    <div className="flex items-center justify-between text-green-700">
                      <span className="text-xs italic pl-2">
                        Delivery Discount
                      </span>
                      <span>
                        -
                        {formatPrice(
                          derivedSummary.deliveryCouponDiscount,
                          currency
                        )}
                      </span>
                    </div>
                  )}
                </>
              )}
              {derivedSummary.bagFee > 0 && (
                <div className="flex items-center justify-between text-black/60">
                  <span>Bag Fee</span>
                  <span>+ {formatPrice(derivedSummary.bagFee, currency)}</span>
                </div>
              )}
              {Number(derivedSummary.creditApplied || 0) > 0 && (
                <div className="flex items-center justify-between text-green-700">
                  <span>My Credit</span>
                  <span>
                    -
                    {formatPrice(
                      Number(derivedSummary.creditApplied),
                      currency
                    )}
                  </span>
                </div>
              )}
              {isUserSignedIn() && (
                <div className="mb-6 rounded-lg border brown-border bg-[#f8f8f8] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">My Credit</p>
                      <p className="text-sm text-black/50">
                        Available:{' '}
                        {formatPrice(availableCreditsInCurrency, currency)}
                      </p>
                    </div>
                    {appliedCreditAmount > 0 ? (
                      <button
                        type="button"
                        onClick={handleRemoveCredits}
                        className="text-sm font-semibold text-red-600"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCredits}
                        className="text-sm font-semibold text-black"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between border-t brown-border pt-3 text-lg font-bold">
                <span>{common.total}</span>
                <span>{formatPrice(derivedSummary.total, currency)}</span>
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatShippingBillingAddress = (data) => ({
  shippingAddress: {
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
  },
  billingAddress: {
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
  },
});

const getStripePublishableKey = () => {
  const mode = (import.meta.env.VITE_STRIPE_MODE || 'live').toLowerCase();
  if (mode === 'test')
    return (
      import.meta.env.VITE_STRIPE_TEST_API_KEY ||
      import.meta.env.VITE_STRIPE_API_KEY ||
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    );
  return (
    import.meta.env.VITE_STRIPE_LIVE_API_KEY ||
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_STRIPE_API_KEY
  );
};
