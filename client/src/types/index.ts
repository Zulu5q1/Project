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

export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  listing: { id: string; title: string; price: number; images: ListingImage[]; status: Listing["status"] };
  buyer: { id: string; firstName: string; lastName: string; username: string; profileImage: string | null };
  seller: { id: string; firstName: string; lastName: string; username: string; profileImage: string | null };
  lastMessage: { content: string; senderId: string; createdAt: string } | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; username: string };
}

export interface PaginatedMessages {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Favorite {
  id: string;
  createdAt: string;
  listing: Listing;
}

export interface PaginatedFavorites {
  favorites: Favorite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
