import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Phone,
  Package,
  Scale,
  Calendar,
  NotepadText,
  Truck,
  Loader,
  Home,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import Swal from "sweetalert2";
import { useOrderStore } from "../stores/useOrderStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { useUserStore } from "../stores/useUserStore";
import { useCourierStore } from "../stores/useCourierStore";

const OrderDetailPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const navigate = useNavigate();

  const {
    loading,
    pickup_details,
    delivery_details,
    getOrder,
    setDeliveryDetails,
    assignKurirManual,
  } = useOrderStore();
  const { user } = useUserStore();
  const { couriers, getAvailableCouriers } = useCourierStore();
  const takePackageOnBehalf = pickup_details?.take_package_on_behalf_of !== "";
  const dropship = delivery_details[0]?.sender_name !== "";

  // console.log(pickup_details);
  // console.log(delivery_details)

  useEffect(() => {
    getOrder(orderId);
  }, [getOrder, orderId]);

  useEffect(() => {
    getAvailableCouriers();
  }, [getAvailableCouriers]);

  const handleCourierChange = (index, courierId) => {
    const updatedDetails = [...delivery_details];

    if (courierId === null || Number.isNaN(courierId)) {
      updatedDetails[index].courier_id = null;
      updatedDetails[index].courier_name = null;
    } else {
      updatedDetails[index].courier_id = courierId;
      const selectedCourier = couriers.find(
        (courier) => courier.id === courierId
      );
      if (selectedCourier) {
        updatedDetails[index].courier_name = selectedCourier.name;
      }
    }

    setDeliveryDetails(updatedDetails);
  };

  const [expandedAddresses, setExpandedAddresses] = useState([]);

  const toggleAddress = (index) => {
    if (expandedAddresses.includes(index)) {
      setExpandedAddresses(expandedAddresses.filter((i) => i !== index));
    } else {
      setExpandedAddresses([...expandedAddresses, index]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(delivery_details);

    const result = await Swal.fire({
      title: "Konfirmasi Assignment Kurir",
      text: "Apakah Anda yakin ingin membuat perubahan terhadap assignment kurir?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, benar!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10baee",
      cancelButtonColor: "#374151",
    });

    if (result.isConfirmed) {
      const success = await assignKurirManual(delivery_details);

      if (success === true) {
        navigate("/secret-dashboard", {
          state: { activeTab: "orders" },
        });
      }
    }
  };

  if (!orderId) {
    return <p className="text-red-500">Error: No order selected</p>;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-center text-3xl font-extrabold text-[#10baee]">
          Detail Order
        </h2>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#10baee]">
                Detail Service
              </h2>

              <div className="gap-4 flex items-center p-4 border border-gray-600 rounded-lg bg-gray-800">
                <img
                  src={pickup_details.service_image}
                  alt={pickup_details.service_name}
                  className="w-24 h-24 object-cover rounded-md"
                />

                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-white">
                    {pickup_details.service_name}
                  </h2>
                  <p className="text-slate-200">
                    Harga per Alamat:{" "}
                    <span className="font-medium text-slate-200">
                      Rp
                      {new Intl.NumberFormat("id-ID").format(
                        pickup_details.service_price
                      )}
                      ,00
                    </span>
                  </p>
                  <p className="text-slate-200">
                    Jumlah Alamat:{" "}
                    <span className="font-medium">
                      {pickup_details.total_address}
                    </span>
                  </p>
                  <p className="text-slate-200">
                    Total:{" "}
                    <span className="font-medium text-[#10baee]">
                      Rp
                      {new Intl.NumberFormat("id-ID").format(
                        pickup_details.subtotal
                      )}
                      ,00
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#10baee]">
                Detail Pengambilan Barang
              </h2>

              <div className="flex items-center justify-between">
                <h2 className="block text-md font-medium text-slate-200">
                  Ambil Barang di Tempat Orang Lain
                </h2>
                <Switch
                  checked={takePackageOnBehalf}
                  className={`${
                    takePackageOnBehalf ? "bg-[#10baee]" : "bg-gray-600"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      takePackageOnBehalf ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>

              <div className="space-y-4 p-4 border border-gray-600 rounded-lg bg-gray-800">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Tanggal
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="date"
                      type="date"
                      required
                      readOnly
                      value={
                        pickup_details.date
                          ? new Date(pickup_details.date)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pickup_name"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Nama
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="pickup_name"
                      type="text"
                      required
                      readOnly
                      value={pickup_details.pickup_name}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pickup_phone_number"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Nomor Telepon
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="pickup_phone_number"
                      type="tel"
                      pattern="[0-9]{10,12}"
                      required
                      readOnly
                      value={pickup_details.pickup_phone_number}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                      placeholder="08123456789"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pickup_address"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Alamat
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="pickup_address"
                      type="text"
                      required
                      readOnly
                      value={pickup_details.pickup_address}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                      placeholder="Jalan A No. 1"
                    />
                  </div>
                </div>

                {pickup_details.lat &&
                  pickup_details.long &&
                  user.role === "admin" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-200">
                        Titik Koordinat
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </div>
                        <input
                          type="text"
                          required
                          readOnly
                          className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                          placeholder="Jalan A No. 1"
                          value={`${pickup_details.lat}, ${pickup_details.long}`}
                        />
                      </div>
                    </div>
                  )}

                <div>
                  <label
                    htmlFor="pickup_notes"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Catatan Tambahan
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-2 pointer-events-none">
                      <NotepadText
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <textarea
                      id="pickup_notes"
                      rows={5}
                      value={pickup_details.pickup_notes}
                      readOnly
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Jenis Barang
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="type"
                      type="text"
                      required
                      readOnly
                      value={pickup_details.type}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                      placeholder="Dokumen / Makanan / Baju / dll"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Perkiraan Berat (kg)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Scale
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="weight"
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      readOnly
                      value={pickup_details.weight}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                      placeholder="1,5"
                    />
                  </div>
                </div>

                {takePackageOnBehalf && (
                  <div>
                    <label
                      htmlFor="take_package_on_behalf_of"
                      className="block text-sm font-medium text-slate-200"
                    >
                      Ambil Kiriman Atas Nama
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        id="take_package_on_behalf_of"
                        type="text"
                        required
                        readOnly
                        value={pickup_details.take_package_on_behalf_of}
                        className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#10baee]">
                Detail Pengiriman Barang
              </h2>

              <div className="flex items-center justify-between">
                <h2 className="block text-md font-medium text-slate-200">
                  Dropship
                </h2>
                <Switch
                  checked={dropship}
                  className={`${
                    dropship ? "bg-[#10baee]" : "bg-gray-600"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      dropship ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>

              {delivery_details.map((detail, index) => (
                <div
                  key={index}
                  className="border border-gray-600 rounded-lg bg-gray-800 overflow-hidden mb-4"
                >
                  <div
                    className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-700 transition-colors"
                    onClick={() => toggleAddress(index)}
                  >
                    <div className="flex-1 min-w-0">
                      {expandedAddresses.includes(index) ? (
                        <p className="text-slate-200 font-medium text-lg">{`Alamat ${
                          index + 1
                        }`}</p>
                      ) : (
                        <div>
                          <p className="text-slate-200 font-medium">{`${
                            index + 1
                          }. ${detail.delivery_name}`}</p>
                          <p className="text-slate-400 text-sm">
                            {detail.delivery_address}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center ml-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full uppercase ${
                          detail.address_status === "waiting"
                            ? "bg-blue-400"
                            : detail.address_status === "ongoing"
                            ? "bg-yellow-500"
                            : detail.address_status === "delivered"
                            ? "bg-green-500"
                            : detail.address_status === "cancelled"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        } text-white`}
                      >
                        {detail.address_status}
                      </span>
                      <svg
                        className={`w-4 h-4 ml-2 text-gray-400 transform transition-transform ${
                          expandedAddresses.includes(index) ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {expandedAddresses.includes(index) && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-200">
                          Nama Penerima
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </div>
                          <input
                            type="text"
                            required
                            readOnly
                            className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                            placeholder="John Doe"
                            value={detail.delivery_name}
                          />
                        </div>
                      </div>

                      {dropship && (
                        <div>
                          <label className="block text-sm font-medium text-slate-200">
                            Nama Pengirim
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </div>
                            <input
                              type="text"
                              required
                              readOnly
                              className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                              placeholder="John Doe"
                              value={detail.sender_name}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-slate-200">
                          Alamat
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Home
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </div>
                          <input
                            type="text"
                            required
                            readOnly
                            className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                            placeholder="Jalan A No. 1"
                            value={detail.delivery_address}
                          />
                        </div>
                      </div>

                      {detail.lat && detail.long && user.role === "admin" && (
                        <div>
                          <label className="block text-sm font-medium text-slate-200">
                            Titik Koordinat
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MapPin
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </div>
                            <input
                              type="text"
                              required
                              readOnly
                              className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                              placeholder="Jalan A No. 1"
                              value={`${detail.lat}, ${detail.long}`}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-slate-200">
                          Nomor Telepon
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </div>
                          <input
                            type="tel"
                            pattern="[0-9]{10,12}"
                            required
                            readOnly
                            className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                            placeholder="08123456789"
                            value={detail.delivery_phone_number}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-200">
                          Catatan Tambahan
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-2 pointer-events-none">
                            <NotepadText
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </div>
                          <textarea
                            rows={5}
                            value={detail.delivery_notes}
                            readOnly
                            className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                          />
                        </div>
                      </div>

                      {detail.courier_id && user.role === "customer" && (
                        <div>
                          <label className="block text-sm font-medium text-slate-200">
                            Nama Kurir
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Truck
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </div>
                            <input
                              type="text"
                              required
                              readOnly
                              className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                              placeholder="John Doe"
                              value={detail.courier_name}
                            />
                          </div>
                        </div>
                      )}

                      {user.role === "admin" &&
                        (pickup_details.service_id === 2 ||
                          pickup_details.service_id === 3 ||
                          pickup_details.service_id === 4) &&
                        detail.courier_name && (
                          <div>
                            <label className="block text-sm font-medium text-slate-200">
                              Nama Kurir
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Truck
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              </div>
                              <input
                                type="text"
                                required
                                readOnly
                                className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-slate-200 focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                                placeholder="John Doe"
                                value={detail.courier_name}
                              />
                            </div>
                          </div>
                        )}

                      {user.role === "admin" &&
                        pickup_details.service_id === 1 && (
                          <div>
                            <label className="block text-sm font-medium text-slate-200">
                              Nama Kurir
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Truck
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              </div>
                              <select
                                className="block w-full px-3 py-2 pl-10 pr-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-[#10baee] focus:border-[#10baee] sm:text-sm"
                                value={detail.courier_id || ""}
                                onChange={(e) =>
                                  handleCourierChange(
                                    index,
                                    Number(e.target.value)
                                  )
                                }
                              >
                                <option value={null}>Pilih Kurir</option>
                                {couriers.map((courier) => (
                                  <option key={courier.id} value={courier.id}>
                                    {courier.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                      {detail.proof_image && (
                        <div className="relative">
                          <label className="block text-sm font-medium text-slate-200">
                            Bukti Foto
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <img
                              src={detail.proof_image}
                              alt="Bukti Pengiriman"
                              className="block w-full h-auto rounded-md shadow-sm border border-gray-600"
                            />
                            {detail.proof_coordinate && (
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-lg font-semibold px-2 py-1 rounded">
                                {`Koordinat : ${detail.proof_coordinate}`}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    user.role === "admin" ? "/secret-dashboard" : "/orders",
                    {
                      state: { activeTab: "orders" },
                    }
                  )
                }
                className={`${
                  user.role === "admin" && pickup_details.service_id === 1
                    ? "w-1/2"
                    : "w-full"
                } flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-slate-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out`}
              >
                Back
              </button>

              {user.role === "admin" && pickup_details.service_id === 1 && (
                <button
                  type="submit"
                  className="w-1/2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#10baee] hover:bg-[#0aa2cc]focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10baee] transition duration-150 ease-in-out disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader
                        className="mr-2 h-5 w-5 animate-spin"
                        aria-hidden="true"
                      />
                      Loading...
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailPage;
