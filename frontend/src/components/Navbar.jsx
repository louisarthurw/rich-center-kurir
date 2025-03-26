import { useState } from "react";
import {
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  Package,
  User2,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
    logout();
    setIsOpen(false); // Tutup navbar setelah logout
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 border-b border-emerald-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-emerald-400">
          Rich Center Kurir
        </Link>

        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <nav
          className={`absolute md:static top-14 left-0 w-full md:w-auto bg-gray-900 md:bg-transparent shadow-md md:shadow-none 
          transition-all duration-300 ease-in-out flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-0 ${
            isOpen ? "block" : "hidden md:flex"
          }`}
        >
          <Link to="/" className="text-gray-300 hover:text-emerald-400">
            Home
          </Link>

          <Link
            to="/services"
            className="flex items-center text-gray-300 hover:text-emerald-400"
          >
            <Package className="mr-1" size={20} />
            <span>Services</span>
          </Link>

          {user && (
            <>
              <Link
                to="/profile"
                className="flex items-center text-gray-300 hover:text-emerald-400"
              >
                <User2 className="mr-1" size={20} />
                <span>Profile</span>
              </Link>
              <Link
                to="/orders"
                className="flex items-center text-gray-300 hover:text-emerald-400"
              >
                <ClipboardList className="mr-1" size={20} />
                <span>Orders</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/secret-dashboard"
              className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center transition duration-300 ease-in-out"
            >
              <Lock className="mr-1" size={18} />
              <span>Dashboard</span>
            </Link>
          )}

          {user ? (
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span className="ml-2">Log Out</span>
            </button>
          ) : (
            <>
              <Link
                to="/signup"
                className="bg-emerald-700 hover:bg-emerald-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
              >
                <UserPlus className="mr-2" size={18} />
                Sign Up
              </Link>
              <Link
                to="/login"
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
              >
                <LogIn className="mr-2" size={18} />
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
