import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useServiceStore = create((set) => ({
  services: [],
  loading: false,
  getAllServices: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/services");
      set({ services: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.response.data.error || "Failed to fetch products");
    }
  },
}));
