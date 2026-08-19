import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">UniXchange</h1>
        <p className="text-xl text-gray-600 mb-8">Your Campus. Your Marketplace.</p>
        <p className="text-gray-500 max-w-2xl mx-auto mb-10">
          Buy, sell, and exchange items within your university community.
          A trusted marketplace built for students, by students.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/marketplace"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Browse Marketplace
          </Link>
          <Link
            to="/register"
            className="border border-primary-600 text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
