import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader, XCircle, Save } from "lucide-react";
import { useServiceStore } from "../stores/useServiceStore";

const EditServiceForm = ({ onClose, id }) => {
  const {
    currentService,
    formData,
    setFormData,
    loading,
    getService,
    updateService,
  } = useServiceStore();

  useEffect(() => {
    getService(id);
  }, [getService, id]);

  console.log(currentService);

  if (loading) {
    return <div className="text-black">Loading...</div>;
  }

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-[#10baee]">
        Edit Service
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateService(id);
          onClose();
        }}
        className="space-y-4"
      >
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
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
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
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            step={1}
            min={0}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
              px-3 text-white focus:outline-none focus:ring-2
              focus:ring-[#10baee] focus:border-[#10baee]"
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
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            rows="3"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
              py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10baee] 
            focus:border-[#10baee]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Status
          </label>
          <div className="flex space-x-4 mt-1">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                value="active"
                checked={formData.status === "active"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="form-radio text-[#10baee]"
              />
              <span className="text-white">Active</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={formData.status === "inactive"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="form-radio text-[#10baee]"
              />
              <span className="text-white">Inactive</span>
            </label>
          </div>
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
                <Save className="mr-2 h-5 w-5" />
                Save
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditServiceForm;
