import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useCustomerStore = create((set) => ({
  customers: [],
  loading: false,
  getAllCustomers: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/customers");
      set({ customers: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch customers", loading: false });
      toast.error(error.response.data.error || "Failed to fetch customers");
    }
  },
}));
