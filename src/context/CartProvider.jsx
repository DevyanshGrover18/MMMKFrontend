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

const cartContext = createContext({});

const CartProvider = ({ children }) => {
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApply, setIsCouponApply] = useState('');
  const [couponData, setCouponData] = useState({});
  const query = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCartItems(),
    enabled: isUserSignedIn(),
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isUserSignedIn()) setCartItems({ items: query.data?.data || [] });
    else setCart(JSON.parse(localStorage.getItem('cartItems')) || []);
  }, [query.data]);

  const [cart, setCart] = useState([]);

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
          quantity: item.quantity,
        })),
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
            (i) => i.product._id === item.product._id
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
      console.log('Merging carts', localCart, backendCartItems, mergedCart);
      setCartItems({ items: mergedCart, updateOnBackend: true });
    } catch (error) {
      console.error('Error merging cart:', error);
    }
  };

  const addToCart = async ({
    product,
    sku,
    filters,
    quantity = 1,
    showMessage = true,
  }) => {
    // save to local storage
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItemIndex = cartItems.findIndex(
      (item) => item.product._id === product._id && item.sku === sku
    );
    if (existingItemIndex > -1) {
      // If item already exists, update the quantity
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // If item does not exist, add it to the cart
      cartItems.push({ product, sku, filters, quantity });
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    setCartItems({ items: cartItems });

    if (isUserSignedIn()) {
      addCartItem({
        product: product._id,
        sku,
        filters,
        quantity,
      });
    }
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

    console.log('removing item', productId, sku, quantity, cartItems);

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
      // Call API to remove item from cart
      removeCartItems(productId, sku, quantity);
    }

    if (showMessage) showNotfication({ type: 'remove' });
  };

  const clearCart = ({ updateOnBackend = false } = {}) => {
    localStorage.removeItem('cartItems');
    setCartItems({ items: [] });
    if (updateOnBackend && isUserSignedIn()) {
      for (const item of JSON.parse(localStorage.getItem('cartItems')) || []) {
        removeCartItems({ productId: item.product._id });
      }
      // Call API to clear cart
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
      return;
    }
    if (!selectedSku) {
      message.error('Selected SKU not found for this product.');
      return;
    }
    await addToCart({
      product: res.data,
      sku: selectedSku.sku,
      filters: selectedSku.filters,
      quantity,
      showMessage,
    });
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
