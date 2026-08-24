# Veloura Lighting — Full-Stack MERN Architecture

A luxury architectural lighting web application and Content Management System (CMS) engineered with the **MERN (MongoDB, Express.js, React 19, Node.js)** stack in a clean, decoupled **Client/Server MVC** repository architecture.

---

## 1. System Architecture

```text
veloura-lighting/
│
├── client/                      # React 19 + Vite Frontend SPA
│   ├── public/                  # Static assets, favicon, robots.txt, sitemap.xml, _redirects
│   ├── src/
│   │   ├── assets/              # Static branding and media assets
│   │   ├── components/          # Categorized UI component hierarchy
│   │   │   ├── common/          # SEO, Toast, WhatsAppButton, BrandedLoadingFallback
│   │   │   ├── layout/          # Header, Footer
│   │   │   ├── sections/        # PageHero, SectionTitle, BeforeAfterSlider, LightingFinder...
│   │   │   ├── modals/          # ProjectModal, ModalConfirm
│   │   │   └── ui/              # StatusBadge, AdminHeader, AdminSidebar
│   │   ├── context/             # AuthContext, SettingsContext
│   │   ├── data/                # Fallback static datasets (site.js)
│   │   ├── layouts/             # AdminLayout
│   │   ├── pages/               # Application Pages
│   │   │   ├── public/          # Home, Collections, Portfolio, About, Contact, Consultation...
│   │   │   └── admin/           # AdminLogin, Dashboard, Products, Collections, Leads CRM...
│   │   ├── routes/              # AppRoutes, ProtectedRoute
│   │   ├── seo/                 # Dynamic SEO configuration & WhatsApp link generators
│   │   ├── services/            # Axios API client & REST services
│   │   ├── styles/              # Luxury CSS design system (#15391d / #e6c77a / #f3f3eb)
│   │   ├── utils/               # Local bookmark storage utility
│   │   ├── App.jsx              # App root component
│   │   └── main.jsx             # React DOM entry point
│   ├── index.html               # SPA HTML entry point
│   ├── vite.config.js           # Vite build & development configuration
│   ├── package.json             # Frontend dependencies & scripts
│   └── .env.example             # Frontend environment template
│
├── server/                      # Express.js MVC REST API Backend
│   ├── server.js                # Server bootstrapper & listener
│   ├── e2e_test.js              # Automated 33-test E2E integration test suite
│   ├── package.json             # Backend dependencies & scripts
│   ├── .env.example             # Backend environment template
│   └── src/
│       ├── app.js               # Express application setup, security middleware, SPA static serving
│       ├── config/              # MongoDB connection & Cloudinary setup
│       ├── controllers/         # REST API request/response handlers
│       ├── middleware/          # JWT auth, error handlers, memory upload stream, rate limiters
│       ├── models/              # Mongoose normalized schemas (10 models)
│       ├── routes/              # Express API route definitions & dynamic sitemap
│       ├── seed/                # Safe database seeder script & datasets
│       ├── services/            # Business logic, unique slug generation, pagination math
│       ├── utils/               # JWT token generator, standardized JSON envelope, slugify
│       └── validators/          # Express-validator input validation chains
│
├── .gitignore                   # Comprehensive root Git ignore rules
├── package.json                 # Convenient root runner scripts
└── README.md                    # Project documentation
```

---

## 2. Features

### Public Architectural Showcase
* **Home Page:** Dynamic signature pieces, curated collections, interactive before/after lighting transformation slider, brand story, SEO FAQ accordion, and consultation call-to-actions.
* **Collections & Detail Routes:** Curated architectural categories (`/collections`) and dynamic detail pages (`/collections/:slug`) with technical characteristics, materials, applications, and direct WhatsApp quote inquiries.
* **Portfolio Showcase & Deep SEO Routes:** Filterable architectural project gallery (`/portfolio`) with interactive lightbox modal and dedicated SEO-friendly deep URLs (`/portfolio/:slug`).
* **Interactive Lighting Finder:** 4-step interactive wizard that provides tailored luminaire recommendations and pre-fills personalized WhatsApp consultation inquiries.
* **Private Consultation Booking:** Multi-field consultation booking form (`/consultation`) supporting architectural drawing uploads (PDF, JPG, PNG) stored via Cloudinary or local disk.
* **Studio Directory & Contact:** Real-time editable address, direct telephone, email, and live WhatsApp concierge (`/contact`).
* **Newsletter Subscription:** Footer subscription form with duplicate detection and database persistence.
* **Dual-Mode Data Resilience:** Fetches from live REST API with graceful fallback to built-in datasets if the server is offline during development.

### Studio Admin CMS Portal (`/admin`)
* **Secure Authentication:** JWT-based administrative authentication with bcrypt password hashing (12 salt rounds) and automatic session expiry handling.
* **Code-Split Optimization:** Lazy-loaded Admin CMS module using `React.lazy()` — public visitors download zero admin code, reducing the public initial bundle by **-23%**.
* **Dashboard Overview & Metrics:** Real-time analytics showing total products, collections, portfolio projects, new consultation leads, and newsletter readership.
* **Product Management (CRUD):** Add, edit, and delete catalogue luminaires with detailed specifications, finishes, dimensions, wattage, and featured flags.
* **Collection Management (CRUD):** Manage architectural collections, hero imagery, material notes, and technical feature bullet points.
* **Portfolio Project Management (CRUD):** Manage showcase installations across Residential, Hospitality, Restaurant, and Commercial sectors.
* **Consultation Lead CRM:** Review inbound private consultation requests, update lead workflow statuses (`New`, `Contacted`, `In Discussion`, `Quoted`, `Completed`, `Cancelled`), view uploaded architectural drawings, and record internal studio notes.
* **Contact Messages Manager:** Review, filter, and archive studio contact enquiries.
* **Newsletter Audience Manager:** View active subscribers and copy all email addresses to clipboard with a single click.
* **FAQ Management:** Database-driven FAQs displayed in the public accordion and embedded in Schema.org `FAQPage` structured data.
* **Testimonials Management:** Manage client reviews, ratings, and studio associations.
* **Global Studio Settings & SEO:** Centrally update company contact numbers, WhatsApp concierge, studio hours, address, and default OpenGraph/meta tags without code redeployments.

---

## 3. Quick Start & Local Development

### 1. Prerequisites
* **Node.js** (v18.x or v20.x+)
* **MongoDB** (Local MongoDB instance running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### 2. Install Dependencies

**Install all workspaces:**
```bash
# Install client dependencies
npm --prefix client install

# Install server dependencies
npm --prefix server install
```

### 3. Environment Variables Configuration

**Backend (`server/.env`):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/veloura_lighting
JWT_SECRET=veloura_luxury_jwt_super_secret_key_2026_change_in_production
JWT_EXPIRE=24h
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary Storage (Falls back to local disk in development)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=veloura_lighting

# Initial Admin Seeder Credentials
INITIAL_ADMIN_EMAIL=admin@veloura-lighting.com
INITIAL_ADMIN_PASSWORD=VelouraAdmin2026!
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_NUMBER=971508924411
```

### 4. Database Seeding

Populate MongoDB with collections, products, portfolio installations, FAQs, site settings, and the initial Admin account:

```bash
npm run seed
```

### 5. Start Development Servers

**Run Frontend Client:**
```bash
npm run client
# or: npm run dev
```
*Frontend runs at:* `http://localhost:5173`

**Run Backend API:**
```bash
npm run server
```
*Backend API runs at:* `http://localhost:5000/api`

---

## 4. Admin CMS Access & Credentials

* **Portal URL:** `http://localhost:5173/admin/login`
* **Default Email:** `admin@veloura-lighting.com`
* **Default Password:** `VelouraAdmin2026!`

---

## 5. Automated Testing

To run the complete 33-test End-to-End integration test suite:

```bash
npm test
```

*Verifies:*
* REST API health & JSON envelope compliance
* Public catalog retrieval (Products, Collections, Projects, FAQs, Settings, dynamic Sitemap XML)
* Authentication security (valid/invalid logins, JWT Bearer verification, route guards, token expiration)
* Complete Product, Collection, and Project CRUD lifecycles with slug verification
* Consultation booking and CRM status transitions with confidential notes privacy
* Contact enquiry submission and management
* Newsletter normalization and duplicate suppression
* Singleton studio settings and live WhatsApp number synchronization
* Error handling (400, 401, 403, 404, CastError)

---

## 6. API Endpoint Matrix

All API endpoints return the standardized JSON envelope:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 }
}
```

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server health status check |
| `GET` | `/api/sitemap.xml` | Public | Live XML sitemap with dynamic database slugs |
| `POST` | `/api/auth/login` | Public | Authenticate admin, receive signed JWT |
| `GET` | `/api/auth/me` | Admin | Get current authenticated admin profile |
| `GET` | `/api/products` | Public | List products (`?search=`, `?category=`, `?collection=`, `?page=`) |
| `GET` | `/api/products/:slug` | Public | Get product by unique slug |
| `POST` | `/api/products` | Admin | Create product |
| `PUT` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |
| `GET` | `/api/collections` | Public | List collections |
| `GET` | `/api/collections/:slug`| Public | Get collection by slug |
| `POST` | `/api/collections` | Admin | Create collection |
| `PUT` | `/api/collections/:id` | Admin | Update collection |
| `DELETE` | `/api/collections/:id` | Admin | Delete collection |
| `GET` | `/api/projects` | Public | List portfolio projects (`?category=`, `?featured=`) |
| `GET` | `/api/projects/:slug` | Public | Get portfolio project by slug |
| `POST` | `/api/projects` | Admin | Create project |
| `PUT` | `/api/projects/:id` | Admin | Update project |
| `DELETE` | `/api/projects/:id` | Admin | Delete project |
| `POST` | `/api/consultations` | Public | Submit consultation booking (multipart files) |
| `GET` | `/api/consultations` | Admin | List consultation leads (`?status=`) |
| `PATCH` | `/api/consultations/:id/status` | Admin | Update lead workflow status |
| `PATCH` | `/api/consultations/:id/notes` | Admin | Update internal admin notes |
| `DELETE`| `/api/consultations/:id` | Admin | Delete consultation lead |
| `POST` | `/api/contact` | Public | Submit general contact enquiry |
| `GET` | `/api/contact` | Admin | List contact messages (`?status=`) |
| `PATCH` | `/api/contact/:id/status` | Admin | Update contact message status |
| `PATCH` | `/api/contact/:id/notes` | Admin | Update internal admin notes |
| `DELETE`| `/api/contact/:id` | Admin | Delete contact message |
| `POST` | `/api/newsletter/subscribe` | Public | Subscribe email to newsletter |
| `GET` | `/api/newsletter` | Admin | List all newsletter subscribers |
| `DELETE`| `/api/newsletter/:id` | Admin | Delete subscriber |
| `GET` | `/api/faqs` | Public | List active FAQs |
| `POST` | `/api/faqs` | Admin | Create FAQ |
| `PUT` | `/api/faqs/:id` | Admin | Update FAQ |
| `DELETE`| `/api/faqs/:id` | Admin | Delete FAQ |
| `GET` | `/api/testimonials` | Public | List active testimonials |
| `POST` | `/api/testimonials` | Admin | Create testimonial |
| `PUT` | `/api/testimonials/:id` | Admin | Update testimonial |
| `DELETE`| `/api/testimonials/:id` | Admin | Delete testimonial |
| `GET` | `/api/settings` | Public | Get live studio settings & directory |
| `PUT` | `/api/settings` | Admin | Update studio settings & global SEO |
| `GET` | `/api/stats/dashboard` | Admin | Get executive metrics & lead statistics |
| `POST` | `/api/upload` | Admin | Upload images or floor plans |

---

## 7. Production Build & Deployment

### Build Client Frontend
```bash
npm run build
```
Generates optimized production bundle in `client/dist/` with `_redirects`, `robots.txt`, and separated Admin CMS chunks.

### Production Start (Node.js)
```bash
npm run server:start
```

### Deployment Strategy (Render / Vercel)
* **Frontend (Render Static Site / Vercel):** Root directory: `client/`, Build command: `npm run build`, Publish directory: `dist`. Direct URL routing is handled by `_redirects`.
* **Backend (Render Web Service):** Root directory: `server/`, Build command: `npm install`, Start command: `npm start`.
* **Database:** MongoDB Atlas M0/M10 Cluster.
* **Storage:** Cloudinary storage (`CLOUDINARY_*` environment variables).

---

## 8. License

© 2026 Veloura Lighting. All rights reserved.
