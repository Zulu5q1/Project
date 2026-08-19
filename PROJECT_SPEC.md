# UniXchange — Master Project Specification

**Version:** 1.0
**Project Type:** Multi-University Student Marketplace
**Product Name:** UniXchange
**Tagline:** Your Campus. Your Marketplace.

---

## 1. Product Overview

UniXchange is a modern marketplace platform designed specifically for university communities.

The platform allows students from different universities to:

* Buy products
* Sell products
* Exchange items
* Offer services
* Discover services
* Create wanted posts
* Communicate with other students
* Manage orders
* Rate sellers/service providers
* Report inappropriate users or listings

UniXchange must support **multiple universities and campuses** from the beginning.

The initial deployment may contain a limited number of universities, but the architecture must allow additional universities to be added without requiring major code changes.

UniXchange is **not an AI-powered marketplace**. AI is being used as the development method for this project. The finished product does not need an AI chatbot, AI recommendations, AI search, or other AI functionality unless explicitly added later.

---

# 2. Product Vision

UniXchange should feel like a combination of:

* A student marketplace
* A campus exchange platform
* A student services directory
* A trusted university community

The product should be significantly more focused on university life than a general marketplace such as Jiji or Facebook Marketplace.

The experience should be:

* Modern
* Clean
* Fast
* Easy to understand
* Mobile-friendly
* Trust-oriented
* Student-focused

---

# 3. Target Users

The primary users are university students.

Potential future users may include:

* Student sellers
* Student buyers
* Student service providers
* University administrators
* Campus administrators
* Platform administrators

A normal student account should be capable of both buying and selling.

There should not be unnecessary separation between "buyer" and "seller" accounts.

---

# 4. Multi-University Architecture

UniXchange must not be hard-coded around one university.

The system should support:

```text
Platform
    ↓
University
    ↓
Campus
    ↓
User
```

Each user belongs to a university and, where applicable, a campus.

Listings, services, wanted posts, and exchange posts should contain appropriate university/campus relationships.

The system should prevent accidental mixing of marketplace content between universities.

For example:

A student at University A should primarily see marketplace content belonging to University A.

The architecture should make it possible to implement cross-university discovery later without restructuring the database.

---

# 5. University Structure

A university should contain:

* Name
* Short name
* Logo
* Description
* Location
* Website
* Active/inactive status

A university may contain multiple campuses.

A campus should contain:

* Name
* University
* Location
* Description
* Active/inactive status

The system should allow administrators to add, edit, deactivate, and manage universities and campuses.

---

# 6. User Accounts

Users should be able to:

* Register
* Log in
* Log out
* Reset password
* View profile
* Edit profile
* Upload profile picture
* Update bio
* Select university
* Select campus
* Add department/course information
* Add preferred location where appropriate
* Manage account settings

User profiles should display:

* Profile picture
* Display name
* Username
* University
* Campus
* Department/course
* Bio
* Rating
* Number of active listings
* Number of completed transactions
* Reviews

Users should only be able to edit their own profiles.

---

# 7. Authentication

Authentication must include:

* Registration
* Login
* Logout
* Password hashing
* Password reset flow
* Protected routes
* Authentication state
* Authorization

Sensitive information must never be exposed to the frontend unnecessarily.

Passwords must never be stored in plain text.

Authentication credentials and secrets must be stored securely using environment variables where appropriate.

---

# 8. Marketplace

The marketplace is the primary feature of UniXchange.

Users should be able to:

* Browse listings
* Search listings
* Filter listings
* Sort listings
* View categories
* View product details
* View seller profiles
* Save listings
* Share listings
* Report listings

The marketplace should prioritize the user's university and campus.

---

# 9. Product Categories

Initial categories should include:

### Electronics

* Phones
* Laptops
* Tablets
* Accessories
* Gaming
* Audio

### Fashion

* Clothing
* Shoes
* Bags
* Accessories

### Books & Academics

* Textbooks
* Course materials
* Past questions
* Stationery

### Hostel & Living

* Furniture
* Kitchen items
* Bedding
* Appliances
* Decorations

### Food

* Snacks
* Drinks
* Meals
* Homemade food

### Beauty

* Hair
* Skincare
* Cosmetics
* Barbering

### Services

* Graphics design
* Photography
* Tutoring
* Programming
* Writing
* Repairs
* Cleaning

### Other

Categories should be database-driven rather than hard-coded throughout the frontend.

---

# 10. Listings

Users should be able to create marketplace listings.

A listing should contain:

* Title
* Description
* Price
* Category
* Subcategory where applicable
* Condition
* Images
* University
* Campus
* Location
* Seller
* Created date
* Updated date
* Status
* View count

Possible conditions:

* New
* Like New
* Good
* Fair
* Used

Possible listing statuses:

* Active
* Reserved
* Sold
* Removed

Users should be able to:

* Create listings
* Edit their listings
* Delete their listings
* Mark listings as sold
* Mark listings as reserved
* View their listings

Users must not be able to modify another user's listing.

---

# 11. Product Details Page

A listing detail page should display:

* Image gallery
* Product title
* Price
* Condition
* Description
* Category
* Location
* University
* Campus
* Seller information
* Seller rating
* Listing date
* View count

Actions:

* Message Seller
* Save
* Share
* Report

The page should also display related listings where appropriate.

---

# 12. Search

Users should be able to search the marketplace.

Search should consider relevant fields such as:

* Listing title
* Description
* Category
* Subcategory

Search results should respect the user's university/campus context.

The search interface should be fast and intuitive.

---

# 13. Filtering and Sorting

Users should be able to filter by:

* Category
* Subcategory
* Price range
* Condition
* University
* Campus
* Location
* Listing type
* Date

Users should be able to sort by:

* Newest
* Oldest
* Lowest price
* Highest price
* Most viewed

---

# 14. Favorites / Wishlist

Users should be able to save listings.

The favorites page should show:

* Saved listing
* Product image
* Product name
* Price
* Seller
* Availability

Users should be able to remove saved listings.

The system should prevent duplicate favorites.

---

# 15. Selling Dashboard

Users who create listings should have access to a seller dashboard.

The dashboard should show:

* Active listings
* Sold listings
* Reserved listings
* Total views
* Recent orders
* Recent messages
* Basic sales statistics

Seller actions:

* Create listing
* Edit listing
* Delete listing
* Mark as sold
* Mark as reserved
* View listing performance

---

# 16. Wanted Posts

Users should be able to create "Wanted" posts.

Example:

> Wanted: iPhone 13

A wanted post should contain:

* Title
* Description
* Category
* Budget
* University
* Campus
* Location
* Created date
* Status

Users should be able to respond to wanted posts.

---

# 17. Exchange Marketplace

Users should be able to create exchange posts.

Example:

> iPhone 11 — Looking to exchange for Samsung S21 or similar.

Exchange posts should contain:

* Item title
* Description
* Images
* Category
* Estimated value
* Desired exchange
* University
* Campus
* Location
* Status

Users should be able to contact the owner of an exchange listing.

---

# 18. Student Services

UniXchange should support student-to-student services.

Examples:

* Graphics design
* Photography
* Tutoring
* Programming
* Writing
* Hairdressing
* Beauty services
* Repairs
* Cleaning
* Other student services

A service listing should include:

* Service title
* Description
* Category
* Starting price
* Images/portfolio
* University
* Campus
* Provider
* Availability
* Rating

---

# 19. Messaging

Users should be able to communicate privately.

The messaging system should support:

* Conversation list
* Individual conversations
* Sending messages
* Message timestamps
* Read/unread status
* New message notifications

Messages should be associated with the relevant users and, where appropriate, the listing being discussed.

The first version does not need unnecessarily complex real-time infrastructure unless required for a reliable implementation.

---

# 20. Reviews and Ratings

Users should be able to review sellers/service providers after appropriate completed interactions.

Reviews should contain:

* Rating from 1–5
* Optional written review
* Reviewer
* Reviewee
* Relevant transaction/service
* Date

Users should not be able to arbitrarily review themselves.

The system should prevent obvious duplicate reviews for the same completed interaction.

---

# 21. Notifications

Users should receive notifications for important activity.

Examples:

* New message
* New review
* Listing saved
* Listing sold
* Order update
* Wanted-post response
* Account activity
* Report updates where appropriate

Notifications should support read/unread status.

---

# 22. Orders

UniXchange should include a basic order workflow.

Example:

```text
Listing
   ↓
Purchase
   ↓
Order Created
   ↓
Seller Confirmation
   ↓
Order Processing
   ↓
Completed
```

Possible statuses:

* Pending
* Confirmed
* Processing
* Ready
* Completed
* Cancelled

Users should be able to view order history.

Sellers should be able to manage orders associated with their listings.

---

# 23. Payment

The initial version does **not require real payment processing**.

The application should demonstrate the marketplace transaction workflow without requiring users to send real money through the platform.

The architecture should leave room for a payment provider to be integrated later.

No fake payment success should be represented as a real financial transaction.

---

# 24. Reporting and Safety

Users should be able to report:

* Listings
* Users
* Services
* Wanted posts
* Exchange posts

Report categories may include:

* Scam/suspicious activity
* Prohibited item
* Inappropriate content
* Spam
* Harassment
* Incorrect information
* Other

Reports should be visible to authorized administrators.

---

# 25. Admin Dashboard

The admin dashboard should contain:

### Overview

* Total users
* Active users
* Total listings
* Active listings
* Sold listings
* Total orders
* Pending reports
* Recent activity

### User management

* Search users
* View users
* Suspend users
* Reactivate users

### Listing management

* Search listings
* View listings
* Remove listings
* Restore listings

### Report management

* View reports
* Investigate reports
* Update report status
* Resolve reports

### Category management

* Create categories
* Edit categories
* Deactivate categories

### University management

* Add universities
* Edit universities
* Add campuses
* Edit campuses
* Activate/deactivate universities or campuses

---

# 26. Roles and Permissions

The system should use role-based authorization.

Initial roles:

* Student
* Admin

The architecture should allow additional administrative scopes later.

Students must not be able to access administrative functionality.

Administrative APIs must be protected on the backend, not merely hidden in the frontend.

---

# 27. UI/UX

UniXchange should have a modern marketplace design.

Design characteristics:

* Clean
* Modern
* Minimal clutter
* Strong visual hierarchy
* Clear calls to action
* High-quality product cards
* Responsive layouts
* Consistent spacing
* Accessible typography
* Clear navigation

The design should feel like a **real commercial product**, not a school assignment.

---

# 28. Responsive Design

The application must work on:

* Mobile phones
* Tablets
* Laptops
* Desktop computers

Important interactions should remain usable on small screens.

Navigation should adapt appropriately to mobile layouts.

---

# 29. UI States

All important asynchronous operations should have appropriate states.

### Loading

Use loading indicators or skeletons.

### Empty

Example:

> No listings found.

### Error

Example:

> Something went wrong. Please try again.

### Success

Use appropriate success feedback.

### Destructive actions

Require confirmation where appropriate.

---

# 30. Accessibility

The application should follow reasonable accessibility practices.

Include:

* Semantic HTML
* Keyboard-accessible controls
* Labels for form fields
* Appropriate focus states
* Alt text for meaningful images
* Sufficient contrast
* Accessible buttons and links

---

# 31. Performance

The application should avoid unnecessary performance problems.

Consider:

* Image optimization
* Pagination or appropriate list loading
* Efficient database queries
* Avoiding unnecessary API requests
* Reasonable frontend state management
* Lazy loading where beneficial

Do not introduce unnecessary complexity solely for theoretical performance improvements.

---

# 32. Security

Implement reasonable security practices.

Requirements include:

* Password hashing
* Protected routes
* Backend authorization
* Input validation
* Server-side validation
* Secure environment variables
* Appropriate CORS configuration
* Protection against unauthorized resource modification
* No secrets committed to source control
* No API keys exposed unnecessarily to the frontend

Users must only be able to modify resources they own unless they have appropriate administrative permissions.

---

# 33. Technology Direction

Preferred stack:

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

### Backend

* Node.js
* Express
* TypeScript where practical

### Database

* PostgreSQL
* Prisma ORM

### Authentication

* Secure authentication system
* Password hashing
* Protected API routes

### Image storage

Use a suitable external image storage service such as Cloudinary if required.

### Deployment

The application should be deployable as separate frontend and backend services if appropriate.

The exact hosting provider may be selected during deployment based on availability and project requirements.

---

# 34. Project Architecture

Use a clear separation between frontend and backend.

Suggested structure:

```text
unixchange/
│
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/
│       ├── context/
│       ├── types/
│       └── utils/
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   │
│   └── prisma/
│       └── schema.prisma
│
├── PROJECT_SPEC.md
├── TASKS.md
└── README.md
```

The exact structure may be adjusted if the implementation has a strong reason to do so, but separation of concerns must remain clear.

---

# 35. Database Principles

The database should use proper relational relationships.

Potential entities include:

* University
* Campus
* User
* Category
* Listing
* ListingImage
* Favorite
* Conversation
* Message
* Review
* Order
* OrderItem
* WantedPost
* ExchangePost
* Service
* Notification
* Report

Do not create every possible table before it is needed.

Database design should evolve alongside feature implementation.

---

# 36. Development Phases

The application must be built incrementally.

### Phase 1 — Foundation

* Initialize project
* Configure frontend
* Configure backend
* Configure database
* Establish architecture
* Set up environment variables
* Create base UI system

### Phase 2 — Authentication

* Registration
* Login
* Logout
* Password hashing
* Protected routes
* User profile

### Phase 3 — Universities

* Universities
* Campuses
* University selection
* Campus selection
* University-aware marketplace context

### Phase 4 — Marketplace

* Categories
* Listings
* Listing details
* Product images
* Search
* Filtering
* Sorting

### Phase 5 — Seller System

* Create listing
* Edit listing
* Delete listing
* Mark sold
* Mark reserved
* Seller dashboard

### Phase 6 — Engagement

* Favorites
* Sharing
* Reviews
* Ratings

### Phase 7 — Communication

* Conversations
* Messaging
* Notifications

### Phase 8 — Campus Features

* Wanted posts
* Exchange posts
* Student services

### Phase 9 — Orders

* Purchase workflow
* Orders
* Seller order management
* Order history
* Status updates

### Phase 10 — Administration

* Admin dashboard
* User management
* Listing moderation
* Reports
* Categories
* Universities
* Campuses
* Platform statistics

### Phase 11 — Polish

* Responsive design
* Loading states
* Empty states
* Error handling
* Animations
* Accessibility
* UX improvements

### Phase 12 — Testing and Security

* Functional testing
* Authentication testing
* Authorization testing
* Form validation
* API testing
* Error handling
* Security review

### Phase 13 — Deployment

* Production database
* Backend deployment
* Frontend deployment
* Environment variables
* Production configuration
* Final testing

---

# 37. AI Development Rules

The AI coding agent must follow these rules.

### Rule 1 — Do not build everything at once.

Implement one logical phase or feature at a time.

### Rule 2 — Inspect before modifying.

Before making significant changes, inspect the existing implementation and understand how it currently works.

### Rule 3 — Preserve working functionality.

Do not unnecessarily rewrite existing working features when implementing new functionality.

### Rule 4 — Explain complex changes.

For significant architectural changes, explain:

* What will change
* Which files will change
* Why the change is necessary
* Potential risks

before implementation where practical.

### Rule 5 — Test after implementation.

After implementing a feature:

* Run the application
* Run relevant tests
* Check for TypeScript errors
* Check for lint/build errors
* Fix discovered problems

### Rule 6 — Do not hide errors.

Do not silence errors merely to make the application appear functional.

### Rule 7 — Do not use fake functionality without clearly marking it.

If a feature cannot yet be implemented, do not create a misleading fake implementation and present it as complete.

### Rule 8 — Use environment variables for secrets.

Never hard-code:

* Database credentials
* API keys
* Authentication secrets
* Cloudinary credentials
* Production secrets

### Rule 9 — Keep the implementation maintainable.

Prefer clear, understandable code over unnecessarily clever solutions.

### Rule 10 — Update documentation.

After completing major functionality, update relevant documentation and TASKS.md.

---

# 38. Task Tracking

Maintain a `TASKS.md` file.

Use:

```text
[x] Completed
[ ] Not completed
```

Example:

```text
## Foundation

[x] Initialize React application
[x] Initialize Express server
[x] Configure PostgreSQL
[ ] Configure Prisma
[ ] Create initial database schema

## Authentication

[ ] Registration
[ ] Login
[ ] Logout
[ ] Protected routes
[ ] Profile
```

The task list should reflect the actual state of the project.

---

# 39. Documentation

The project should contain a useful README containing:

* Project description
* Features
* Technology stack
* Setup instructions
* Environment variables
* Database setup
* Development commands
* Build instructions
* Deployment instructions

Documentation should be updated as the project evolves.

---

# 40. Final Quality Standard

Before deployment, UniXchange should satisfy the following:

* Users can register and log in.
* Users belong to a university/campus.
* Users can browse listings.
* Users can search and filter.
* Users can create and manage listings.
* Users can view seller profiles.
* Users can favorite listings.
* Users can communicate with sellers.
* Users can create wanted posts.
* Users can create exchange posts.
* Users can offer services.
* Users can complete the basic order workflow.
* Users can review appropriate transactions.
* Users receive relevant notifications.
* Users can report problematic content.
* Admins can manage the platform.
* The application works responsively.
* Authentication and authorization work correctly.
* Production configuration is secure.
* The application can be deployed successfully.

---

# 41. Product Philosophy

UniXchange should prioritize **functionality, clarity, and reliability over unnecessary complexity**.

A smaller feature that works correctly is better than a complicated feature that is unreliable.

The objective is to deliver a convincing, functional marketplace that demonstrates the ability to use an AI coding agent to develop, debug, test, and deploy a real software product.

---

# 42. Current Project Status

The project is currently in the **planning stage**.

No feature should be considered implemented until it has actually been built and tested.

The next task is to initialize the project according to this specification and begin **Phase 1 — Foundation**.
