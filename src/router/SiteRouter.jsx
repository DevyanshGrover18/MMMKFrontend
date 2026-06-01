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
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const ReturnPolicy = lazy(() => import('../pages/ReturnPolicy'));
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
const Profile = lazy(() => import('../pages/ProfileSidebar'));
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
      <Routes>
        {/* User Routes */}
        <Route element={<Root />}>
          <Route
            index
            element={
              <Suspense fallback={<SiteLoading />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="/product-listings"
            element={
              <Suspense fallback={<SiteLoading />}>
                <ProductListing />
              </Suspense>
            }
          />
          <Route
            path="/product-details/:id"
            element={
              <Suspense fallback={<SiteLoading />}>
                <ProductDetails />
              </Suspense>
            }
          />
          <Route
            path="/shopping-cart"
            element={
              <UserProtectedRoute>
                <Suspense fallback={<SiteLoading />}>
                  <ShoppingCart />
                </Suspense>
              </UserProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <UserProtectedRoute>
                <Suspense fallback={<SiteLoading />}>
                  <Checkout />
                </Suspense>
              </UserProtectedRoute>
            }
          />
          <Route
            path="/thank-you/:orderId"
            element={
              <UserProtectedRoute>
                <Suspense fallback={<SiteLoading />}>
                  <ThankYou />
                </Suspense>
              </UserProtectedRoute>
            }
          />
          <Route
            path="/order-success/:orderId"
            element={
              <UserProtectedRoute>
                <Suspense fallback={<SiteLoading />}>
                  <OrderSuccess />
                </Suspense>
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
                    <Profile>
                      <MyAccounts />
                    </Profile>
                  </Suspense>
                </UserProtectedRoute>
              }
            />
            <Route
              path="my-orders"
              element={
                <UserProtectedRoute>
                  <Suspense fallback={<SiteLoading />}>
                    <Profile>
                      <MyOrders />
                    </Profile>
                  </Suspense>
                </UserProtectedRoute>
              }
            />
            <Route
              path="saved-items"
              element={
                <UserProtectedRoute>
                  <Suspense fallback={<SiteLoading />}>
                    <Profile>
                      <SavedItems />
                    </Profile>
                  </Suspense>
                </UserProtectedRoute>
              }
            />
            <Route
              path="address-book"
              element={
                <UserProtectedRoute>
                  <Suspense fallback={<SiteLoading />}>
                    <Profile>
                      <AddressBook />
                    </Profile>
                  </Suspense>
                </UserProtectedRoute>
              }
            />
            <Route
              path="my-credit"
              element={
                <UserProtectedRoute>
                  <Suspense fallback={<SiteLoading />}>
                    <Profile>
                      <MyCredit />
                    </Profile>
                  </Suspense>
                </UserProtectedRoute>
              }
            />
            <Route
              path="payment-methods"
              element={
                <UserProtectedRoute>
                  <Suspense fallback={<SiteLoading />}>
                    <Profile>
                      <PaymentMethods />
                    </Profile>
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
          <Route
            path="/auth"
            element={
              <Suspense fallback={<SiteLoading />}>
                <AuthPage />
              </Suspense>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<SiteLoading />}>
                <ForgetPassword />
              </Suspense>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <Suspense fallback={<SiteLoading />}>
                <NewPassword />
              </Suspense>
            }
          />
          <Route
            path="/about-us"
            element={
              <Suspense fallback={<SiteLoading />}>
                <AboutUs />
              </Suspense>
            }
          />
          <Route
            path="/contact-us"
            element={
              <Suspense fallback={<SiteLoading />}>
                <ContactUs />
              </Suspense>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <Suspense fallback={<SiteLoading />}>
                <PrivacyPolicy />
              </Suspense>
            }
          />
          <Route
            path="/return-policy"
            element={
              <Suspense fallback={<SiteLoading />}>
                <ReturnPolicy />
              </Suspense>
            }
          />
          <Route
            path="/refund-policy"
            element={
              <Suspense fallback={<SiteLoading />}>
                <ReturnPolicy />
              </Suspense>
            }
          />
          {...[
            'terms-conditions',
          ].map((path) => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <Suspense fallback={<SiteLoading />}>
                  <ComingSoon />
                </Suspense>
              }
            />
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
    </CartProvider>
  );
}
