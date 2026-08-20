# UniXchange

**Your Campus. Your Marketplace.**

UniXchange is a multi-university student marketplace platform that allows students to buy, sell, exchange items, and offer services within their campus community.

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router v6

### Backend

- Node.js
- Express
- TypeScript
- bcrypt (password hashing)
- JSON Web Tokens (authentication)

### Database

- PostgreSQL
- Prisma ORM

### Image Storage

- Cloudinary (configured via environment variables; in development, provide image URLs directly)

## Project Structure

```
unixchange/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── layouts/        # Page layouts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   ├── context/        # React context providers
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
│
├── server/                 # Backend application
│   ├── src/
│   │   ├── config/         # Configuration (Prisma client)
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/      # Express middleware (auth, errors)
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript declarations
│   │   └── utils/          # Utility functions (validation, responses)
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   ├── package.json
│   └── tsconfig.json
│
├── PROJECT_SPEC.md         # Full project specification
├── TASKS.md                # Task tracking
├── README.md
└── .gitignore
```

## Installation

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- npm

### Setup

1. Clone the repository

```bash
git clone <repo-url>
cd unixchange
```

2. Install frontend dependencies

```bash
cd client
npm install
```

3. Install backend dependencies

```bash
cd server
npm install
```

4. Set up environment variables

```bash
# Server
cd server
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret

# Client
cd ../client
cp .env.example .env
```

5. Generate Prisma client

```bash
cd server
npx prisma generate
```

6. Run database migrations (requires running PostgreSQL)

```bash
npx prisma migrate dev
```

7. Seed the database with sample data

```bash
npm run prisma:seed
```

## Development Commands

### Frontend (from `client/`)

```bash
npm run dev        # Start development server on port 3000
npm run build      # Production build
npm run lint       # TypeScript check
npm run preview    # Preview production build
```

### Backend (from `server/`)

```bash
npm run dev              # Start dev server with hot reload on port 5000
npm run build            # Compile TypeScript
npm run start            # Run compiled server
npm run lint             # TypeScript check
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database with sample data
npm run db:seed          # Alias for prisma:seed
npm run db:setup         # Run migrations + seed in one step
```

## Environment Variables

### Server (`.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `ADMIN_EMAIL` | Dev admin email | `admin@unixchange.com` |
| `ADMIN_PASSWORD` | Dev admin password | `admin123` |
| `ADMIN_USERNAME` | Dev admin username | `admin` |
| `STUDENT_EMAIL` | Dev student email | `student@unixchange.com` |
| `STUDENT_PASSWORD` | Dev student password | `student123` |
| `STUDENT_USERNAME` | Dev student username | `student` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | — |

### Client (`.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

## API Endpoints

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Users

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/:userId` | Get a user's public profile | No |
| PUT | `/api/users/profile` | Update own profile | Yes |

### Universities

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/universities` | List active universities | No |
| GET | `/api/universities/:universityId/campuses` | List campuses for a university | No |

### Categories

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/categories` | List active categories | No |

### Listings

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/listings` | List active listings (paginated, filterable) | No |
| GET | `/api/listings/:id` | Get a single listing (increments view count) | No |
| POST | `/api/listings` | Create a new listing | Yes |
| PATCH | `/api/listings/:id` | Update a listing | Yes (owner or ADMIN) |
| DELETE | `/api/listings/:id` | Delete a listing | Yes (owner or ADMIN) |
| PATCH | `/api/listings/:id/status` | Change listing status | Yes (owner or ADMIN) |

**Query parameters for `GET /api/listings`:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 50) |
| `q` | string | Text search across title and description (case-insensitive) |
| `universityId` | string | Filter by university ID |
| `campusId` | string | Filter by campus ID |
| `categoryId` | string | Filter by category ID |
| `condition` | string | Filter by condition: `NEW`, `LIKE_NEW`, `GOOD`, `FAIR`, `USED` |
| `minPrice` | number | Minimum price (non-negative) |
| `maxPrice` | number | Maximum price (non-negative, must be >= minPrice) |
| `sort` | string | Sort order: `newest` (default), `price_asc`, `price_desc`, `views` |
| `sellerId` | string | Filter by seller ID |
| `status` | string | Filter by status (default: ACTIVE, RESERVED, SOLD) |

All filters compose correctly. Returns `400 Bad Request` for invalid parameters.

**Listing statuses:** `ACTIVE`, `RESERVED`, `SOLD`, `REMOVED`

**Listing conditions:** `NEW`, `LIKE_NEW`, `GOOD`, `FAIR`, `USED`

### Images

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/images` | Upload/validate an image URL | Yes |

### Conversations & Messaging

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/conversations` | Create or get existing conversation for a listing | Yes |
| GET | `/api/conversations` | List user's conversations (buyer + seller) | Yes |
| GET | `/api/conversations/:id` | Get conversation detail (participants only) | Yes |
| GET | `/api/conversations/:id/messages` | Get paginated messages (participants only) | Yes |
| POST | `/api/conversations/:id/messages` | Send a message in a conversation | Yes |
| PATCH | `/api/conversations/:id/read` | Mark other participant's messages as read | Yes |

**POST `/api/conversations`** — Body: `{ "listingId": "uuid" }`

- Creates a new conversation between the authenticated user (buyer) and the listing's seller
- Returns existing conversation if buyer has already messaged about this listing
- Returns `400` if: listing is SOLD/REMOVED, buyer is the seller, or listingId missing

**GET `/api/conversations`** — Returns conversations with:
- Listing info (id, title, price, first image)
- Other participant info
- Last message content and timestamp
- Unread message count

**POST `/api/conversations/:id/messages`** — Body: `{ "content": "string" }`

- Content required, non-empty, max 2000 characters
- Sender ID derived from JWT (not client-supplied)
- Returns `403` if not a conversation participant

**Query parameters for `GET /api/conversations/:id/messages`:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Messages per page (default: 50, max: 100) |

Messages ordered oldest-first (ASC). Returns `403` if not a participant.

### Admin

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin stats (role verification) | ADMIN |

## Seed Data

The seed script creates:

- **5 Universities**: Landmark University (LMU), University of Lagos (UNILAG), Covenant University (CU), University of Ibadan (UI), University of Nigeria Nsukka (UNN)
- **7 Campuses**: Each university has at least one campus (UNILAG, UI, and UNN have two each)
- **8 Categories**: Electronics, Fashion, Books & Academics, Hostel & Living, Food, Beauty, Services, Other
- **Development admin account** (credentials configurable via environment variables):
  - Email: `admin@unixchange.com`
  - Password: `admin123`
  - Role: `ADMIN`
- **Development student account** (credentials configurable via environment variables):
  - Email: `student@unixchange.com`
  - Password: `student123`
  - Role: `STUDENT`
- **Demo listings** (4 listings across different categories at UNILAG)

**Important**: All development credentials are for development only. Never use them in production. Configure via environment variables in `server/.env`.

### Running the seed

```bash
cd server
npm run db:seed
```

## Image Handling

In development, listings accept image URLs directly (e.g., links from imgur or any public image host).

For production, configure Cloudinary:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Without Cloudinary configured, the `/api/images` upload endpoint returns a `501 Not Implemented` response with instructions.

## Current Status

**Phase 3C — Messaging System** is complete.

### What's Implemented

- User registration with validation (email, username uniqueness, password strength)
- JWT-based login/logout
- Password hashing with bcrypt (12 rounds)
- Protected API routes (authenticate middleware)
- Role-based authorization (STUDENT, ADMIN) with `requireRole` middleware
- Admin-only backend endpoint (`/api/admin/stats`)
- Development admin/student seeds with configurable credentials (env vars)
- User profile viewing and editing
- University and campus API endpoints (read)
- Category API with listing counts
- Full listing CRUD (create, read, update, delete)
- Listing status management (active, reserved, sold, removed)
- Listing view count tracking
- Paginated marketplace with category filtering
- University-scoped marketplace discovery
- Backend ownership enforcement (owner or ADMIN only)
- Backend validation (price, category, university, campus, campus-university match)
- Image URL support (Cloudinary abstraction for production)
- Create listing page with form validation
- Edit listing page with ownership verification
- Listing detail page with image gallery and owner actions
- Marketplace page with listing cards, category filters, and pagination
- Auth-aware navigation with "Sell" link for authenticated users
- Protected frontend routes (`/listings/new`, `/listings/:id/edit`)
- Database schema: University, Campus, User, Category, Listing, ListingImage
- Seed data: 5 universities, 7 campuses, 8 categories, 4 demo listings
- **Text search** across listing title and description (case-insensitive)
- **University filter** (My University / All Universities / specific)
- **Campus filter** (dependent on university selection)
- **Condition filter** (New, Like New, Good, Fair, Used)
- **Price range filter** (min/max with validation)
- **Sort options** (Newest, Price Low-High, Price High-Low, Most Viewed)
- **URL-based filter state** (all filters persisted in query parameters)
- **Active filter badges** with individual and clear-all
- **Mobile filter drawer** (slide-in panel)
- **Result count** reflecting active search/filter combination
- **Backend validation** for all filter parameters (400 on invalid)
- **Database indexes** on price and viewCount for sort performance
- **Conversation system** — per-listing buyer-seller conversations with unique constraint
- **Real-time messaging** — send/receive messages with polling (30s inbox, 15s chat)
- **Unread tracking** — per-conversation unread count with mark-as-read
- **Message Seller button** — on listing detail, creates conversation and navigates to chat
- **Messages navigation** — nav link with unread indicator badge
- **Security** — participant-only access, no sender spoofing, content validation (max 2000 chars)

### Database Models

- `User` — accounts with roles, university/campus associations
- `University` — multi-university support with campuses
- `Campus` — belongs to a university
- `Category` — marketplace categories with slug and active status
- `Listing` — marketplace items with price, condition, status, seller, university/campus/category
- `ListingImage` — multiple images per listing with sort order
- `Conversation` — buyer-seller conversation per listing (unique on listingId+buyerId)
- `Message` — individual messages with sender, content, read status
- `Role` enum — STUDENT, ADMIN
- `ListingCondition` enum — NEW, LIKE_NEW, GOOD, FAIR, USED
- `ListingStatus` enum — ACTIVE, RESERVED, SOLD, REMOVED

## Next Steps (Phase 4+)

- Shopping cart and transactions
- University/campus CRUD for admin
- Favorites / wishlist
- Reviews and ratings
- Notifications
