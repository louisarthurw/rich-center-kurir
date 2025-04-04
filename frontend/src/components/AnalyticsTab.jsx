import { motion } from "framer-motion";
import { useState } from "react";
import { Users, Package, ShoppingCart, DollarSign, ClipboardList, Truck } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    customers: 0,
    services: 0,
    couriers: 0,
    orders: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dailySalesData, setDailySalesData] = useState([]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Customers"
            value={analyticsData.customers.toLocaleString()}
            icon={Users}
            color="from-emerald-500 to-teal-700"
          />
          <AnalyticsCard
            title="Total Active Services"
            value={analyticsData.services.toLocaleString()}
            icon={Package}
            color="from-emerald-500 to-green-700"
          />
          <AnalyticsCard
            title="Total Active Couriers"
            value={analyticsData.couriers.toLocaleString()}
            icon={Truck}
            color="from-emerald-500 to-green-700"
          />
          <AnalyticsCard
            title="Total Successful Orders"
            value={analyticsData.orders.toLocaleString()}
            icon={ClipboardList}
            color="from-emerald-500 to-green-700"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
          <div className="lg:col-start-2">
            <AnalyticsCard
              title="Total Sales"
              value={analyticsData.totalSales.toLocaleString()}
              icon={ShoppingCart}
              color="from-emerald-500 to-cyan-700"
            />
          </div>
          <div>
            <AnalyticsCard
              title="Total Revenue"
              value={`Rp ${analyticsData.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="from-emerald-500 to-lime-700"
            />
          </div>
        </div>
      </div>
      <motion.div
        className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#D1D5DB" />
            <YAxis yAxisId="left" stroke="#D1D5DB" />
            <YAxis yAxisId="right" orientation="right" stroke="#D1D5DB" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#10B981"
              activeDot={{ r: 8 }}
              name="Sales"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              activeDot={{ r: 8 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center">
      <div className="z-10">
        <p className="text-emerald-300 text-sm mb-1 font-semibold">{title}</p>
        <h3 className="text-white text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30" />
    <div className="absolute -bottom-4 -right-4 text-emerald-800 opacity-50">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
);
