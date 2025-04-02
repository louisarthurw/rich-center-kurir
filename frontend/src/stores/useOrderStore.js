import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useOrderStore = create((set, get) => ({
  orders: [],
  pickup_details: {
    id: "",
    user_id: "",
    service_id: "",
    total_address: "",
    subtotal: 0,
    date: "",
    pickup_name: "",
    pickup_phone_number: "",
    pickup_address: "",
    pickup_notes: "",
    type: "",
    weight: "",
    take_package_on_behalf_of: "",
    lat: null,
    long: null,
    courier_id: null,
    visit_order: null,
    proof_image: null,
    payment_status: "",
    order_status: "",
    address_status: "",
    created_at: "",
    updated_at: "",
    service_name: "",
    service_image: "",
    service_price: 0,
  },
  delivery_details: [],
  loading: false,

  setDeliveryDetails: (updatedDetails) => set({ delivery_details: updatedDetails }),
  getAllOrders: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`/orders`);
      set({ orders: response.data.data });
    } catch (error) {
      console.log("Error in getAllOrders function", error);
      set({ orders: null });
    } finally {
      set({ loading: false });
    }
  },
  getOrder: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/orders/${id}`);
      set({
        pickup_details: response.data.data.pickup_details,
        delivery_details: response.data.data.delivery_details,
      });
    } catch (error) {
      console.log("Error in getOrderById function", error);
      set({ pickup_details: null, delivery_details: null });
    } finally {
      set({ loading: false });
    }
  },
  getCustomerOrder: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`/orders/customer`);
      set({ orders: response.data.data });
    } catch (error) {
      console.log("Error in getCustomerOrder function", error);
      set({ orders: null });
    } finally {
      set({ loading: false });
    }
  },
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
