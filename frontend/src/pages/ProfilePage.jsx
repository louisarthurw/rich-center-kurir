import { motion } from "framer-motion";
import { Loader, Save, Lock, Pencil } from "lucide-react";
import { useCustomerStore } from "../stores/useCustomerStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = ({ id }) => {
  const {
    currentCustomer,
    formData,
    setFormData,
    loading,
    getCustomer,
    updateProfile,
  } = useCustomerStore();

  useEffect(() => {
    getCustomer(id);
  }, [getCustomer, id]);

  console.log(currentCustomer);

  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    await updateProfile(id);
    setIsEditing(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <motion.div
        className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
          Profile
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!isEditing}
              className={`mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                isEditing ? "" : "cursor-not-allowed"
              }`}
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
              disabled={!isEditing}
              className={`mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                isEditing ? "" : "cursor-not-allowed"
              }`}
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
              disabled={!isEditing}
              className={`mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                isEditing ? "" : "cursor-not-allowed"
              }`}
              required
            />
          </div>

          <div className="flex mt-4 space-x-4">
            <button
              type="button"
              className="w-1/2 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              onClick={() => navigate(`/profile/change-password/${id}`)}
            >
              <Lock className="mr-2 h-5 w-5" />
              Change Password
            </button>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-1/2 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Pencil className="mr-2 h-5 w-5" />
                Edit
              </button>
            )}

            {isEditing && (
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
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
