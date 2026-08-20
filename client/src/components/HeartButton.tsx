import { useState } from "react";
import { apiFetch } from "../services/api";

interface HeartButtonProps {
  listingId: string;
  initialFavorited: boolean;
  onToggle?: (listingId: string, isFavorited: boolean) => void;
  className?: string;
}

export default function HeartButton({ listingId, initialFavorited, onToggle, className = "" }: HeartButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      if (isFavorited) {
        await apiFetch(`/api/favorites/${listingId}`, { method: "DELETE" });
        setIsFavorited(false);
        onToggle?.(listingId, false);
      } else {
        await apiFetch("/api/favorites", {
          method: "POST",
          body: JSON.stringify({ listingId }),
        });
        setIsFavorited(true);
        onToggle?.(listingId, true);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all disabled:opacity-50 ${className}`}
      title={isFavorited ? "Remove from favorites" : "Save to favorites"}
    >
      <svg className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
