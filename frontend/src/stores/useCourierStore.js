import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useCourierStore = create((set, get) => ({
  couriers: [],
  currentCourier: null,
  formData: {
    name: "",
    email: "",
    phone_number: "",
    address: "",
    role: "",
    status: "",
  },
  loading: false,
  setFormData: (formData) => set({ formData }),

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
  getCourier: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/couriers/${id}`);
      set({
        currentCourier: response.data.data,
        formData: response.data.data, // pre-fill form with current product data
      });
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
    } catch (error) {
      toast.error(error.response.data.error);
      set({ loading: false });
    }
  },
  updateCourier: async (id) => {
    set({ loading: true });
    try {
      const { formData } = get();
      const response = await axios.put(`/couriers/${id}`, formData);
      set({ currentCourier: response.data.data });
      toast.success("Courier updated successfully");
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error in updateCourier function", error);
    } finally {
      set({ loading: false });
    }
  },
}));
