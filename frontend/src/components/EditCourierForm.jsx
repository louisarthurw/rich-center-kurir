import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader, XCircle, Save } from "lucide-react";
import { useCourierStore } from "../stores/useCourierStore";

const EditCourierForm = ({ onClose, id }) => {
  const {
    currentCourier,
    formData,
    setFormData,
    loading,
    getCourier,
    updateCourier,
  } = useCourierStore();

  useEffect(() => {
    getCourier(id);
  }, [getCourier, id]);

  console.log(currentCourier);

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
        Edit Courier
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateCourier(id);
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
						focus:ring-emerald-500 focus:border-emerald-500"
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
						focus:ring-emerald-500 focus:border-emerald-500"
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
						py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
					focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-300"
          >
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            rows="3"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
						py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 
					focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Role
          </label>
          <div className="flex space-x-4 mt-1">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role"
                value="regular"
                checked={formData.role === "regular"}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="form-radio text-emerald-500"
              />
              <span className="text-white">Kurir Regular</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role"
                value="special"
                checked={formData.role === "special"}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="form-radio text-emerald-500"
              />
              <span className="text-white">Kurir Khusus</span>
            </label>
          </div>
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
                className="form-radio text-emerald-500"
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
                className="form-radio text-emerald-500"
              />
              <span className="text-white">Inactive</span>
            </label>
          </div>
        </div>

        <div className="flex mt-4 space-x-4">
          <button
            type="button"
            className="w-1/2 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={onClose}
          >
            <XCircle className="mr-2 h-5 w-5" />
            Cancel
          </button>

          <button
            type="submit"
            className="w-1/2 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
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

export default EditCourierForm;
