import { BarChart, ClipboardList, Package, Truck, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import AnalyticsTab from "../components/AnalyticsTab";
import OrdersList from "../components/OrdersList";
import ServicesList from "../components/ServicesList";
import CouriersList from "../components/CouriersList";
import CustomersList from "../components/CustomersList";
import AddCourierForm from "../components/AddCourierForm";
import EditCourierForm from "../components/EditCourierForm";
import AddServiceForm from "../components/AddServiceForm";
import EditServiceForm from "../components/EditServiceForm";
import EditCustomerForm from "../components/EditCustomerForm";

const tabs = [
  { id: "analytics", label: "Analytics", icon: BarChart },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "services", label: "Services", icon: Package },
  { id: "couriers", label: "Couriers", icon: Truck },
  { id: "customers", label: "Customers", icon: User },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("analytics");

  const [isAddingCourier, setIsAddingCourier] = useState(false);
  const [isEditingCourier, setIsEditingCourier] = useState(false);
  const [courierId, setCourierId] = useState(null);

  const [isAddingService, setIsAddingService] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [serviceId, setServiceId] = useState(null);

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerId, setCustomerId] = useState(null);

  const handleEditCourier = (id) => {
    setCourierId(id);
    setIsEditingCourier(true);
  };

  const handleCloseEditCourier = () => {
    setCourierId(null);
    setIsEditingCourier(false);
  };

  const handleEditService = (id) => {
    setServiceId(id);
    setIsEditingService(true);
  };

  const handleCloseEditService = () => {
    setServiceId(null);
    setIsEditingService(false);
  };

  const handleEditCustomer = (id) => {
    setCustomerId(id);
    setIsEditingCustomer(true);
  };

  const handleCloseEditCustomer = () => {
    setCustomerId(null);
    setIsEditingCustomer(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] text-white relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-6">
        <motion.h1
          className="text-4xl font-bold mb-8 text-emerald-400 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Admin Dashboard
        </motion.h1>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "orders" && <OrdersList />}

        {activeTab === "services" &&
          (isAddingService ? (
            <AddServiceForm onClose={() => setIsAddingService(false)} />
          ) : isEditingService ? (
            <EditServiceForm id={serviceId} onClose={handleCloseEditService} />
          ) : (
            <ServicesList
              onAddService={() => setIsAddingService(true)}
              onEditService={handleEditService}
            />
          ))}

        {activeTab === "couriers" &&
          (isAddingCourier ? (
            <AddCourierForm onClose={() => setIsAddingCourier(false)} />
          ) : isEditingCourier ? (
            <EditCourierForm id={courierId} onClose={handleCloseEditCourier} />
          ) : (
            <CouriersList
              onAddCourier={() => setIsAddingCourier(true)}
              onEditCourier={handleEditCourier}
            />
          ))}

        {activeTab === "customers" &&
          (isEditingCustomer ? (
            <EditCustomerForm id={customerId} onClose={handleCloseEditCustomer} />
          ) : (
            <CustomersList
              onEditCustomer={handleEditCustomer}
            />
          ))}
      </div>
    </div>
  );
};

export default AdminPage;
