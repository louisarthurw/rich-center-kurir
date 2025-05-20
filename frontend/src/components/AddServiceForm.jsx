import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Loader, XCircle } from "lucide-react";
import { useServiceStore } from "../stores/useServiceStore";

const AddServiceForm = ({ onClose }) => {
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });

  const { addService, loading } = useServiceStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addService(newService);
      setNewService({
        name: "",
        description: "",
        price: "",
        image: "",
      });
      onClose();
    } catch {
      console.log("error adding new service");
    }
  };

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-[#10baee]">
        Add New Service
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
            value={newService.name}
            onChange={(e) =>
              setNewService({ ...newService, name: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
              px-3 text-white focus:outline-none focus:ring-2
              focus:ring-[#10baee] focus:border-[#10baee]"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={newService.description}
            onChange={(e) =>
              setNewService({ ...newService, description: e.target.value })
            }
            rows="3"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
						py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10baee] 
					focus:border-[#10baee]"
            required
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-300"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={newService.price}
            onChange={(e) =>
              setNewService({ ...newService, price: e.target.value })
            }
            step="1"
            min={0}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm 
						py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10baee]
					focus:border-[#10baee]"
            required
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-300"
          >
            Image Link
          </label>
          <textarea
            id="image"
            name="image"
            value={newService.image}
            onChange={(e) =>
              setNewService({ ...newService, image: e.target.value })
            }
            rows="3"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
						py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10baee] 
					focus:border-[#10baee]"
            required
          />
        </div>

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

export default AddServiceForm;
