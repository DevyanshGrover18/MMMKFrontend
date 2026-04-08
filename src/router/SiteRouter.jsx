import { Navigate, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import UserProtectedRoute from '../components/global/UserProtectedRoute';
import CartProvider from '../context/CartProvider';
import SiteLoading from '../layout/SiteLoading';
import '../css/index.css';
import Root from '../pages/Root';
import ComingSoon from '../layout/ComingSoon';
// Lazy imports for all site pages
const Home = lazy(() => import('../pages/Home'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const ForgetPassword = lazy(() => import('../pages/ForgetPassword'));
const NewPassword = lazy(() => import('../pages/NewPassword'));
const ProductListing = lazy(() => import('../pages/ProductListing'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const ShoppingCart = lazy(() => import('../pages/ShoppingCart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const ThankYou = lazy(() => import('../pages/ThankYou'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
const BuyGiftCard = lazy(() => import('../pages/BuyGiftCard'));
const GiftCard = lazy(() => import('../pages/GiftCard'));
const ContactUs = lazy(() => import('../pages/ContactUs'));
const ProfileSidebar = lazy(() => import('../pages/ProfileSidebar'));
const CheckoutForm = lazy(() => import('../components/checkout/CheckoutForm'));
const ProductPage = lazy(() => import('../pages/ProductPage'));

const MyAccounts = lazy(() => import('../components/profiles/MyAccounts'));
const MyOrders = lazy(() => import('../components/profiles/MyOrders'));
const SavedItems = lazy(() => import('../components/profiles/SavedItems'));
const AddressBook = lazy(() => import('../components/profiles/AddressBook'));
const MyCredit = lazy(() => import('../components/profiles/MyCredit'));
const PaymentMethods = lazy(
  () => import('../components/profiles/PaymentMethods')
);
const AboutUs = lazy(() => import('../components/AboutUs'));
// Add more lazy imports as needed
const PageNotFound = lazy(() => import('../layout/PageNotFound'));

export default function SiteRouter() {
  return (
    <CartProvider>
      <Suspense fallback={<SiteLoading />}>
        <Routes>
          {/* User Routes */}
          <Route element={<Root />}>
            <Route index element={<Home />} />
            {/* <Route path="/product-page" element={<ProductPage />} /> */}
            <Route path="/product-listings" element={<ProductListing />} />
            <Route path="/product-details/:id" element={<ProductDetails />} />
            <Route
              path="/shopping-cart"
              element={
                // <UserProtectedRoute>
                <ShoppingCart />
                // </UserProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <UserProtectedRoute>
                  <Checkout />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/thank-you/:orderId"
              element={
                <UserProtectedRoute>
                  <ThankYou />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/order-success/:orderId"
              element={
                <UserProtectedRoute>
                  <OrderSuccess />
                </UserProtectedRoute>
              }
            />
            <Route path="/profile">
              <Route index element={<Navigate to="/profile/my-account" />} />
              <Route
                path="my-account"
                element={
                  <UserProtectedRoute>
                    <Suspense fallback={<SiteLoading />}>
                      <ProfileSidebar>
                        <MyAccounts />
                      </ProfileSidebar>
                    </Suspense>
                  </UserProtectedRoute>
                }
              />
              <Route
                path="my-orders"
                element={
                  <UserProtectedRoute>
                    <Suspense fallback={<SiteLoading />}>
                      <ProfileSidebar>
                        <MyOrders />
                      </ProfileSidebar>
                    </Suspense>
                  </UserProtectedRoute>
                }
              />
              <Route
                path="saved-items"
                element={
                  <UserProtectedRoute>
                    <Suspense fallback={<SiteLoading />}>
                      <ProfileSidebar>
                        <SavedItems />
                      </ProfileSidebar>
                    </Suspense>
                  </UserProtectedRoute>
                }
              />
              <Route
                path="address-book"
                element={
                  <UserProtectedRoute>
                    <Suspense fallback={<SiteLoading />}>
                      <ProfileSidebar>
                        <AddressBook />
                      </ProfileSidebar>
                    </Suspense>
                  </UserProtectedRoute>
                }
              />
              <Route
                path="my-credit"
                element={
                  <UserProtectedRoute>
                    <Suspense fallback={<SiteLoading />}>
                      <ProfileSidebar>
                        <MyCredit />
                      </ProfileSidebar>
                    </Suspense>
                  </UserProtectedRoute>
                }
              />
              <Route
                path="payment-methods"
                element={
                  <UserProtectedRoute>
                    <Suspense fallback={<SiteLoading />}>
                      <ProfileSidebar>
                        <PaymentMethods />
                      </ProfileSidebar>
                    </Suspense>
                  </UserProtectedRoute>
                }
              />
            </Route>
            <Route path="/gift-cards">
              <Route
                index
                element={
                  <UserProtectedRoute>
                    <Suspense fallback={<SiteLoading />}>
                      <GiftCard />
                    </Suspense>
                  </UserProtectedRoute>
                }
              />
              <Route
                path="buy"
                element={
                  <UserProtectedRoute>
                    <Suspense fallback={<SiteLoading />}>
                      <BuyGiftCard />
                    </Suspense>
                  </UserProtectedRoute>
                }
              />
            </Route>
            {/* <Route path="/checkout-form" element={<CheckoutForm />} /> */}
            {/* <Route path="/blogs" element={<BlogsLayout />} /> */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/reset-password/:token" element={<NewPassword />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            {...[
              'privacy-policy',
              'refund-policy',
              'terms-conditions',
            ].map((path) => (
              <Route key={path} path={`/${path}`} element={<ComingSoon />} />
            ))}

            <Route
              path="*"
              element={
                <Suspense fallback={<SiteLoading />}>
                  <PageNotFound />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </CartProvider>
  );
}
