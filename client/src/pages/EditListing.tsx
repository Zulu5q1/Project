import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Listing, University, Campus, Category } from "../types";

const CONDITIONS = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "USED", label: "Used" },
];

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [campusId, setCampusId] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const [universities, setUniversities] = useState<University[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch<{ listing: Listing }>(`/api/listings/${id}`),
      apiFetch<{ universities: University[] }>("/api/universities"),
      apiFetch<{ categories: Category[] }>("/api/categories"),
    ])
      .then(([listingRes, uniRes, catRes]) => {
        const l = listingRes.listing;
        setListing(l);
        setTitle(l.title);
        setDescription(l.description);
        setPrice(String(l.price));
        setCondition(l.condition);
        setCategoryId(l.category.id);
        setUniversityId(l.university?.id || "");
        setCampusId(l.campus?.id || "");
        setLocation(l.location || "");
        setImageUrls(l.images.length > 0 ? l.images.map((img) => img.url) : [""]);
        setUniversities(uniRes.universities);
        setCategories(catRes.categories);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load listing");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!universityId) {
      setCampuses([]);
      return;
    }
    apiFetch<{ campuses: Campus[] }>(`/api/universities/${universityId}/campuses`)
      .then((res) => setCampuses(res.campuses))
      .catch(() => {});
  }, [universityId]);

  const isOwner = user && listing && user.id === listing.seller.id;
  const isAdmin = user?.role === "ADMIN";

  const addImageUrl = () => setImageUrls([...imageUrls, ""]);
  const removeImageUrl = (index: number) => setImageUrls(imageUrls.filter((_, i) => i !== index));
  const updateImageUrl = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !price || !condition || !categoryId || !universityId || !campusId) {
      setError("Please fill in all required fields");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a valid non-negative number");
      return;
    }

    const validImages = imageUrls.filter((url) => url.trim() !== "").map((url, i) => ({ url: url.trim(), sortOrder: i }));

    setSaving(true);
    try {
      const res = await apiFetch<{ listing: Listing }>(`/api/listings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: priceNum,
          condition,
          categoryId,
          universityId,
          campusId,
          location: location.trim() || undefined,
          images: validImages,
        }),
      });
      navigate(`/listings/${res.listing.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50";

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        <Link to="/marketplace" className="text-primary-600 hover:underline">Back to Marketplace</Link>
      </div>
    );
  }

  if (!listing || (!isOwner && !isAdmin)) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          You do not have permission to edit this listing.
        </div>
        <Link to="/marketplace" className="text-primary-600 hover:underline">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={`/listings/${id}`} className="text-primary-600 hover:underline text-sm mb-4 inline-block">
        &larr; Back to Listing
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Listing</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className={inputClass} placeholder="What are you selling?" disabled={saving} maxLength={200} />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} h-32 resize-y`} placeholder="Describe your item in detail..." disabled={saving} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (NGN) *</label>
            <input id="price" type="number" min="0" step="100" value={price} onChange={(e) => setPrice(e.target.value)}
              className={inputClass} placeholder="0" disabled={saving} />
          </div>
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
            <select id="condition" value={condition} onChange={(e) => setCondition(e.target.value)}
              className={inputClass} disabled={saving}>
              <option value="">Select condition</option>
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass} disabled={saving}>
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">University *</label>
            <select id="university" value={universityId} onChange={(e) => { setUniversityId(e.target.value); setCampusId(""); }}
              className={inputClass} disabled={saving}>
              <option value="">Select a university</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>{uni.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="campus" className="block text-sm font-medium text-gray-700 mb-1">Campus *</label>
            <select id="campus" value={campusId} onChange={(e) => setCampusId(e.target.value)}
              className={inputClass} disabled={saving || !universityId}>
              <option value={!universityId ? "" : "loading"}>
                {!universityId ? "Select university first" : "Select a campus"}
              </option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
          <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            className={inputClass} placeholder="e.g. Near main gate, Akoka" disabled={saving} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
          <p className="text-xs text-gray-400 mb-3">Provide image URLs. In development, paste direct links.</p>
          {imageUrls.map((url, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input type="url" value={url} onChange={(e) => updateImageUrl(i, e.target.value)}
                className={`${inputClass} flex-1`} placeholder="https://example.com/image.jpg" disabled={saving} />
              {imageUrls.length > 1 && (
                <button type="button" onClick={() => removeImageUrl(i)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addImageUrl}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1">
            + Add another image
          </button>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50">
          {saving ? "Saving changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
