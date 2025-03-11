import { BarChart, ClipboardList, Package, Truck } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import AnalyticsTab from "../components/AnalyticsTab";
import OrdersList from "../components/OrdersList";
import ServicesList from "../components/ServicesList";
import CouriersList from "../components/CouriersList";

const tabs = [
  { id: "analytics", label: "Analytics", icon: BarChart },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "services", label: "Services", icon: Package },
  { id: "couriers", label: "Couriers", icon: Truck },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="min-h-100vh text-white relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-6">
        <motion.h1
          className="text-4xl font-bold mb-8 text-emerald-400 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Admin Dashboard
        </motion.h1>

        <div className="flex justify-center mb-8">
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

        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "orders" && <OrdersList />}
        {activeTab === "services" && <ServicesList />}
        {activeTab === "couriers" && <CouriersList />}
      </div>
    </div>
  );
};

export default AdminPage;
