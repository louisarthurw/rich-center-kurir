import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useOrderStore = create((set, get) => ({
  // orders: [],
  loading: false,

  createOrder: async (service_id, user_id, pickupDetails, deliveryDetails) => {
    set({ loading: true });

    try {
      const res = await axios.post("/orders", {
        service_id,
        user_id,
        pickupDetails,
        deliveryDetails,
      });

      toast.success("Order created successfully");
      return true;
    } catch (error) {
      toast.error(error.response.data.error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
