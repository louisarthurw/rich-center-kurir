import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useCourierStore = create((set) => ({
  couriers: [],
  loading: false,
  getAllCouriers: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/couriers");
      set({ couriers: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch couriers", loading: false });
      toast.error(error.response.data.error || "Failed to fetch couriers");
    }
  },
}));
