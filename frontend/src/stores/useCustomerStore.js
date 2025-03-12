import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useCustomerStore = create((set, get) => ({
  customers: [],
  currentCustomer: null,
  formData: {
    name: "",
    email: "",
    phone_number: "",
  },
  loading: false,
  setFormData: (formData) => set({ formData }),

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
  getCustomer: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/customers/${id}`);
      set({
        currentCustomer: response.data.data,
        formData: response.data.data, // pre-fill form with current product data
      });
    } catch (error) {
      console.log("Error in getCustomer function", error);
      set({ currentCustomer: null });
    } finally {
      set({ loading: false });
    }
  },
  updateCustomer: async (id) => {
    set({ loading: true });
    try {
      const { formData } = get();
      const response = await axios.put(`/customers/${id}`, formData);
      set({ currentCustomer: response.data.data });
      toast.success("Customer updated successfully");

      get().getAllCustomers()
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error in updateCustomer function", error);
    } finally {
      set({ loading: false });
    }
  },
}));
