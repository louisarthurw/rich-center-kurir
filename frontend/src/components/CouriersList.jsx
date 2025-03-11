import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { useCourierStore } from "../stores/useCourierStore";
import { useEffect } from "react";

const CouriersList = () => {
  const { couriers, getAllCouriers } = useCourierStore();

  useEffect(() => {
    getAllCouriers();
  }, [getAllCouriers]);

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
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
              Address
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
              <td className="px-6 py-4 whitespace-nowrap text-start">
                <div className="text-sm text-gray-300">{courier.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-gray-300">
                  {courier.phone_number}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-gray-300">{courier.address}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-gray-300">{courier.role}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-gray-300">{courier.status}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex justify-center ">
                  <button className="text-blue-400 hover:text-blue-300">
                    <Pencil className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default CouriersList;
