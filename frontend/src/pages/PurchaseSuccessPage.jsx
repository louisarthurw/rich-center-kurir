import { ArrowLeft, CheckCircle, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";

const PurchaseSuccessPage = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center space-y-4">
            <CheckCircle className="text-emerald-400 w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2">
            Purchase Successful!
          </h1>

          <p className="text-gray-300 text-center">
            Thank you for your order. {"We're"} processing it now.
          </p>

          <div className="w-full text-gray-300 font-bold py-2 px-4 rounded-lg flex items-center justify-center mb-8">
            <HandHeart className="mr-2" size={18} />
            Thanks for trusting us!
          </div>

          <Link
            to={"/orders"}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
          >
            <ArrowLeft className="mr-2" size={18} />
            Return to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
