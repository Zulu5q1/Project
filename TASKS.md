# UniXchange — Task Tracking

## Phase 1 — Foundation

- [x] Initialize project structure
- [x] Configure frontend (React, TypeScript, Vite, Tailwind CSS, React Router)
- [x] Configure backend (Node.js, Express, TypeScript)
- [x] Configure database (PostgreSQL, Prisma)
- [x] Set up environment variables
- [x] Create base UI system (layouts, placeholder pages)
- [x] Set up error handling (API errors, unknown routes)
- [x] Set up development scripts
- [x] Create TASKS.md
- [x] Create README.md

## Phase 2 — Authentication

- [x] Registration (with validation, duplicate checks)
- [x] Login (JWT-based authentication)
- [x] Logout (client-side token removal)
- [x] Password hashing (bcrypt)
- [x] Protected routes (backend middleware + frontend ProtectedRoute)
- [x] User profile (view + edit)
- [x] University/Campus models and API
- [x] Seed data (5 universities with campuses, development admin account)
- [x] Role-based authorization foundation (STUDENT, ADMIN)
- [x] Auth-aware navigation
- [x] Development admin seed (env-configurable credentials, idempotent)
- [x] Admin-only backend endpoint (`/api/admin/stats` with requireRole)
- [x] Admin page with role confirmation and backend access verification
- [x] Admin navigation link (visible only to ADMIN users)

## Phase 3A — Marketplace Foundation & Listings

- [x] Prisma schema: Category, Listing, ListingImage models
- [x] Prisma enums: ListingCondition (NEW, LIKE_NEW, GOOD, FAIR, USED)
- [x] Prisma enums: ListingStatus (ACTIVE, RESERVED, SOLD, REMOVED)
- [x] Database indexes on Listing (seller, university, campus, category, status, createdAt)
- [x] Category API (`GET /api/categories`)
- [x] Listing API: list with pagination (`GET /api/listings`)
- [x] Listing API: get single (`GET /api/listings/:id`)
- [x] Listing API: create (`POST /api/listings`) — auth required
- [x] Listing API: update (`PATCH /api/listings/:id`) — auth + ownership required
- [x] Listing API: delete (`DELETE /api/listings/:id`) — auth + ownership required
- [x] Listing API: change status (`PATCH /api/listings/:id/status`) — auth + ownership required
- [x] Backend validation: price, category, university, campus, campus-university match
- [x] Backend ownership enforcement (owner or ADMIN only)
- [x] Backend view count increment on listing detail
- [x] Image upload endpoint (Cloudinary abstraction, env-configurable)
- [x] Seed categories (Electronics, Fashion, Books & Academics, Hostel & Living, Food, Beauty, Services, Other)
- [x] Seed demo student account (env-configurable)
- [x] Seed demo listings for development
- [x] Frontend types: Category, Listing, ListingImage, PaginatedListings
- [x] Marketplace page: listing grid with cards, category filter, pagination, loading/empty states
- [x] Listing detail page: image gallery, info, seller, owner actions (edit/delete/status)
- [x] Create listing page: full form with validation, university/campus/category/condition selectors, image URLs
- [x] Edit listing page: pre-filled form, ownership check, image management
- [x] Navigation: "Sell" link (authenticated only), "Marketplace", "Profile"
- [x] Frontend routing: `/marketplace`, `/listings/new`, `/listings/:id`, `/listings/:id/edit`
- [x] Protected routes: `/listings/new` and `/listings/:id/edit` require auth
- [x] README updated with marketplace, listing API, image configuration, seed data
- [x] TASKS.md updated

## Phase 3B — Search & Discovery

- [x] Text search across listing title and description (case-insensitive, backend `contains` query)
- [x] Category filter (dropdown, loaded from API)
- [x] University filter (My University / All Universities / specific)
- [x] Campus filter (dependent on selected university, resets on university change)
- [x] Condition filter (dropdown from ListingCondition enum)
- [x] Price range filter (min/max with validation)
- [x] Sorting (newest, price_asc, price_desc, views) — database-level sorting
- [x] URL-based filter/sort/search state (all params in URL query string)
- [x] Result count display
- [x] Active filter badges with individual clear buttons
- [x] Clear All Filters button
- [x] Pagination (preserved from Phase 3A, works with filters)
- [x] Loading, error, and empty states
- [x] Mobile filter drawer (slide-in panel with filter controls)
- [x] Desktop sidebar filter layout
- [x] Backend validation: minPrice/maxPrice numeric, non-negative, min <= max
- [x] Backend validation: condition enum values, sort option whitelist
- [x] Backend validation: 400 Bad Request for invalid parameters
- [x] University scoping: authenticated users default to own university
- [x] University scoping: unauthenticated users see all universities
- [x] REMOVED listings remain hidden from all search/filter/sort
- [x] Database index on Listing.price and Listing.viewCount for sort performance
- [x] All filters compose correctly in a single backend query

## Phase 4 — Marketplace Enhancements

- [ ] Favorites / Wishlist
- [ ] Sharing
- [ ] Reviews / Ratings
- [ ] Seller dashboard

## Phase 5 — Communication

- [ ] Conversations
- [ ] Messaging
- [ ] Notifications

## Phase 6 — Campus Features

- [ ] Wanted posts
- [ ] Exchange posts
- [ ] Student services

## Phase 7 — Orders

- [ ] Purchase workflow
- [ ] Orders
- [ ] Seller order management
- [ ] Order history
- [ ] Status updates

## Phase 8 — Administration

- [ ] Admin dashboard (stats, user management, listing moderation)
- [ ] Category management
- [ ] University/campus management
- [ ] Reports

## Phase 9 — Polish

- [ ] Responsive design
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling (comprehensive)
- [ ] Animations
- [ ] Accessibility
- [ ] UX improvements

## Phase 10 — Testing and Security

- [ ] Functional testing
- [ ] Authentication testing
- [ ] Authorization testing
- [ ] Form validation
- [ ] API testing
- [ ] Error handling (thorough)
- [ ] Security review

## Phase 11 — Deployment

- [ ] Production database
- [ ] Backend deployment
- [ ] Frontend deployment
- [ ] Environment variables
- [ ] Production configuration
- [ ] Final testing
