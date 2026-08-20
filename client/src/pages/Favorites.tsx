git status
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import type { Favorite, PaginatedFavorites } from "../types";

const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  USED: "Used",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Available", className: "bg-green-100 text-green-800" },
  RESERVED: { label: "Reserved", className: "bg-yellow-100 text-yellow-800" },
  SOLD: { label: "Sold", className: "bg-red-100 text-red-800" },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(price);
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchFavorites = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<PaginatedFavorites>(`/api/favorites?page=${page}&limit=12`);
      setFavorites(res.favorites);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (listingId: string) => {
    try {
      await apiFetch(`/api/favorites/${listingId}`, { method: "DELETE" });
      setFavorites((prev) => prev.filter((f) => f.listing.id !== listingId));
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit),
      }));
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Favorites</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Favorites</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Favorites</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-gray-500 text-lg">You haven&apos;t saved any listings yet.</p>
          <Link
            to="/marketplace"
            className="mt-4 inline-block px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Favorites</h1>
      <p className="text-sm text-gray-600 mb-6">{pagination.total} {pagination.total === 1 ? "listing" : "listings"} saved</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((fav) => {
          const listing = fav.listing;
          const statusInfo = STATUS_CONFIG[listing.status];
          return (
            <div key={fav.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative">
              <Link to={`/listings/${listing.id}`} className="block">
                <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                  {listing.images.length > 0 ? (
                    <img src={listing.images[0]!.url} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                  {statusInfo && listing.status !== "ACTIVE" && (
                    <span className={`absolute top-2 right-12 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/listings/${listing.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(listing.id);
                    }}
                    className="flex-shrink-0 p-1 text-red-500 hover:text-red-600 transition-colors"
                    title="Remove from favorites"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <p className="text-lg font-bold text-primary-600 mt-1">{formatPrice(listing.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {CONDITION_LABELS[listing.condition]}
                  </span>
                  <span className="text-xs text-gray-400">{listing.category.name}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 truncate">
                    {listing.campus?.name}{listing.location ? ` \u00B7 ${listing.location}` : ""}
                  </span>
                  <span className="text-xs text-gray-400">
                    {listing.seller.firstName} {listing.seller.lastName}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => fetchFavorites(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchFavorites(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
