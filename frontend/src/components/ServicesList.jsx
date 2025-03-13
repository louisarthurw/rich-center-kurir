import { motion } from "framer-motion";
import { Pencil, PlusCircle } from "lucide-react";
import { useServiceStore } from "../stores/useServiceStore";
import { useEffect } from "react";

const ServicesList = ({ onAddService, onEditService }) => {
  const { services, getAllServices } = useServiceStore();

  useEffect(() => {
    getAllServices();
  }, [getAllServices]);

  return (
    <motion.div
      className="shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex justify-end">
        <button
          className="flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white"
          onClick={onAddService}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Service
        </button>
      </div>

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
              Description
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Price
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
          {services?.map((service, index) => (
            <tr key={service.id} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-gray-300">{index + 1}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={service.image}
                      alt={service.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">
                      {service.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-start">
                <div className="text-sm text-gray-300 max-w-[350px] h-12 py-1 overflow-hidden hover:overflow-auto flex items-center">
                  {service.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-gray-300">
                  Rp{new Intl.NumberFormat("id-ID").format(service.price)},00
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-gray-300">{service.status}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex justify-center ">
                  <button
                    className="text-blue-600 hover:text-blue-500"
                    onClick={() => onEditService(service.id)}
                  >
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

export default ServicesList;
