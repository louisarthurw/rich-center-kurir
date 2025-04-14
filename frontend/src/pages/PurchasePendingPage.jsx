import { ArrowLeft, Clock, Hourglass } from "lucide-react";
import { Link } from "react-router-dom";

const PurchasePendingPage = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex justify-center mb-4">
            <Hourglass className="text-yellow-400 w-16 h-16" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-yellow-400">
            Purchase Pending
          </h1>

          <div className="w-full text-gray-300 font-bold py-2 px-4 rounded-lg flex items-center justify-center mb-8">
            <Clock className="mr-2" size={18} />
            Waiting for payment confirmation...
          </div>

          <Link
            to={"/orders"}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
          >
            <ArrowLeft className="mr-2" size={18} />
            Go to Order History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PurchasePendingPage;
