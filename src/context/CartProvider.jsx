import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { createContext, useContext } from 'react';
import {
  addCartItem,
  getCartItems,
  setCartData,
  removeCartItems,
} from '../apis/user/cart';
import { isUserSignedIn } from '../utils/globalMethods';
import { message, notification } from 'antd';
import { getProductSkus, getSingleProduct } from '../apis/nonAuth/products';
import { CommonButton } from '../components/global/UIButtons';
import { IoCartOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { getPercentageOf } from '../utils/globalMethods';
import { BASE_CURRENCY, convertPrice } from '../utils/currency';

const cartContext = createContext({});
const APPLIED_COUPON_CODE_KEY = 'appliedCouponCode';
const APPLIED_COUPON_DATA_KEY = 'appliedCouponData';
const APPLIED_COUPON_FLAG_KEY = 'isCouponApplied';
const APPLIED_CREDIT_KEY = 'appliedGiftCardCredit';

const calculateCartSummary = ({
  items = [],
  couponData = {},
  isCouponApply = false,
  shippingCharges = 0,
  appliedCreditAmount = 0,
  currency = BASE_CURRENCY,
  rates = {},
}) => {
  const subtotalBase = items.reduce((acc, item) => {
    const unitPrice = Number(
      getPercentageOf(item?.product?.price || 0, item?.product?.discount || 0)
    );
    return acc + unitPrice * Number(item?.quantity || 0);
  }, 0);
  const subtotal = convertPrice(subtotalBase, currency, rates);

  const couponDiscount =
    isCouponApply && couponData?.discount
      ? Number(((subtotal * Number(couponData.discount || 0)) / 100).toFixed(2))
      : 0;

  const shipping = convertPrice(shippingCharges || 0, currency, rates);
  const convertedCredit = convertPrice(appliedCreditAmount || 0, currency, rates);
  const totalBeforeCredits = subtotal - couponDiscount + shipping;
  const creditApplied = Math.min(
    Number(convertedCredit || 0),
    Math.max(Number(totalBeforeCredits.toFixed(2)), 0)
  );
  const total = totalBeforeCredits - creditApplied;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    couponDiscount: Number(couponDiscount.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    creditApplied: Number(creditApplied.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};

const CartProvider = ({ children }) => {
  const [couponCode, setCouponCode] = useState(
    localStorage.getItem(APPLIED_COUPON_CODE_KEY) || ''
  );
  const [isCouponApply, setIsCouponApply] = useState(
    localStorage.getItem(APPLIED_COUPON_FLAG_KEY) === 'true'
  );
  const [couponData, setCouponData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(APPLIED_COUPON_DATA_KEY)) || {};
    } catch {
      return {};
    }
  });
  const [checkoutSummary, setCheckoutSummary] = useState({
    subtotal: 0,
    couponDiscount: 0,
    shipping: 0,
    creditApplied: 0,
    total: 0,
  });
  const [appliedCreditAmount, setAppliedCreditAmount] = useState(() =>
    Number(localStorage.getItem(APPLIED_CREDIT_KEY) || 0)
  );
  const query = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCartItems(),
    enabled: isUserSignedIn(),
    retry: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isUserSignedIn()) setCartItems({ items: query.data?.data || [] });
    else setCart(JSON.parse(localStorage.getItem('cartItems')) || []);
  }, [query.data]);

  useEffect(() => {
    if (query.error && isUserSignedIn()) {
      setCart(JSON.parse(localStorage.getItem('cartItems')) || []);
    }
  }, [query.error]);

  useEffect(() => {
    if (couponCode) localStorage.setItem(APPLIED_COUPON_CODE_KEY, couponCode);
    else localStorage.removeItem(APPLIED_COUPON_CODE_KEY);
  }, [couponCode]);

  useEffect(() => {
    localStorage.setItem(APPLIED_COUPON_FLAG_KEY, String(Boolean(isCouponApply)));
  }, [isCouponApply]);

  useEffect(() => {
    if (couponData && Object.keys(couponData).length > 0) {
      localStorage.setItem(APPLIED_COUPON_DATA_KEY, JSON.stringify(couponData));
      return;
    }
    localStorage.removeItem(APPLIED_COUPON_DATA_KEY);
  }, [couponData]);

  useEffect(() => {
    const normalizedCredit = Number(appliedCreditAmount || 0);
    if (normalizedCredit > 0) {
      localStorage.setItem(APPLIED_CREDIT_KEY, String(normalizedCredit));
      return;
    }
    localStorage.removeItem(APPLIED_CREDIT_KEY);
  }, [appliedCreditAmount]);

  const [cart, setCart] = useState([]);

  useEffect(() => {
    const summaryWithoutShipping = calculateCartSummary({
      items: cart,
      couponData,
      isCouponApply,
      appliedCreditAmount,
    });

    if (appliedCreditAmount > summaryWithoutShipping.subtotal - summaryWithoutShipping.couponDiscount) {
      setAppliedCreditAmount(summaryWithoutShipping.total + summaryWithoutShipping.creditApplied);
    }
  }, [cart, couponData, isCouponApply, appliedCreditAmount]);

  const showNotfication = ({ type, productName, quantity }) =>
    notification.open({
      message:
        type === 'add'
          ? `${productName ? `Product "${productName}"` : 'Item'}${
              quantity > 0 ? ` (${quantity})` : ''
            } Added to Cart`
          : `${productName || 'Item'} Removed from Cart`,
      btn: (
        <CommonButton
          variant="primary1"
          size="xs"
          onClick={() => {
            notification.destroy();
            navigate('/shopping-cart');
          }}
        >
          View Cart
        </CommonButton>
      ),
      icon: <IoCartOutline style={{ color: '#108ee9' }} />,
    });

  const setCartItems = ({ items, updateOnBackend = false, successMessage }) => {
    localStorage.setItem('cartItems', JSON.stringify(items));
    setCart(items);
    if (updateOnBackend && isUserSignedIn()) {
      setCartData({
        items: items.map((item) => ({
          product: item.product._id,
          sku: item.sku,
          filters: item.filters || {},
          quantity: item.quantity,
        })),
      }).catch(() => {
        // Keep the local cart usable when the backend cart API is unavailable.
      });
    }
    if (successMessage) message.success(successMessage);
  };

  const mergeCart = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cartItems')) || [];
      const res = await getCartItems();
      const backendCartItems = res?.data || [];
      const mergedCart = [...localCart, ...backendCartItems].reduce(
        (acc, item) => {
          const existingItemIndex = acc.findIndex(
            (i) => i.product._id === item.product._id && i.sku === item.sku
          );
          if (existingItemIndex > -1) {
            acc[existingItemIndex].quantity += item.quantity;
            acc[existingItemIndex]._id = item._id;
          } else {
            acc.push(item);
          }
          return acc;
        },
        []
      );
      setCartItems({ items: mergedCart, updateOnBackend: true });
    } catch (error) {
      setCart(JSON.parse(localStorage.getItem('cartItems')) || []);
    }
  };

  const addToCart = async ({
    product,
    sku,
    filters,
    quantity = 1,
    showMessage = true,
  }) => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItemIndex = cartItems.findIndex(
      (item) => item.product._id === product._id && item.sku === sku
    );

    if (isUserSignedIn()) {
      try {
        await addCartItem({
          product: product._id,
          sku,
          filters,
          quantity,
        });
      } catch (error) {
        // Preserve client-side cart behavior when production cart auth fails.
      }
    }

    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      cartItems.push({ product, sku, filters, quantity });
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    setCartItems({ items: cartItems });
    if (showMessage)
      showNotfication({
        type: 'add',
        productName: product.productName?.en,
        sku,
        filters,
        quantity,
      });
  };

  const removeFromCart = async ({
    productId,
    sku,
    quantity = 0,
    showMessage = true,
  }) => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    const foundIndex = cartItems.findIndex(
      (item) => item.product._id === productId && item.sku === sku
    );

    if (foundIndex === -1) return;
    if (quantity > 0) {
      cartItems[foundIndex].quantity -= quantity;
      if (cartItems[foundIndex].quantity <= 0) {
        cartItems.splice(foundIndex, 1);
      }
    } else {
      cartItems.splice(foundIndex, 1);
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    setCartItems({ items: cartItems });

    if (isUserSignedIn()) {
      removeCartItems(productId, sku, quantity).catch(() => {
        // Local cart remains the source of truth if backend removal fails.
      });
    }

    if (showMessage) showNotfication({ type: 'remove' });
  };

  const clearCart = ({ updateOnBackend = false } = {}) => {
    const localCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    localStorage.removeItem('cartItems');
    setCartItems({ items: [] });
    setCouponCode('');
    setCouponData({});
    setIsCouponApply(false);
    localStorage.removeItem(APPLIED_COUPON_CODE_KEY);
    localStorage.removeItem(APPLIED_COUPON_DATA_KEY);
    localStorage.removeItem(APPLIED_COUPON_FLAG_KEY);
    setCheckoutSummary({
      subtotal: 0,
      couponDiscount: 0,
      shipping: 0,
      creditApplied: 0,
      total: 0,
    });
    setAppliedCreditAmount(0);
    localStorage.removeItem(APPLIED_CREDIT_KEY);
    if (updateOnBackend && isUserSignedIn()) {
      for (const item of localCart) {
        removeCartItems(item.product._id, item.sku, item.quantity).catch(
          () => {
            // Ignore backend cleanup failures while clearing the local cart.
          }
        );
      }
    }
  };

  const addProductToCart = async ({
    productId,
    sku,
    quantity = 1,
    showMessage,
  }) => {
    const res = await getSingleProduct(productId);
    const skus = await getProductSkus(productId);
    const selectedSku = skus.find((s) => s.sku === sku);

    if (!res?.data) {
      message.error('Product not found');
      return false;
    }
    if (!selectedSku) {
      message.error('Selected SKU not found for this product.');
      return false;
    }

    const requestedQuantity = Number(quantity || 0);
    if (requestedQuantity <= 0) {
      message.warning('Invalid quantity requested.');
      return false;
    }

    const currentCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const currentQuantityInCart = currentCartItems.reduce((total, item) => {
      if (item?.product?._id === productId && item?.sku === sku) {
        return total + Number(item?.quantity || 0);
      }
      return total;
    }, 0);

    const availableQuantity =
      Array.isArray(res?.data?.filters) && res.data.filters.length === 0
        ? Number(res?.data?.quantity || 0)
        : Number(selectedSku?.quantity || 0);
    const remainingQuantity = availableQuantity - currentQuantityInCart;

    if (remainingQuantity <= 0) {
      message.warning('Sold out for selected option.');
      return false;
    }

    if (requestedQuantity > remainingQuantity) {
      message.warning(
        `Only ${remainingQuantity} item(s) available for selected option`
      );
      return false;
    }

    await addToCart({
      product: res.data,
      sku: selectedSku.sku,
      filters: selectedSku.filters,
      quantity: requestedQuantity,
      showMessage,
    });
    return true;
  };

  return (
    <cartContext.Provider
      value={{
        couponCode,
        couponData,
        setCouponData,
        setCouponCode,
        data: cart,
        refetch: query.refetch,
        isCouponApply,
        setIsCouponApply,
        addToCart,
        removeFromCart,
        clearCart,
        mergeCart,
        addProductToCart,
        calculateCartSummary,
        checkoutSummary,
        setCheckoutSummary,
        appliedCreditAmount,
        setAppliedCreditAmount,
      }}
    >
      {children}
    </cartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(cartContext);
};

export default CartProvider;
