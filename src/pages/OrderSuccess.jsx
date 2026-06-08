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
import {
  BASE_CURRENCY,
  convertStoredPrice,
  formatPrice,
} from '../utils/currency';
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
  const juraSyncStatus =
    order?.juraSyncStatus || order?.depoterSyncStatus || 'Pending';
  const juraOrderId = order?.jura_order_id || order?.depoter_order_id || null;
  const juraSyncError = order?.juraSyncError || order?.depoterSyncError || null;
  const orderTotal = Number(order?.price?.total || order?.totalAmount || order?.amount || 0);
  const creditApplied = Number(order?.price?.creditApplied || order?.creditsUsed || 0);
  const payableTotal = Number(order?.price?.payableTotal || order?.amountDueCOD || order?.amountPaidOnline || (orderTotal - creditApplied));
  
  const orderCurrency = order?.currency || currency;
  
  const displayTotal = convertStoredPrice(orderTotal, orderCurrency, currency, rates);
  const displayCredits = convertStoredPrice(creditApplied, orderCurrency, currency, rates);
  const displayPayable = convertStoredPrice(payableTotal, orderCurrency, currency, rates);

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
      {/* Banner is just the decorative top strip */}
      <Banner minHeight={35} bg={bg} />

      {/* Content lives outside the banner */}
      <main className="w-full pb-20 text-black bg-white">
        <div className="w-full gap-5 px-5 py-12 text-center text-black bg-white border-t border-b md:px-20">
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

          {order && !order.userId && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl inline-block">
              <p className="text-amber-800 font-medium">
                {common.saveOrderIdReminder || 'Please save this Order ID for future reference, as you are checking out as a guest.'}
              </p>
            </div>
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
                    {(() => {
                      const mode = order.mode;
                      const creditApplied = order?.price?.creditApplied || 0;
                      const amount = order?.amount || 0;
                      const modeLabel =
                        mode === 'cod' ? 'COD' : mode === 'card' ? 'Card' : mode;
                      if (creditApplied > 0) {
                        if (amount > 0) {
                          return `Credits ${modeLabel === "credits"? "" : `+ ${modeLabel}`}`;
                        }
                        return 'Credits';
                      }
                      return modeLabel || 'N/A';
                    })()}
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
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <div className="flex flex-col gap-2 max-w-sm">
                    <div className="flex justify-between items-center">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        Total
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(displayTotal, currency)}
                      </p>
                    </div>
                    {displayCredits > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <p className="text-xs uppercase tracking-[0.3em]">
                          Credits Used
                        </p>
                        <p className="text-lg font-semibold">
                          -{formatPrice(displayCredits, currency)}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t pt-2 mt-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        {order?.paymentMethod?.includes('cod') || order?.mode === 'cod' 
                          ? 'Amount Due' 
                          : order?.paymentStatus === 'Paid' ? 'Amount Paid' : 'Amount to be Paid'}
                      </p>
                      <p className="text-xl font-bold text-5th">
                        {formatPrice(displayPayable, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-8 justify-center mt-6 md:flex-row">
            <CommonButton variant={6} isLink to="/product-listings">
              {common.continueShopping}
            </CommonButton>
            {isUserSignedIn() && (
              <CommonButton variant={6} isLink to="/profile/my-orders">
                {common.myOrders}
              </CommonButton>
            )}
          </div>
        </div>
      </main>

      <NewsLetter />
    </div>
  );
};

export default OrderSuccess;
