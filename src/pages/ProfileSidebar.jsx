import { useState } from 'react';
import Banner from '../components/global/Banner';
import { FaBox, FaMapMarkerAlt, FaMoneyBill, FaUser } from 'react-icons/fa';
import { BsCart3, BsCashCoin } from 'react-icons/bs';
import { IoIosLogOut } from 'react-icons/io';
import bgImage from '../assets/bg.png';
import { useUserAuthContext } from '../context/userAuthProvider';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { userLogout } from '../apis/nonAuth/userAuth';
import { RiMoneyDollarBoxFill } from 'react-icons/ri';
import { useTranslationContext } from '../context/TranslationContext';
import { useCart } from '../context/CartProvider';

const Profile = ({ children }) => {
  const {
    content: { profile },
  } = useTranslationContext();
  const navigate = useNavigate();
  const { setData } = useUserAuthContext();
  const [menuItemOpen, setMenuItemOpen] = useState(false);
  const { pathname } = useLocation();
  const { clearCart } = useCart();

  const handleMenuToggle = () => setMenuItemOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await userLogout();
      setData({});
      localStorage.removeItem('userToken');
      clearCart();
      return navigate('/');
    } catch (err) {
      console.log(err);
      message.error('Something went wrong, please refresh the page');
    }
  };

  return (
    <div className="w-full">
      <Banner bg={bgImage}>
        <div className="text-white text-center md:h-[0vh] h-[20vh] flex flex-col items-center justify-center md:mt-16 md:mb-0 "></div>
      </Banner>

      {/* Mobile Menu Toggle */}
      <div className="my-4 text-center md:hidden" onClick={handleMenuToggle}>
        {menuItemOpen ? (
          // "X" icon for closing the menu
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-8 h-8 mx-auto cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Hamburger icon for opening the menu
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-8 h-8 mx-auto cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </div>

      <div className="w-full mt-10">
        <main className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Left Sidebar */}
          <div
            className={`col-span-12 md:col-span-3 bg-[#d9d9d9] p-5 rounded-lg shadow-lg md:block md:static  ${
              menuItemOpen
                ? ' absolute top-80 left-0 z-50 w-[100%] h-auto bg-[#d9d9d9] bg-opacity-90 md:w-full transition-all ease-in-out duration-300'
                : 'hidden md:flex-wrap'
            }`}
          >
            {/* Menu Items */}
            {[
              {
                icon: <FaUser />,
                label: profile.myAccount,
                key: 'my-account',
                to: '/profile/my-account',
              },
              {
                icon: <FaBox />,
                label: profile.myOrders,
                key: 'my-order',
                to: '/profile/my-orders',
              },
              {
                icon: <BsCart3 />,
                label: profile.savedItems,
                key: 'savedItem',
                to: '/profile/saved-items',
              },
              {
                icon: <FaMapMarkerAlt />,
                label: profile.addressBook,
                key: 'address-book',
                to: '/profile/address-book',
              },
              {
                icon: <RiMoneyDollarBoxFill />,
                label: profile.myCredit,
                key: 'my-credit',
                to: '/profile/my-credit',
              },
              {
                icon: <BsCashCoin />,
                label: profile.paymentMethods,
                key: 'payment-method',
                to: '/profile/payment-methods',
              },
              {
                icon: <IoIosLogOut />,
                label: profile.signOut,
                key: 'sign-out',
              },
            ].map(({ icon, label, key, to }) => (
              <Link
                to={to}
                key={key}
                className={`px-3 py-3 flex items-center gap-5 cursor-pointer text-sm md:text-lg  duration-300 hover:bg-[#28120b] hover:text-white rounded-lg mb-2 ${
                  pathname.includes(to) ? 'bg-[#28120b] text-white' : ''
                }`}
                onClick={(e) => {
                  if (key === 'sign-out') {
                    e.preventDefault(); // Prevent navigation for sign-out
                    handleLogout();
                    return;
                  }
                }}
              >
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Right Content Area */}
          <div className="col-span-12 p-5 bg-white rounded-lg shadow-lg md:col-span-9 md:p-10 lg:px-20">
            {children}
            {/* {show === "my-account" && <MyAccounts />}
            {show === "my-order" && (
              <MyOrders setShow={setShow} setActiveOrder={setActiveOrder} />
            )}
            {show === "particular-order" && (
              <ParticularOrder
                setActiveOrder={setActiveOrder}
                activeOrder={activeOrder}
              />
            )}
            {show === "savedItem" && <SavedItems />}
            {show === "address-book" && <AddressBook />}
            {show === "payment-method" && <PaymentMethods />} */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
