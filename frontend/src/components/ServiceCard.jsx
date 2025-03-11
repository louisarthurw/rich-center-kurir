import { Link } from "react-router-dom";

const ServiceCard = ({ service }) => {
  return (
    <div className="relative overflow-hidden h-96 w-full rounded-lg group">
      <Link to={"/services/" + service.id}>
        <div className="w-full h-full cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-50 z-10" />
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <h3 className="text-white text-2xl font-bold mb-1">
              {service.name}
            </h3>
            <p className="text-gray-200 text-base font-bold">Rp{new Intl.NumberFormat("id-ID").format(service.price)},00</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ServiceCard;
