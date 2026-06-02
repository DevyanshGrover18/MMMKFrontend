import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import Banner from '../components/global/Banner';
import NewsLetter from '../components/global/NewsLetter';
import bg from '../assets/bg.png';
import CategoryNavBar from '../components/global/CategoryNavBar';
import { getOrders } from '../apis/user/order';
import { refreshPaymentStatus } from '../apis/user/payment';
import { useCart } from '../context/CartProvider';
import { useTranslationContext } from '../context/TranslationContext';
import { CommonButton } from '../components/global/UIButtons';
import { convertStoredPrice, formatPrice } from '../utils/currency';
import { useCurrency } from '../context/CurrencyContext';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const { clearCart } = useCart();
  const {
    content: { common, thankYou },
  } = useTranslationContext();
  const { currency, rates } = useCurrency();
  const [cartCleared, setCartCleared] = useState(false);
  const [refreshingOrder, setRefreshingOrder] = useState(false);

  const query = useQuery({
    queryKey: ['order-success', orderId],
    queryFn: () => getOrders({ orderId }),
    enabled: !!orderId,
  });

  const order = query.data?.data?.[0];
  const juraSyncStatus = order?.juraSyncStatus || order?.depoterSyncStatus || 'Pending';
  const juraOrderId = order?.jura_order_id || order?.depoter_order_id || null;
  const juraSyncError = order?.juraSyncError || order?.depoterSyncError || null;
  const orderTotal = convertStoredPrice(
    order?.amount || order?.price?.total || 0,
    order?.currency,
    currency,
    rates
  );

  useEffect(() => {
    if (!order) return;

    console.log('[ORDER_SUCCESS_PAGE] Order verification result', {
      orderId: order.orderId,
      mode: order.mode || null,
      paymentStatus: order.paymentStatus || 'Pending',
      status: order.status || 'Pending',
      juraSyncStatus,
      jura_order_id: juraOrderId,
      juraSyncError,
    });
  }, [order]);

  useEffect(() => {
    if (!orderId || !order || refreshingOrder) return;
    if (order.mode !== 'card') return;
    if (order.paymentStatus === 'Paid') return;

    const refreshOrderStatus = async () => {
      try {
        setRefreshingOrder(true);
        const response = await refreshPaymentStatus(orderId);
        console.log('[ORDER_SUCCESS_PAGE] Refreshed card payment status', {
          orderId,
          stripe: response?.stripe || null,
          paymentStatus: response?.data?.paymentStatus || null,
          status: response?.data?.status || null,
          juraSyncStatus:
            response?.data?.juraSyncStatus ||
            response?.data?.depoterSyncStatus ||
            null,
          jura_order_id:
            response?.data?.jura_order_id ||
            response?.data?.depoter_order_id ||
            null,
          juraSyncError:
            response?.data?.juraSyncError ||
            response?.data?.depoterSyncError ||
            null,
        });
        await query.refetch();
      } catch (error) {
        console.error('[ORDER_SUCCESS_PAGE] Failed to refresh card payment', {
          orderId,
          error:
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message,
        });
      } finally {
        setRefreshingOrder(false);
      }
    };

    refreshOrderStatus();
  }, [orderId, order, refreshingOrder, query]);

  useEffect(() => {
    if (
      order &&
      !cartCleared &&
      (order.paymentStatus === 'Paid' || order.status === 'Processing')
    ) {
      clearCart({ updateOnBackend: true });
      setCartCleared(true);
    }
  }, [order, cartCleared, clearCart]);

  return (
    <div className="w-full">
      <Banner minHeight={20} bg={bg}>
        <div className="w-full">
          <CategoryNavBar />

          <main className="w-full py-20 text-black bg-white">
            <div className="w-full gap-5 px-5 py-12 text-center text-black bg-white border-t border-b text-2nd md:px-20">
              <h2 className="text-xl font-bold text-5th md:text-3xl lg:text-5xl">
                {order ? common.thankYou : 'Order update'}
              </h2>

              <p className="py-5 text-sm text-6th md:text-base lg:text-3xl">
                {order
                  ? thankYou.orderReceived
                  : query.isLoading
                    ? 'Checking your order...'
                    : 'We could not verify this order yet.'}
              </p>

              {refreshingOrder && (
                <p className="py-2 text-sm text-gray-500 md:text-base">
                  Refreshing payment confirmation...
                </p>
              )}

              {order && (
                <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-gray-200 bg-gray-50 p-6 text-left shadow-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        Order ID
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {order.orderId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        Status
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {order.status || 'Processing'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        Mode
                      </p>
                      <p className="mt-1 text-lg font-semibold capitalize text-gray-900">
                        {order.mode || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        Payment
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {order.paymentStatus || 'Pending'}
                      </p>
                    </div>
                    
                    {juraOrderId && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                          Jura Order ID
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {juraOrderId}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        Total
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {formatPrice(orderTotal, currency)}
                      </p>
                    </div>
                  </div>

                  {juraSyncError && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {juraSyncError}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-8 justify-center mt-6 md:flex-row">
                <CommonButton variant={6} isLink to="/product-listings">
                  {common.continueShopping}
                </CommonButton>
                <CommonButton variant={6} isLink to="/profile/my-orders">
                  {common.myOrders}
                </CommonButton>
              </div>
            </div>
          </main>
        </div>
      </Banner>
      <NewsLetter />
    </div>
  );
};

export default OrderSuccess;
