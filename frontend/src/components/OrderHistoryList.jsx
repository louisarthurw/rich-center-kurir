import { useOrderStore } from "../stores/useOrderStore";
import { motion } from "framer-motion";
import { Eye, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderHistoryList = ({ activeTab }) => {
  const { orders } = useOrderStore();
  const navigate = useNavigate();

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => order.order_status === activeTab);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (filteredOrders.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="bg-gray-700 rounded-full p-6">
          <Package className="size-12 text-gray-300" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-[#10baee]">No orders found</h3>
          <p className="text-gray-700 max-w-sm">
            Get started by ordering your first service!
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto overflow-x-auto"
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
              Services
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Total
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Payment Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              Delivery Status
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
          {filteredOrders?.map((order, index) => (
            <tr key={order.id} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-gray-300">{index + 1}</div>
              </td>
              <td className="px-6 py-6 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-14 w-14">
                    <img
                      className="h-14 w-14 rounded-md object-cover"
                      src={order.service_image}
                      alt={order.service_name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-md font-medium text-white">
                      {order.service_name}
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {order.total_address} alamat
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-white font-medium">
                  {formatDate(order.date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm text-white font-medium">
                  Rp {new Intl.NumberFormat("id-ID").format(order.subtotal)},00
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div
                  className={`text-md font-semibold uppercase  ${
                    order.payment_status === "waiting" ? "text-yellow-500" : ""
                  } 
                  ${order.payment_status === "paid" ? "text-green-500" : ""} 
                  ${order.payment_status === "failed" ? "text-red-500" : ""}`}
                >
                  {order.payment_status}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div
                  className={`text-md font-semibold uppercase  ${
                    order.order_status === "waiting" ? "text-blue-400" : ""
                  } 
                  ${order.order_status === "ongoing" ? "text-yellow-500" : ""} 
                  ${order.order_status === "finished" ? "text-green-500" : ""}
                  ${order.order_status === "cancelled" ? "text-red-500" : ""}`}
                >
                  {order.order_status}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex justify-center ">
                  <button
                    className="text-blue-500 hover:text-blue-400"
                    onClick={() =>
                      navigate("/orders/detail", {
                        state: { orderId: order.id },
                      })
                    }
                  >
                    <Eye className="h-5 w-5" />
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

export default OrderHistoryList;
