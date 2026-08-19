import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ message: string; user: { id: string; email: string; role: string } } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ message: string; user: { id: string; email: string; role: string } }>("/api/admin/stats")
      .then(setStats)
      .catch((err) => setError(err.message || "Failed to load admin data"));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Role: {user?.role}
          </span>
          <span className="text-gray-500 text-sm">
            Logged in as {user?.firstName} {user?.lastName}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {stats && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Backend authorization verified: {stats.message}
          </div>
        )}

        <p className="text-gray-400 text-lg">Admin functionality coming soon.</p>
      </div>
    </div>
  );
}
