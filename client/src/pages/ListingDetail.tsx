import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Listing } from "../types";

const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  USED: "Used",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  RESERVED: "Reserved",
  SOLD: "Sold",
  REMOVED: "Removed",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<{ listing: Listing }>(`/api/listings/${id}`)
      .then((res) => {
        setListing(res.listing);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load listing");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = user && listing && user.id === listing.seller.id;
  const isAdmin = user?.role === "ADMIN";

  const handleStatusChange = async (status: string) => {
    if (!listing) return;
    setStatusLoading(true);
    try {
      const res = await apiFetch<{ listing: Listing }>(`/api/listings/${listing.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setListing(res.listing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!listing || !window.confirm("Are you sure you want to delete this listing?")) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/listings/${listing.id}`, { method: "DELETE" });
      navigate("/marketplace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete listing");
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <Link to="/marketplace" className="text-primary-600 hover:underline mt-4 inline-block">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <Link to="/marketplace" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
        &larr; Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {listing.images.length > 0 ? (
              <img
                src={listing.images[selectedImage]!.url}
                alt={listing.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {listing.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    i === selectedImage ? "border-primary-600" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                listing.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                listing.status === "SOLD" ? "bg-red-100 text-red-800" :
                listing.status === "RESERVED" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {STATUS_LABELS[listing.status]}
              </span>
            </div>
            <p className="text-3xl font-bold text-primary-600 mt-2">{formatPrice(listing.price)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {CONDITION_LABELS[listing.condition]}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {listing.category.name}
            </span>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {listing.location && (
              <div>
                <span className="text-gray-500">Location</span>
                <p className="text-gray-900">{listing.location}</p>
              </div>
            )}
            {listing.university && (
              <div>
                <span className="text-gray-500">University</span>
                <p className="text-gray-900">{listing.university.shortName}</p>
              </div>
            )}
            {listing.campus && (
              <div>
                <span className="text-gray-500">Campus</span>
                <p className="text-gray-900">{listing.campus.name}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Listed</span>
              <p className="text-gray-900">{formatDate(listing.createdAt)}</p>
            </div>
            <div>
              <span className="text-gray-500">Views</span>
              <p className="text-gray-900">{listing.viewCount}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">Seller</h2>
            <Link
              to={`/users/${listing.seller.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                {listing.seller.firstName[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">{listing.seller.firstName} {listing.seller.lastName}</p>
                <p className="text-sm text-gray-500">@{listing.seller.username}</p>
              </div>
            </Link>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-200">
            {(isOwner || isAdmin) && (
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/listings/${listing.id}/edit`}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Edit Listing
                </Link>
                {listing.status === "ACTIVE" && (
                  <button
                    onClick={() => handleStatusChange("RESERVED")}
                    disabled={statusLoading}
                    className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors disabled:opacity-50"
                  >
                    Mark Reserved
                  </button>
                )}
                {(listing.status === "ACTIVE" || listing.status === "RESERVED") && (
                  <button
                    onClick={() => handleStatusChange("SOLD")}
                    disabled={statusLoading}
                    className="px-4 py-2 border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
                  >
                    Mark Sold
                  </button>
                )}
                {(listing.status === "SOLD" || listing.status === "RESERVED") && (
                  <button
                    onClick={() => handleStatusChange("ACTIVE")}
                    disabled={statusLoading}
                    className="px-4 py-2 border border-primary-300 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors disabled:opacity-50"
                  >
                    Mark Active
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
            {!isOwner && user && listing.status === "ACTIVE" && (
              <button
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors w-full"
                disabled
              >
                Message Seller (Coming Soon)
              </button>
            )}
            {!isOwner && user && listing.status === "RESERVED" && (
              <div className="px-6 py-2.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg font-medium text-center text-sm">
                This item is reserved by another buyer
              </div>
            )}
            {!isOwner && user && listing.status === "SOLD" && (
              <div className="px-6 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium text-center text-sm">
                This item has been sold
              </div>
            )}
            {!user && listing.status === "ACTIVE" && (
              <Link
                to="/login"
                className="block text-center px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Login to Contact Seller
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
