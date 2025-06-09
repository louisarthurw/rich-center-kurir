import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Truck,
  MapPin,
} from "lucide-react";
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
import { useAnalyticsStore } from "../stores/useAnalyticsStore";

const AnalyticsTab = () => {
  const {
    loading,
    analyticsData,
    salesData,
    getAnalyticsData,
    getSalesData,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  } = useAnalyticsStore();

  useEffect(() => {
    getAnalyticsData();
  }, [getAnalyticsData]);

  useEffect(() => {
    const getDefaultDateRange = () => {
      const now = new Date();
      const jakartaNow = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
      );

      const end = new Date(jakartaNow);
      const start = new Date(jakartaNow);
      start.setDate(start.getDate() - 7);

      const format = (date) => date.toISOString().split("T")[0];

      return {
        startDate: format(start),
        endDate: format(end),
      };
    };

    const { startDate, endDate } = getDefaultDateRange();

    setStartDate(startDate);
    setEndDate(endDate);
    getSalesData({ startDate, endDate });
  }, [setStartDate, setEndDate, getSalesData]);

  const isValidDateRange = (start, end) => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    return (
      !isNaN(startDateObj) &&
      !isNaN(endDateObj) &&
      endDateObj.getTime() > startDateObj.getTime()
    );
  };

  if (loading) {
    return <div className="text-black">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Customers"
            value={analyticsData.customers.toLocaleString()}
            icon={Users}
          />
          <AnalyticsCard
            title="Total Active Services"
            value={analyticsData.services.toLocaleString()}
            icon={Package}
          />
          <AnalyticsCard
            title="Total Active Couriers"
            value={analyticsData.couriers.toLocaleString()}
            icon={Truck}
          />
          <AnalyticsCard
            title="Total Addresses"
            value={analyticsData.addresses.toLocaleString()}
            icon={MapPin}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
          <div className="lg:col-start-2">
            <AnalyticsCard
              title="Total Orders"
              value={analyticsData.totalOrders.toLocaleString()}
              icon={ShoppingCart}
            />
          </div>
          <div>
            <AnalyticsCard
              title="Total Revenue"
              value={`Rp${new Intl.NumberFormat("id-ID").format(
                analyticsData.totalRevenue
              )}`}
              icon={DollarSign}
            />
          </div>
        </div>
      </div>

      <motion.div
        className="bg-gray-800 rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end py-2 px-6">
          <div className="md:col-span-5">
            <label className="text-slate-200 text-md px-1" htmlFor="start-date">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-700 text-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#10baee]"
            />
          </div>

          <div className="md:col-span-5">
            <label className="text-slate-200 text-md px-1" htmlFor="end-date">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-700 text-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#10baee]"
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => getSalesData({ startDate, endDate })}
              disabled={!isValidDateRange(startDate, endDate)}
              className={`w-full px-6 py-2 rounded-lg font-semibold transition-all ${
                isValidDateRange(startDate, endDate)
                  ? "bg-[#10baee] hover:bg-[#0aa2cc] text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Filter
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            {/* <XAxis dataKey="name" stroke="#D1D5DB" /> */}

            <XAxis
              dataKey="date"
              stroke="#D1D5DB"
              tickFormatter={(dateStr) => {
                const months = [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ];
                const [year, month, day] = dateStr.split("-");
                return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
              }}
              tick={{
                dy: 15,
              }}
            />

            <YAxis yAxisId="left" stroke="#D1D5DB" />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#D1D5DB"
              tickFormatter={(value) =>
                new Intl.NumberFormat("id-ID", {
                  maximumFractionDigits: 0,
                }).format(value)
              }
            />
            <Tooltip />
            <Legend
              wrapperStyle={{
                paddingTop: 20,
              }}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#10B981"
              activeDot={{ r: 8 }}
              name="Orders"
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

        <div className="mt-4 text-center space-y-1">
          <p className="text-slate-200 font-semibold">
            Total Orders During This Period:{" "}
            {salesData
              .reduce((total, item) => total + item.sales, 0)
              .toLocaleString()}
          </p>
          <p className="text-slate-200 font-semibold">
            Total Revenue During This Period: Rp
            {new Intl.NumberFormat("id-ID").format(
              salesData.reduce((total, item) => total + item.revenue, 0)
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center">
      <div className="z-10">
        <p className="text-cyan-300 text-sm mb-1 font-semibold">{title}</p>
        <h3 className="text-white text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-[#10baee] to-[#0aa2cc] opacity-30" />
    <div className="absolute -bottom-4 -right-4  text-[#10baee] opacity-50">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
);
