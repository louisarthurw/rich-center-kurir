import { useEffect } from "react";
import { useOrderStore } from "../stores/useOrderStore";
import { CheckCircle, Clock, List, Truck, XCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import OrderHistoryList from "../components/OrderHistoryList";
import LoadingSpinner from "../components/LoadingSpinner";


const OrderHistoryPage = () => {
  const { loading, orders, getCustomerOrder } = useOrderStore();

  useEffect(() => {
    getCustomerOrder();
  }, [getCustomerOrder]);

  const tabs = [
    { id: "all", label: `All Orders (${orders.length})`, icon: List },
    {
      id: "waiting",
      label: `Waiting (${
        orders.filter((order) => order.order_status === "waiting").length
      })`,
      icon: Clock,
    },
    {
      id: "ongoing",
      label: `Ongoing (${
        orders.filter((order) => order.order_status === "ongoing").length
      })`,
      icon: Truck,
    },
    {
      id: "finished",
      label: `Finished (${
        orders.filter((order) => order.order_status === "finished").length
      })`,
      icon: CheckCircle,
    },
    {
      id: "cancelled",
      label: `Cancelled (${
        orders.filter((order) => order.order_status === "cancelled").length
      })`,
      icon: XCircle,
    },
  ];

  const [activeTab, setActiveTab] = useState("all");

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] text-white relative overflow-hidden px-2 sm:px-4">
      <div className="relative z-10 container mx-auto px-4 py-6">
        <motion.h1
          className="text-4xl font-bold mb-8 text-emerald-400 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Order History
        </motion.h1>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <OrderHistoryList activeTab={activeTab} />
      </div>
    </div>
  );
};

export default OrderHistoryPage;
