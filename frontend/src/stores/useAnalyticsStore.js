import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useAnalyticsStore = create((set) => ({
  analyticsData: {
    customers: 0,
    services: 0,
    couriers: 0,
    addresses: 0,
    totalOrders: 0,
    totalRevenue: 0,
  },
  salesData: [],
  loading: false,

  getAnalyticsData: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/analytics");
      set({ analyticsData: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch analytics data", loading: false });
      toast.error(error.response.data.error || "Failed to fetch analytics data");
    }
  },
  getSalesData: async ({ startDate, endDate }) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/analytics/sales?startDate=${startDate}&endDate=${endDate}`);
      set({ salesData: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch sales data", loading: false });
      toast.error(error.response.data.error || "Failed to fetch sales data");
    }
  },
}));
