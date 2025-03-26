import { useEffect } from "react";

import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";
import ScrollToTop from "./components/ScrollToTop";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import ServicesPage from "./pages/ServicesPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import OrderPage from "./pages/OrderPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";

import { useUserStore } from "./stores/useUserStore";

import { Toaster } from "react-hot-toast";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log(user);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]" />
        </div>
      </div>

      {/* <div className="relative z-50 md:pt-16 pt-24"> */}
      <div className="relative z-50 pt-14 md:pt-16">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />}></Route>
          <Route
            path="/signup"
            element={!user ? <SignUpPage /> : <Navigate to="/" />}
          ></Route>
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" />}
          ></Route>
          <Route path="/services" element={<ServicesPage />}></Route>
          <Route
            path="/profile"
            element={!user ? <LoginPage /> : <ProfilePage id={user.id} />}
          ></Route>
          <Route
            path="/services/order/:id"
            element={!user ? <LoginPage /> : <OrderPage id={user.id} />}
          ></Route>
          <Route
            path="/orders"
            element={!user ? <LoginPage /> : <OrderHistoryPage />}
          ></Route>
          <Route
            path="/orders/detail"
            element={!user ? <LoginPage /> : <OrderDetailPage />}
          ></Route>
          <Route
            path="/profile/change-password"
            element={
              !user ? <LoginPage /> : <ChangePasswordPage id={user.id} />
            }
          ></Route>
          <Route
            path="/secret-dashboard"
            element={
              user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />
            }
          ></Route>
          {/* <Route path="/category/:category" element={<CategoryPage />}></Route> */}
        </Routes>

        <ScrollToTop />
      </div>

      <Toaster />
    </div>
  );
}

export default App;
