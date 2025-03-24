import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Phone,
  Package,
  Scale,
  Calendar,
  Trash,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Switch } from "@headlessui/react";

const OrderPage = ({ id }) => {
  const service_id = useParams().id;
  const user_id = id;
  const loading = false;

  // limit date yang bisa dipilih
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // logic untuk switch dropship
  const [dropship, setDropship] = useState(false);

  const handleDropshipChange = (value) => {
    console.log("Dropship status:", value);
    setDropship(value);
  };

  // logic untuk ambil paket di tempat orang lain
  const [takePackageOnBehalf, setTakePackageOnBehalf] = useState(false);

  const handleTakePackageOnBehalfChange = (value) => {
    console.log("Ambil barang di rumah orang lain status:", value);
    setTakePackageOnBehalf(value);
  };

  // menyimpan pickup details
  const [pickupDetails, setPickupDetails] = useState({
    date: "",
    pickup_name: "",
    pickup_address: "",
    pickup_phone_number: "",
    type: "",
    weight: "",
    take_package_on_behalf_of: "",
  });

  const handlePickupDetailsChange = (e) => {
    const { id, value } = e.target;
    setPickupDetails((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // menyimpan delivery details
  const [deliveryDetails, setDeliveryDetails] = useState([
    {
      delivery_name: "",
      delivery_address: "",
      delivery_phone_number: "",
      sender_name: "",
    },
  ]);

  const addAddress = () => {
    setDeliveryDetails([
      ...deliveryDetails,
      {
        delivery_name: "",
        delivery_address: "",
        delivery_phone_number: "",
        sender_name: "",
      },
    ]);
  };

  const removeAddress = (index) => {
    setDeliveryDetails(deliveryDetails.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("user id:", user_id);
    console.log("service id:", service_id);
    console.log("pickup_details:", pickupDetails);
    console.log("delivery_details:", deliveryDetails);
  };

  return (
    <div className="flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-center text-3xl font-extrabold text-emerald-400">
          Form Order
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
              <h2 className="text-2xl font-semibold text-emerald-300">
                Detail Pengambilan Barang
              </h2>

              <div className="flex items-center justify-between">
                <h2 className="block text-md font-medium text-gray-300">
                  Ambil Barang di Tempat Orang Lain
                </h2>
                <Switch
                  checked={takePackageOnBehalf}
                  onChange={handleTakePackageOnBehalfChange}
                  className={`${
                    takePackageOnBehalf ? "bg-emerald-500" : "bg-gray-600"
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
                    className="block text-sm font-medium text-gray-300"
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
                      min={today}
                      max={tomorrowStr}
                      required
                      value={pickupDetails.date}
                      onChange={handlePickupDetailsChange}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pickup_name"
                    className="block text-sm font-medium text-gray-300"
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
                      value={pickupDetails.pickup_name}
                      onChange={handlePickupDetailsChange}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pickup_address"
                    className="block text-sm font-medium text-gray-300"
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
                      value={pickupDetails.pickup_address}
                      onChange={handlePickupDetailsChange}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      placeholder="Jalan A No. 1"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pickup_phone_number"
                    className="block text-sm font-medium text-gray-300"
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
                      required
                      value={pickupDetails.pickup_phone_number}
                      onChange={handlePickupDetailsChange}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      placeholder="08123456789"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-300"
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
                      value={pickupDetails.type}
                      onChange={handlePickupDetailsChange}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      placeholder="Dokumen / Makanan / Baju / dll"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-gray-300"
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
                      value={pickupDetails.weight}
                      onChange={handlePickupDetailsChange}
                      className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      placeholder="1.5"
                    />
                  </div>
                </div>

                {takePackageOnBehalf && (
                  <div>
                    <label
                      htmlFor="take_package_on_behalf_of"
                      className="block text-sm font-medium text-gray-300"
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
                        value={pickupDetails.take_package_on_behalf_of}
                        onChange={handlePickupDetailsChange}
                        className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-emerald-300">
                Detail Pengiriman Barang
              </h2>

              <div className="flex items-center justify-between">
                <h2 className="block text-md font-medium text-gray-300">
                  Dropship
                </h2>
                <Switch
                  checked={dropship}
                  onChange={handleDropshipChange}
                  className={`${
                    dropship ? "bg-emerald-500" : "bg-gray-600"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      dropship ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>

              {deliveryDetails.map((detail, index) => (
                <div
                  key={index}
                  className="space-y-4 p-4 border border-gray-600 rounded-lg bg-gray-800"
                >
                  <h3 className="text-lg font-semibold text-gray-300">
                    Alamat {index + 1}
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">
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
                        className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        placeholder="John Doe"
                        value={detail.delivery_name}
                        onChange={(e) => {
                          const newDetails = [...deliveryDetails];
                          newDetails[index].delivery_name = e.target.value;
                          setDeliveryDetails(newDetails);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">
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
                        type="text"
                        required
                        className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        placeholder="Jalan A No. 1"
                        value={detail.delivery_address}
                        onChange={(e) => {
                          const newDetails = [...deliveryDetails];
                          newDetails[index].delivery_address = e.target.value;
                          setDeliveryDetails(newDetails);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">
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
                        required
                        className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        placeholder="08123456789"
                        value={detail.delivery_phone_number}
                        onChange={(e) => {
                          const newDetails = [...deliveryDetails];
                          newDetails[index].delivery_phone_number =
                            e.target.value;
                          setDeliveryDetails(newDetails);
                        }}
                      />
                    </div>
                  </div>

                  {dropship && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
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
                          className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                          placeholder="John Doe"
                          value={detail.sender_name}
                          onChange={(e) => {
                            const newDetails = [...deliveryDetails];
                            newDetails[index].sender_name = e.target.value;
                            setDeliveryDetails(newDetails);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {index > 0 && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeAddress(index)}
                        className="mt-2 flex items-center px-3 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white transition"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Hapus Alamat
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={addAddress}
                  className="flex items-center px-4 py-2 text-emerald-500 border border-emerald-500 rounded-md hover:bg-emerald-500 hover:text-white transition"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Tambah Alamat
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              Place Order
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderPage;
