import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md lg:max-w-xl space-y-8">
        <div className="flex justify-center">
          <div className="bg-red-600/20 p-4 rounded-full">
            <AlertTriangle className="w-24 h-24 text-red-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-gray-300 text-lg">
            Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
          </p>
        </div>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded-xl transition mt-6"
        >
          Go to Home Page
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
