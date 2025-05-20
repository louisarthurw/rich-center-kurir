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
import Swal from "sweetalert2";
import { useUserStore } from "../stores/useUserStore";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, keluarkan aku!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10baee",
      cancelButtonColor: "#374151",
    });

    if (result.isConfirmed) {
      navigate("/");
      logout();
      setIsOpen(false); // Tutup navbar setelah logout
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-slate-200 bg-opacity-90 backdrop-blur-md shadow-lg z-40 border-b border-[#10baee]">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-[#10baee]">
          Rich Center Kurir
        </Link>

        <button
          className="md:hidden text-black text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <nav
          className={`absolute md:static top-14 left-0 w-full md:w-auto bg-slate-200 md:bg-transparent shadow-md md:shadow-none 
          transition-all duration-300 ease-in-out flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-0 ${
            isOpen ? "block" : "hidden md:flex"
          }`}
        >
          <Link to="/" className="text-black hover:text-[#10baee]">
            Home
          </Link>

          {!isAdmin && (
            <Link
              to="/services"
              className="flex items-center text-black hover:text-[#10baee]"
            >
              <Package className="mr-1" size={20} />
              <span>Services</span>
            </Link>
          )}

          {user && (
            <>
              <Link
                to="/profile"
                className="flex items-center text-black hover:text-[#10baee]"
              >
                <User2 className="mr-1" size={20} />
                <span>Profile</span>
              </Link>
              {!isAdmin && (
                <Link
                  to="/orders"
                  className="flex items-center text-black hover:text-[#10baee]"
                >
                  <ClipboardList className="mr-1" size={20} />
                  <span>Orders</span>
                </Link>
              )}
            </>
          )}

          {isAdmin && (
            <Link
              to="/secret-dashboard"
              className="bg-[#10baee] hover:bg-[#0aa2cc] text-white px-4 py-2 rounded-md flex items-center transition duration-300 ease-in-out"
            >
              <Lock className="mr-1" size={18} />
              <span>Dashboard</span>
            </Link>
          )}

          {user ? (
            <button
              className="bg-gray-600 hover:bg-gray-700 text-slate-200 py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span className="ml-2">Log Out</span>
            </button>
          ) : (
            <>
              <Link
                to="/signup"
                className="bg-[#10baee] hover:bg-[#0aa2cc] text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
              >
                <UserPlus className="mr-2" size={18} />
                Sign Up
              </Link>
              <Link
                to="/login"
                className="bg-gray-600 hover:bg-gray-700 text-slate-200 py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
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
