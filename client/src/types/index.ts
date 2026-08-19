export interface University {
  id: string;
  name: string;
  shortName: string;
  logo: string | null;
  description: string | null;
  location: string | null;
  website: string | null;
  _count?: { campuses: number };
}

export interface Campus {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: string | null;
  bio: string | null;
  department: string | null;
  role: "STUDENT" | "ADMIN";
  createdAt: string;
  updatedAt?: string;
  university: { id: string; name: string; shortName: string } | null;
  campus: { id: string; name: string } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { listings: number };
}

export interface ListingImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "USED";
  status: "ACTIVE" | "RESERVED" | "SOLD" | "REMOVED";
  location: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  seller: { id: string; firstName: string; lastName: string; username: string; profileImage: string | null };
  university: { id: string; name: string; shortName: string } | null;
  campus: { id: string; name: string } | null;
  category: { id: string; name: string; slug: string };
  images: ListingImage[];
}

export interface PaginatedListings {
  listings: Listing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message?: string;
  data?: T;
}
