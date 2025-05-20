import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { useCustomerStore } from "../stores/useCustomerStore";
import { useEffect } from "react";

const CustomersList = ({ onEditCustomer }) => {
  const { loading, customers, getAllCustomers } = useCustomerStore();

  useEffect(() => {
    getAllCustomers();
  }, [getAllCustomers]);

  console.log(customers);

  if (loading) {
    return <div className="text-black">Loading...</div>;
  }

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="overflow-x-auto">
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
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {customers?.map((customer, index) => (
              <tr key={customer.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-300">{index + 1}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-start">
                  <div className="text-sm text-gray-300">{customer.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-start">
                  <div className="text-sm text-gray-300">{customer.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-300">
                    {customer.phone_number}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-center ">
                    <button
                      className="text-blue-500 hover:text-blue-400"
                      onClick={() => onEditCustomer(customer.id)}
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

export default CustomersList;
