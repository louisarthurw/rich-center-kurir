import { useEffect } from "react";
import { useServiceStore } from "../stores/useServiceStore";
import ServiceCard from "../components/ServiceCard";

const ServicesPage = () => {
  const { getAllActiveServices, services } = useServiceStore();

  useEffect(() => {
    getAllActiveServices();
  }, [getAllActiveServices]);

  return (
    <div className="relative min-h-100vh text-white overflow-hidden">
      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-16 py-8 space-y-10">
        <div className="space-y-4">
          <h1 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
            Explore Our Services
          </h1>
          <p className="text-center text-xl text-gray-300 mb-4">
            Pick the right service for you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <ServiceCard service={service} key={service.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
