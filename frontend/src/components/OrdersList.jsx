import { useOrderStore } from "../stores/useOrderStore";
import { motion } from "framer-motion";
import { Eye, Package } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const OrdersList = () => {
  const { loading, orders, getAllOrders, assignKurir } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  const now = new Date();
  const jakartaNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );
  const todayJakarta = jakartaNow.toISOString().slice(0, 10);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleAssignKurir = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Konfirmasi Assign Kurir",
      text: "Apakah Anda yakin ingin assign kurir?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, benar!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10baee",
      cancelButtonColor: "#374151",
    });

    if (result.isConfirmed) {
      await assignKurir(todayJakarta);
    }
  };

  if (loading) {
    return <div className="text-black">Loading...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="bg-gray-700 rounded-full p-6">
          <Package className="size-12 text-gray-300" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-700">No orders found</h3>
        </div>
      </div>
    );
  }

  const groupedOrders = orders.reduce((acc, order) => {
    const date = formatDate(order.date);
    if (!acc[date]) acc[date] = [];
    acc[date].push(order);
    return acc;
  }, {});

  console.log(groupedOrders);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {Object.entries(groupedOrders).map(([date, ordersForDate]) => (
        <motion.div
          key={date}
          className="shadow-lg overflow-hidden overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-between items-center px-1 py-3">
            <div className="text-gray-700 text-lg font-semibold">
              {date} ({ordersForDate.length}{" "}
              {ordersForDate.length === 1 ? "order" : "orders"})
            </div>

            {/* groupedOrders[date]?.some((order) => !order.courier_id)  */}
            {formatDate(todayJakarta) === date ? (
              <button
                className="bg-[#10baee] hover:bg-[#0aa2cc] text-white font-semibold py-2 px-4 rounded-lg"
                onClick={handleAssignKurir}
              >
                Assign Kurir
              </button>
            ) : (
              ""
            )}
          </div>

          <div className="rounded-lg overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Services
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                    Delivery Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {ordersForDate.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      <img
                        className="h-14 w-14 rounded-md object-cover"
                        src={order.service_image}
                        alt={order.service_name}
                      />
                      <div className="ml-4">
                        <div className="text-md font-medium text-white">
                          {order.service_name}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                          {order.total_address} alamat
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-white font-medium">
                      Rp {new Intl.NumberFormat("id-ID").format(order.subtotal)}
                      ,00
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-center font-semibold uppercase 
                    ${
                      order.payment_status === "waiting"
                        ? "text-yellow-500"
                        : ""
                    }
                    ${order.payment_status === "paid" ? "text-green-500" : ""}
                    ${order.payment_status === "failed" ? "text-red-500" : ""}`}
                    >
                      {order.payment_status}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-center font-semibold uppercase 
                    ${order.order_status === "waiting" ? "text-blue-400" : ""}
                    ${order.order_status === "ongoing" ? "text-yellow-500" : ""}
                    ${order.order_status === "finished" ? "text-green-500" : ""}
                    ${
                      order.order_status === "cancelled" ? "text-red-500" : ""
                    }`}
                    >
                      {order.order_status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default OrdersList;
