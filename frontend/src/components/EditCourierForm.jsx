// EditCourierForm.jsx
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader, XCircle, Save } from "lucide-react";
import { useCourierStore } from "../stores/useCourierStore";
import toast from "react-hot-toast";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";

const EditCourierForm = ({ onClose, id }) => {
  const { currentCourier, getCourier, updateCourier, loading } =
    useCourierStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    address_coordinate: "",
    role: "",
    status: "",
  });
  const [addressValid, setAddressValid] = useState(true);
  const searchBoxRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDYXY6ngijPiwNtIyglgXHp0Uy7Qd6EJRg",
    libraries: ["places"],
  });

  useEffect(() => {
    getCourier(id);
  }, [id]);

  useEffect(() => {
    if (currentCourier) {
      setFormData({
        name: currentCourier.name || "",
        email: currentCourier.email || "",
        phone_number: currentCourier.phone_number || "",
        address: currentCourier.address || "",
        address_coordinate: currentCourier.address_coordinate || "",
        role: currentCourier.role || "",
        status: currentCourier.status || "",
      });
      setAddressValid(!!currentCourier.address_coordinate);
    }
  }, [currentCourier]);

  const onSearchBoxLoad = (ref) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const address = place.formatted_address || place.name;
      const coordinate = `${place.geometry.location.lat()},${place.geometry.location.lng()}`;
      setFormData((prev) => ({
        ...prev,
        address,
        address_coordinate: coordinate,
      }));
      setAddressValid(true);
    }
  };

  const handleAddressChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      address: e.target.value,
      address_coordinate: "",
    }));
    setAddressValid(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address_coordinate) {
      toast.error("Alamat harus dipilih dari suggestion Google Maps.");
      setAddressValid(false);
      return;
    }
    const success = await updateCourier(id, formData);
    if (success) onClose();
  };

  if (loading && !currentCourier) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-[#10baee]">
        Edit Courier
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <InputField
          type="email"
          label="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <InputField
          label="Phone Number"
          value={formData.phone_number}
          onChange={(e) =>
            setFormData({ ...formData, phone_number: e.target.value })
          }
        />

        {isLoaded && (
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Address
            </label>
            <StandaloneSearchBox
              onLoad={onSearchBoxLoad}
              onPlacesChanged={onPlacesChanged}
            >
              <input
                type="text"
                value={formData.address}
                onChange={handleAddressChange}
                className={`mt-1 block w-full bg-gray-700 border ${
                  !addressValid ? "border-red-500" : "border-gray-600"
                } rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10baee]`}
                placeholder="Search address..."
                required
              />
            </StandaloneSearchBox>
            {!addressValid && (
              <p className="mt-1 text-sm text-red-500">
                Alamat harus dipilih dari suggestion
              </p>
            )}
          </div>
        )}

        <RadioGroup
          label="Role"
          name="role"
          options={[
            { value: "regular", label: "Kurir Regular" },
            { value: "special", label: "Kurir Khusus" },
            { value: "car", label: "Kurir Mobil" },
          ]}
          selected={formData.role}
          onChange={(value) => setFormData({ ...formData, role: value })}
        />

        <RadioGroup
          label="Status"
          name="status"
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          selected={formData.status}
          onChange={(value) => setFormData({ ...formData, status: value })}
        />

        {/* Buttons */}
        <div className="flex mt-4 space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center justify-center"
          >
            <XCircle className="mr-2 h-5 w-5" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 px-4 py-2 bg-[#10baee] hover:bg-[#0aa2cc] text-white rounded-md flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <Loader className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            Save
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditCourierForm;

const InputField = ({ label, type = "text", value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10baee]"
      required
    />
  </div>
);

const RadioGroup = ({ label, name, options, selected, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <div className="flex space-x-4 mt-1">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center space-x-2">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={selected === opt.value}
            onChange={() => onChange(opt.value)}
            className="form-radio text-[#10baee]"
          />
          <span className="text-white">{opt.label}</span>
        </label>
      ))}
    </div>
  </div>
);
