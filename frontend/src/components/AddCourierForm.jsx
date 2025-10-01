import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Loader, XCircle } from "lucide-react";
import { useCourierStore } from "../stores/useCourierStore";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";
import LoadingSpinner from "./LoadingSpinner";

const AddCourierForm = ({ onClose }) => {
  const [newCourier, setNewCourier] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
    address_coordinate: "",
  });

  const { addCourier, loading } = useCourierStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await addCourier(newCourier);
      
      if (success === true) {
        setNewCourier({
          name: "",
          email: "",
          password: "",
          phone_number: "",
          address: "",
          address_coordinate: "",
        });

        onClose();
      }
    } catch {
      console.log("error adding new courier");
    }
  };

  // loading gmaps
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBRHdO7vAzwE15Ycu2S0GmkDGm0Hn1nq4Q",
    libraries: ["places"],
  });

  const searchBoxRef = useRef(null);

  const onSearchBoxLoad = (ref) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const address = place.formatted_address || place.name;
      const coordinate = `${place.geometry.location.lat()},${place.geometry.location.lng()}`;
      setNewCourier((prev) => ({
        ...prev,
        address,
        address_coordinate: coordinate,
      }));
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-[#10baee]">
        Add New Courier
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Kurir"
            value={newCourier.name}
            onChange={(e) =>
              setNewCourier({ ...newCourier, name: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
						px-3 text-white focus:outline-none focus:ring-2
						focus:ring-[#10baee] focus:border-[#10baee]"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={newCourier.email}
            placeholder="kurir@gmail.com"
            onChange={(e) =>
              setNewCourier({ ...newCourier, email: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
						px-3 text-white focus:outline-none focus:ring-2
						focus:ring-[#10baee] focus:border-[#10baee]"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={newCourier.password}
            placeholder="*****"
            onChange={(e) =>
              setNewCourier({ ...newCourier, password: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
						px-3 text-white focus:outline-none focus:ring-2
						focus:ring-[#10baee] focus:border-[#10baee]"
            required
          />
        </div>

        <div>
          <label
            htmlFor="phone_number"
            className="block text-sm font-medium text-gray-300"
          >
            Phone Number
          </label>
          <input
            type="text"
            id="phone_number"
            name="phone_number"
            value={newCourier.phone_number}
            placeholder="08123456789"
            onChange={(e) =>
              setNewCourier({ ...newCourier, phone_number: e.target.value })
            }
            step="0.01"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm 
						py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10baee]
					focus:border-[#10baee]"
            required
          />
        </div>

        <StandaloneSearchBox
          onLoad={onSearchBoxLoad}
          onPlacesChanged={onPlacesChanged}
        >
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-300"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={newCourier.address}
              onChange={(e) =>
                setNewCourier({ ...newCourier, address: e.target.value })
              }
              placeholder="Search address..."
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
        py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10baee]
        focus:border-[#10baee]"
              required
            />
          </div>
        </StandaloneSearchBox>

        <div className="flex mt-4 space-x-4">
          <button
            type="button"
            className="w-1/2 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
            onClick={onClose}
          >
            <XCircle className="mr-2 h-5 w-5" />
            Cancel
          </button>

          <button
            type="submit"
            className="w-1/2 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#10baee] hover:bg-[#0aa2cc] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10baee] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader
                  className="mr-2 h-5 w-5 animate-spin"
                  aria-hidden="true"
                />
                Loading...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-5 w-5" />
                Add
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddCourierForm;
