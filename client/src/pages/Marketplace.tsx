import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Listing, Category, University, Campus, PaginatedListings } from "../types";

const CONDITION_OPTIONS = [
  { value: "", label: "All Conditions" },
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "USED", label: "Used" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "views", label: "Most Viewed" },
];

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

export default function Marketplace() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterDrawerRef = useRef<HTMLDivElement>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");

  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("category") || "";
  const universityParam = searchParams.get("university") || "";
  const campusId = searchParams.get("campus") || "";
  const condition = searchParams.get("condition") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const effectiveUniversityId = (() => {
    if (!user) return "";
    if (universityParam === "all") return "";
    if (universityParam === "my" || universityParam === "") return user.university?.id || "";
    return universityParam;
  })();

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "12");
    if (q) params.set("q", q);
    if (categoryId) params.set("categoryId", categoryId);
    if (effectiveUniversityId) params.set("universityId", effectiveUniversityId);
    if (campusId) params.set("campusId", campusId);
    if (condition) params.set("condition", condition);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    return params;
  }, [page, q, categoryId, effectiveUniversityId, campusId, condition, minPrice, maxPrice, sort]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = buildParams();
      const res = await apiFetch<PaginatedListings>(`/api/listings?${params.toString()}`);
      setListings(res.listings);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    apiFetch<{ categories: Category[] }>("/api/categories")
      .then((res) => setCategories(res.categories))
      .catch(() => {});
    apiFetch<{ universities: University[] }>("/api/universities")
      .then((res) => setUniversities(res.universities))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!authLoading && effectiveUniversityId) {
      apiFetch<{ campuses: Campus[] }>(`/api/universities/${effectiveUniversityId}/campuses`)
        .then((res) => setCampuses(res.campuses))
        .catch(() => setCampuses([]));
    } else if (universityParam === "all" || (!user && !universityParam)) {
      setCampuses([]);
    }
  }, [effectiveUniversityId, universityParam, user]);

  useEffect(() => {
    if (!authLoading) {
      fetchListings();
    }
  }, [fetchListings, authLoading]);

  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      if (key !== "page") next.delete("page");
      return next;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateParam("q", "");
  };

  const handleClearAll = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const activeFilterCount = [q, categoryId, universityParam !== "my" ? universityParam : "", campusId, condition, minPrice, maxPrice].filter(Boolean).length +
    (sort !== "newest" ? 1 : 0);

  const handleUniversityChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set("university", value);
      } else {
        next.delete("university");
      }
      next.delete("campus");
      next.delete("page");
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          {user?.university && (
            <p className="text-gray-500 mt-1">
              {universityParam === "all"
                ? "All Universities"
                : universityParam && universityParam !== "my"
                  ? universities.find((u) => u.id === universityParam)?.name || "Marketplace"
                  : user.university.name}
            </p>
          )}
        </div>
        {user && (
          <Link
            to="/listings/new"
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Sell Item
          </Link>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative max-w-lg">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </form>

      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 w-full justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div ref={filterDrawerRef} className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 space-y-5">
              <FilterControls
                q={q}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                handleSearchSubmit={handleSearchSubmit}
                handleClearSearch={handleClearSearch}
                categories={categories}
                categoryId={categoryId}
                universities={universities}
                universityParam={universityParam}
                user={user}
                campuses={campuses}
                campusId={campusId}
                condition={condition}
                minPrice={minPrice}
                maxPrice={maxPrice}
                sort={sort}
                updateParam={updateParam}
                handleUniversityChange={handleUniversityChange}
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              {activeFilterCount > 0 && (
                <button onClick={handleClearAll} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Clear All
                </button>
              )}
              <button onClick={() => setMobileFiltersOpen(false)} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-6">
          <FilterControls
            q={q}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            handleSearchSubmit={handleSearchSubmit}
            handleClearSearch={handleClearSearch}
            categories={categories}
            categoryId={categoryId}
            universities={universities}
            universityParam={universityParam}
            user={user}
            campuses={campuses}
            campusId={campusId}
            condition={condition}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sort={sort}
            updateParam={updateParam}
            handleUniversityChange={handleUniversityChange}
          />
          {activeFilterCount > 0 && (
            <button onClick={handleClearAll} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
              Clear All Filters
            </button>
          )}
        </aside>

        <div>
          <ListingResults
            loading={loading || authLoading}
            error={error}
            listings={listings}
            pagination={pagination}
            page={page}
            sort={sort}
            q={q}
            categoryId={categoryId}
            condition={condition}
            minPrice={minPrice}
            maxPrice={maxPrice}
            updateParam={updateParam}
            categories={categories}
            universityParam={universityParam}
            campusId={campusId}
            campuses={campuses}
          />
        </div>
      </div>

      <div className="lg:hidden">
        <ListingResults
          loading={loading || authLoading}
          error={error}
          listings={listings}
          pagination={pagination}
          page={page}
          sort={sort}
          q={q}
          categoryId={categoryId}
          condition={condition}
          minPrice={minPrice}
          maxPrice={maxPrice}
          updateParam={updateParam}
          categories={categories}
          universityParam={universityParam}
          campusId={campusId}
          campuses={campuses}
        />
      </div>
    </div>
  );
}

interface FilterControlsProps {
  q: string;
  searchInput: string;
  setSearchInput: (v: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  handleClearSearch: () => void;
  categories: Category[];
  categoryId: string;
  universities: University[];
  universityParam: string;
  user: ReturnType<typeof useAuth>["user"];
  campuses: Campus[];
  campusId: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  updateParam: (key: string, value: string) => void;
  handleUniversityChange: (value: string) => void;
}

function FilterControls({
  categories,
  categoryId,
  universities,
  universityParam,
  user,
  campuses,
  campusId,
  condition,
  minPrice,
  maxPrice,
  sort,
  updateParam,
  handleUniversityChange,
}: FilterControlsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
        <select
          value={categoryId}
          onChange={(e) => updateParam("category", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">University</label>
        <select
          value={universityParam || (user ? "my" : "all")}
          onChange={(e) => handleUniversityChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {user ? <option value="my">My University ({user.university?.shortName || "None"})</option> : null}
          <option value="all">All Universities</option>
          {universities.map((uni) => (
            <option key={uni.id} value={uni.id}>{uni.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Campus</label>
        <select
          value={campusId}
          onChange={(e) => updateParam("campus", e.target.value)}
          disabled={campuses.length === 0}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:bg-gray-50"
        >
          <option value="">{campuses.length === 0 ? "Select a university first" : "All Campuses"}</option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>{campus.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Condition</label>
        <select
          value={condition}
          onChange={(e) => updateParam("condition", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {CONDITION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Range (NGN)</label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParam("minPrice", e.target.value)}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParam("maxPrice", e.target.value)}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort By</label>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </>
  );
}

interface ListingResultsProps {
  loading: boolean;
  error: string;
  listings: Listing[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  page: number;
  sort: string;
  q: string;
  categoryId: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
  updateParam: (key: string, value: string) => void;
  categories: Category[];
  universityParam: string;
  campusId: string;
  campuses: Campus[];
}

function ListingResults({
  loading,
  error,
  listings,
  pagination,
  page,
  q,
  categoryId,
  condition,
  minPrice,
  maxPrice,
  updateParam,
  categories,
  universityParam,
  campusId,
  campuses,
}: ListingResultsProps) {
  const categoryName = categories.find((c) => c.id === categoryId)?.name || "";
  const campusName = campuses.find((c) => c.id === campusId)?.name || "";
  const conditionLabel = CONDITION_OPTIONS.find((o) => o.value === condition)?.label || "";

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {!loading && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {pagination.total} {pagination.total === 1 ? "listing" : "listings"} found
          </p>
          <div className="flex flex-wrap gap-1.5">
            {q && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                &quot;{q}&quot;
                <button onClick={() => updateParam("q", "")} className="hover:text-primary-900">&times;</button>
              </span>
            )}
            {categoryName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                {categoryName}
                <button onClick={() => updateParam("category", "")} className="hover:text-primary-900">&times;</button>
              </span>
            )}
            {universityParam === "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                All Universities
                <button onClick={() => updateParam("university", "my")} className="hover:text-primary-900">&times;</button>
              </span>
            )}
            {campusName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                {campusName}
                <button onClick={() => updateParam("campus", "")} className="hover:text-primary-900">&times;</button>
              </span>
            )}
            {conditionLabel && conditionLabel !== "All Conditions" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                {conditionLabel}
                <button onClick={() => updateParam("condition", "")} className="hover:text-primary-900">&times;</button>
              </span>
            )}
            {minPrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                Min: {formatPrice(Number(minPrice))}
                <button onClick={() => updateParam("minPrice", "")} className="hover:text-primary-900">&times;</button>
              </span>
            )}
            {maxPrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                Max: {formatPrice(Number(maxPrice))}
                <button onClick={() => updateParam("maxPrice", "")} className="hover:text-primary-900">&times;</button>
              </span>
            )}
          </div>
        </div>
      )}

      {loading ? (
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
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-12 text-center">
          <p className="text-red-600 text-lg">Something went wrong</p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <p className="text-gray-500 text-lg">No listings found</p>
          <p className="text-gray-400 text-sm mt-1">Try changing your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const statusInfo = STATUS_CONFIG[listing.status];
              return (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.id}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                    {listing.images.length > 0 ? (
                      <img src={listing.images[0]!.url} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                    {statusInfo && listing.status !== "ACTIVE" && (
                      <span className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
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
                </Link>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => updateParam("page", String(Math.max(1, page - 1)))}
                disabled={page <= 1}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => updateParam("page", String(Math.min(pagination.totalPages, page + 1)))}
                disabled={page >= pagination.totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
