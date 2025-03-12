import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useServiceStore = create((set, get) => ({
  services: [],
  currentService: null,
  formData: {
    name: "",
    description: "",
    price: "",
    image: "",
    status: "",
  },
  loading: false,
  setFormData: (formData) => set({ formData }),

  getAllServices: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/services");
      set({ services: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch services", loading: false });
      toast.error(error.response.data.error || "Failed to fetch services");
    }
  },
  getAllActiveServices: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/services/active");
      set({ services: response.data.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch services", loading: false });
      toast.error(error.response.data.error || "Failed to fetch services");
    }
  },
  getService: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/services/${id}`);
      set({
        currentService: response.data.data,
        formData: response.data.data, // pre-fill form with current product data
      });
    } catch (error) {
      console.log("Error in getService function", error);
      set({ currentService: null });
    } finally {
      set({ loading: false });
    }
  },
  addService: async (serviceData) => {
    set({ loading: true });
    try {
      console.log("hi")
      console.log(serviceData);
      const res = await axios.post("/services", serviceData);
      console.log("halo")
      set((prevState) => ({
        services: [...prevState.services, res.data],
        loading: false,
      }));
      toast.success("Service added successfully");
    } catch (error) {
      toast.error(error.response.data.error);
      set({ loading: false });
    }
  },
  updateService: async (id) => {
    set({ loading: true });
    try {
      const { formData } = get();
      const response = await axios.put(`/services/${id}`, formData);
      set({ currentService: response.data.data });
      toast.success("Service updated successfully");
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error in updateService function", error);
    } finally {
      set({ loading: false });
    }
  },
}));
