import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useCourierStore = create((set, get) => ({
  couriers: [],
  currentCourier: null,
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
  getAvailableCouriers: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/couriers/available");
      set({ couriers: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch available couriers", loading: false });
      toast.error(
        error.response.data.error || "Failed to fetch available couriers"
      );
    }
  },
  getCourier: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/couriers/${id}`);

      set({ currentCourier: response.data.data });
    } catch (error) {
      console.log("Error in getCourier function", error);
      set({ currentCourier: null });
    } finally {
      set({ loading: false });
    }
  },
  addCourier: async (courierData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/couriers", courierData);
      set((prevState) => ({
        couriers: [...prevState.couriers, res.data],
        loading: false,
      }));
      toast.success("Courier added successfully");
      return true;
    } catch (error) {
      toast.error(error.response.data.error);
      set({ loading: false });
      return false;
    }
  },
  updateCourier: async (id, updatedData) => {
    set({ loading: true });
    try {
      const response = await axios.put(`/couriers/${id}`, updatedData);
      set({ currentCourier: response.data.data });
      toast.success("Courier updated successfully");
      get().getAllCouriers();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.error("Error in updateCourier function", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
