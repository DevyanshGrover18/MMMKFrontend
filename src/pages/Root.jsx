import { Outlet, useLocation } from 'react-router-dom';

import Header from '../layout/Header';
import Footer from '../layout/Footer';
import ScrollToTop from '../hook/ScrollTop';

const Root = () => {
  const location = useLocation();
  // const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith('/admin');
  // const isLoggedIn = true;

  // if (isLoggedIn && !isAdminRoute) {
  //   navigate("/admin/dashboard");
  // }

  return (
    <div className="w-full">
      <Header />
      <ScrollToTop>
        <Outlet />
      </ScrollToTop>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default Root;
