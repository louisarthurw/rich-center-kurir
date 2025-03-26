import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center bg-gradient-to-b from-gray-900 to-gray-800 text-white px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full items-center justify-center">
        {/* Bagian Teks */}
        <div className="text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-emerald-400">
            SELAMAT DATANG DI
          </h1>
          <h1 className="text-4xl sm:text-5xl font-bold text-emerald-400 mt-1">
            RICH CENTER KURIR
          </h1>
          <p className="text-lg md:text-3xl mt-4 font-semibold">
            Layanan Kurir Daerah Surabaya
          </p>
          <p className="text-lg md:text-3xl font-semibold">
            Paling Murah dan Akurat
          </p>
          <p className="text-gray-300 text-base sm:text-lg mt-4">
            Kami menyediakan jasa pengiriman barang ke seluruh daerah Surabaya
            dengan tarif mulai dari{" "}
            <span className="font-semibold text-emerald-400">Rp12.000</span>.{" "}
            Tenang saja, barang <br /> Anda dijamin aman dan segera sampai ke
            tempat tujuan!
          </p>
          <button className="mt-4 bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg text-lg shadow-lg transition-all duration-300">
            <Link
              to={"/services"}
              className=" text-white rounded-md flex items-center transition duration-300 ease-in-out"
            >
              <Compass className="mr-2" size={18} />
              Explore Our Services
            </Link>
          </button>
        </div>

        {/* Bagian Gambar */}
        <div className="flex justify-center items-center">
          <img
            src="/assets/rich-center-kurir-logo.png"
            alt="logo"
            className="w-96 h-96 object-contain transition-transform duration-500 ease-out hover:scale-110"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
