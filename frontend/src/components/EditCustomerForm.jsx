import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader, XCircle, Save } from "lucide-react";
import { useCustomerStore } from "../stores/useCustomerStore";

const EditCustomerForm = ({ onClose, id }) => {
  const {
    currentCustomer,
    formData,
    setFormData,
    loading,
    getCustomer,
    updateCustomer,
  } = useCustomerStore();

  useEffect(() => {
    getCustomer(id);
  }, [getCustomer, id]);

  console.log(currentCustomer);

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
        Edit Customer
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateCustomer(id);
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
            htmlFor="email"
            className="block text-sm font-medium text-gray-300"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
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
            value={formData.phone_number}
            onChange={(e) =>
              setFormData({ ...formData, phone_number: e.target.value })
            }
            step="0.01"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm 
						py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10baee]
					focus:border-[#10baee]"
            required
          />
        </div>

        <div className="flex mt-4 space-x-4">
          <button
            type="button"
            className="w-1/2 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:gray-600"
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

export default EditCustomerForm;
