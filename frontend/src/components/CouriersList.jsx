import { motion } from "framer-motion";
import { Pencil, PlusCircle } from "lucide-react";
import { useCourierStore } from "../stores/useCourierStore";
import { useEffect } from "react";

const CouriersList = ({ onAddCourier, onEditCourier }) => {
  const { loading, couriers, getAllCouriers } = useCourierStore();

  useEffect(() => {
    getAllCouriers();
  }, [getAllCouriers]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <motion.div
      className="shadow-lg overflow-hidden max-w-6xl mx-auto space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex justify-end">
        <button
          className="flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white"
          onClick={onAddCourier}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Courier
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg overflow-hidden">
        <table className=" min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                #
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Address
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Phone Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {couriers?.map((courier, index) => (
              <tr key={courier.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-300">{index + 1}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-start">
                  <div className="text-sm text-gray-300">{courier.name}</div>
                </td>
                <td className="px-6 py-4 text-start">
                  <div className="text-sm text-gray-300 max-w-[280px] py-1 overflow-hidden hover:overflow-auto flex items-center">
                    {courier.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-start">
                  <div className="text-sm text-gray-300">{courier.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-300">
                    {courier.phone_number}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div
                    className={`text-sm font-semibold uppercase ${
                      courier.role === "regular"
                        ? "text-blue-500"
                        : courier.role === "special"
                        ? "text-yellow-500"
                        : courier.role === "car"
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  >
                    {courier.role === "regular"
                      ? "Kurir Regular"
                      : courier.role === "special"
                      ? "Kurir Khusus"
                      : courier.role === "car"
                      ? "Kurir Mobil"
                      : "Role Tidak Diketahui"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div
                    className={`text-sm font-semibold uppercase ${
                      courier.status === "active"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {courier.status}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-center ">
                    <button
                      className="text-blue-500 hover:text-blue-400"
                      onClick={() => onEditCourier(courier.id)}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default CouriersList;
