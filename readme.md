# 🌐 LouderWorld - Event Discovery Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)

> **A production-ready event aggregation platform** that automatically scrapes events from public sources, displays them in a beautiful UI with GDPR-compliant lead capture, and provides an admin dashboard for event curation. Built with modern open-source tools to satisfy all Assignment 1 requirements with room to grow for Assignment 2.

![LouderWorld Architecture](https://imgur.com/placeholder-architecture.png)  
*Complete pipeline: Scrape → Store → Display → Review → Import → Notify*

---

## ✨ Features Implemented (Assignment 1 Requirements)

### 🌍 Public Event Website
| Requirement | Implementation |
|-------------|----------------|
| **Minimalist UI** | Glassmorphism cards, clean typography, cohesive indigo/fuchsia gradient theme |
| **Event Card Elements** | Title, date/time, venue, short summary, source badge, "GET TICKETS" CTA |
| **Lead Capture Flow** | Email modal → explicit consent checkbox → DB save → redirect to source URL |
| **GDPR Compliance** | Consent boolean stored with timestamp; clear privacy notice in modal |

### 🔐 Admin Dashboard (Google OAuth)
| Requirement | Implementation |
|-------------|----------------|
| **Google OAuth Login** | Passport.js strategy with session management; HTTP-only cookies |
| **City Filter** | Dropdown (Sydney, Melbourne, Brisbane, Perth, Adelaide); scalable architecture |
| **Keyword Search** | Real-time search across title, venue, description (case-insensitive) |
| **Date Range Filter** | Start/end date pickers for precise event filtering |
| **Table View** | Responsive table with status badges, source tags, action buttons |
| **Preview Panel** | Click row → sidebar detail view with full event information |
| **Import Workflow** | "Import to Platform" button → sets `imported` status + tracks admin/user/timestamp/notes |
| **Status Tags** | Color-coded badges: 🆕 New (blue), 🔄 Updated (amber), ✅ Imported (green), ⏸️ Inactive (gray) |

### 🕷️ Scraping Pipeline
| Requirement | Implementation |
|-------------|----------------|
| **Auto-scrape Events** | Hybrid Python scraper: Requests+BS4 (primary) + Playwright (fallback) |
| **Store All Fields** | MongoDB schema with 20+ validated fields (title, datetime, venue, city, description, category, tags, image, source info, hashes) |
| **Detect New Events** | SHA-256 hash deduplication on `(title + datetime + source URL path)` |
| **Detect Updated Events** | Compare critical fields (title/datetime/venue); set status="updated" |
| **Detect Inactive Events** | Mark as "inactive" if missing from scrape + past 12-hour cutoff |

---

## 🛠️ Tech Stack

| Layer | Technologies | Purpose |
|-------|--------------|---------|
| **Frontend** | React 18, React Router, Axios, Tailwind CSS | Responsive UI with glassmorphism effects |
| **Backend** | Node.js, Express, Passport.js, Mongoose | REST API with Google OAuth authentication |
| **Database** | MongoDB Atlas (or local) | Event storage, user management, lead tracking |
| **Scraping** | Python 3.10+, Requests, BeautifulSoup4, Playwright, PyMongo | Robust event extraction with anti-detection |
| **Auth** | Google Cloud OAuth 2.0 | Secure admin authentication |
| **DevOps** | PM2 (process manager), Cron (scheduling), Docker (optional) | Production deployment |

---

## 📂 Project Structure

louderworld/
├── backend/ # Node.js/Express API
│ ├── config/
│ │ └── passport.js # Google OAuth strategy
│ ├── controllers/ # Route logic
│ ├── models/ # Mongoose schemas
│ │ ├── event.model.js # Event schema (20+ fields)
│ │ ├── user.model.js # Google-authenticated admins
│ │ ├── emailLead.model.js # GDPR-compliant leads
│ │ └── scrapeLog.model.js # Scrape audit trail
│ ├── routes/ # API endpoints
│ │ ├── auth.route.js
│ │ ├── events.route.js
│ │ ├── leads.route.js
│ │ └── scrapeLog.route.js
│ ├── middlewares/
│ │ └── isAuthenticated.js # Protected route guard
│ ├── .env.example
│ ├── app.js
│ └── server.js
├── frontend/ # React Application
│ ├── src/
│ │ ├── components/
│ │ │ ├── dashboard/ # Filters, EventTable, EventPreview, StatsOverview
│ │ │ ├── events/ # EventCard, EventFilters, EventList
│ │ │ ├── layout/ # Header, Footer, ErrorBoundary, LoadingSpinner
│ │ │ ├── modals/ # EmailCaptureModal, ConfirmModal
│ │ │ └── ui/ # Reusable Button, Input, Select, Badge
│ │ ├── pages/ # Home, Dashboard, DashboardStats, ScrapeLogs, Login
│ │ ├── services/ # api.js (Axios client), auth.js (context)
│ │ ├── utils/ # formatters.js, constants.js
│ │ └── App.jsx
│ ├── .env.example
│ └── package.json
├── scraper/ # Python Scraping Engine
│ ├── eventbrite_scraper.py # Hybrid scraper (Requests + Playwright)
│ ├── requirements.txt
│ └── .env.example
├── docs/ # Project documentation
│ ├── screenshots/ # UI mockups (public-home.png, dashboard.png, etc.)
│ └── architecture-diagram.png
├── README.md # You are here!
└── PROJECT_REPORT.md # Detailed 2-page technical report


---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & pip
- MongoDB (Atlas cloud instance or local MongoDB 6.0+)
- Google Cloud Project with OAuth credentials ([Setup Guide](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid))

### Step 1: Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/events_db?retryWrites=true&w=majority

# Google OAuth (Get from Google Cloud Console)
PORT = 3000
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
✅ Backend runs at http://localhost:3000

Step 2: Frontend Setup
SESSION_SECRET=your_strong_random_64_char_secret_here

cd frontend
npm install
cp .env.example .env
VITE_API_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173

Step 3: Scraper Setup
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/events_db?retryWrites=true&w=majority
MONGO_DB=events_db
SCRAPER_CITY=sydney
# Basic usage (uses Requests first, Playwright fallback)
python eventbrite_scraper.py sydney

# Force Playwright mode (for debugging Cloudflare blocks)
python eventbrite_scraper.py sydney --playwright

# Schedule with cron (every 6 hours)
# Add to crontab: crontab -e
0 */6 * * * cd /path/to/louderworld/scraper && /usr/bin/python3 eventbrite_scraper.py sydney >> /var/log/louderworld-scrape.log 2>&1
🌐 API Endpoints
Public Routes (No Auth)
Endpoint
Method
Description
/api/events
GET
Get public events (?city=sydney&search=concert)
/api/events/:id
GET
Get single event details
/api/leads
POST
Save email lead ({email, consent: true, eventId})
Authentication Routes
Endpoint
Method
Description
/auth/google
GET
Initiate Google OAuth flow
/auth/google/callback
GET
OAuth callback handler
/auth/logout
POST
Clear session + cookies
/auth/user
GET
Get current user profile
Dashboard Routes (Protected - Requires Auth)
Endpoint
Method
Description
/api/events/dashboard
GET
Get events for dashboard (?city=sydney&status=new&startDate=2026-02-01&endDate=2026-02-28&search=music)
/api/events/:id/import
POST
Import single event ({importNotes: "Great for platform"})
/api/events/bulk-status
POST
Bulk update status ({eventIds: ["id1","id2"], status: "imported"})
/api/events/:id/inactive
PUT
Mark event as inactive
/api/events/stats/overview
GET
Get dashboard statistics (totals, categories, sources)
/api/scrape-logs
GET
Get recent scrape logs (max 50)
📱 Usage Guide
For End Users (Public Site)
Visit http://localhost:5173
Browse events in Sydney (default city)
Filter by city dropdown or search keywords
Click "🎫 GET TICKETS" on any event
In modal:
Enter email address
✅ Check consent box ("I consent to receiving event information...")
Click "📧 Submit Email"
Redirected to original event page on Eventbrite
Email + consent + event reference saved to database
For Admins (Dashboard)
Click "Login" in top-right → authenticate with Google
Dashboard loads with events table and filters:
City: Select Sydney/Melbourne/etc.
Status: Filter by new/updated/imported/inactive
Date Range: Set start/end dates (critical requirement!)
Search: Keywords for title/venue/description
Click any event row → preview panel slides in from right
In preview panel:
Review all event details
Add optional import notes
Click "✅ Import to Platform"
Event status changes to "imported" (green badge)
Event now appears on public website
View statistics cards at top for real-time counts
Navigate to "Statistics" tab for category/source breakdowns
Navigate to "Scrape Logs" tab to monitor scraping health
For Developers
Add new city: Update city dropdowns in DashboardFilters.jsx and EventFilters.jsx
Add new scraper: Create meetup_scraper.py following eventbrite_scraper.py pattern
Extend event schema: Modify event.model.js → restart backend
Customize UI: Edit Tailwind classes in component files; update colors in tailwind.config.js
🖼️ UI Screenshots (Place in /docs/screenshots)
Screen
Description
Key Features
public-home.png
Public event listing
Glassmorphism cards, city filter, search bar, "GET TICKETS" CTAs
email-modal.png
Lead capture modal
Email field, explicit consent checkbox, privacy notice, submit button
dashboard-overview.png
Admin dashboard
Statistics cards, filter panel, event table with status badges
preview-panel.png
Event detail sidebar
Full event details, import notes field, import/inactive buttons
stats-overview.png
Statistics page
Category breakdowns, source distribution charts, totals
scrape-logs.png
Scrape activity log
Table with source, status, counts, duration, timestamps
🔄 Scraping Pipeline Deep Dive
How It Works
Hybrid Scraping Strategy:
Phase 1 (Fast): requests + BeautifulSoup parses Eventbrite's hidden JSON-LD structured data
Phase 2 (Fallback): Playwright browser automation with anti-detection scripts if blocked
Event Deduplication:
python
123
Smart Status Management:
new: First-time discovery (hash not in DB)
updated: Critical field changed (title/datetime/venue) since last scrape
inactive: Missing from current scrape + past 12-hour cutoff
imported: Preserved across scrapes unless critical fields change
Scrape Logging:
Every run creates ScrapeLog document with metrics
Tracks: total fetched, new/updated/inactive counts, duration, errors
Visible in admin "Scrape Logs" page
Production Hardening
✅ Exponential backoff retries (3 attempts)
✅ Comprehensive logging with timestamps
✅ Anti-detection headers + Playwright init scripts
✅ MongoDB unique index on eventHash (prevents duplicates)
✅ Timezone handling (Australia/Sydney for display)
✅ Past event protection (only mark inactive if >12 hours old)
🌱 Future Enhancements (Assignment 2 Path)
Phase 1: LLM Recommendation Engine
Store user preferences via /api/preferences endpoint
Vectorize event descriptions using Sentence Transformers
LangChain pipeline for preference matching
WhatsApp/Telegram bot integration (Twilio API)
Notification system for new matching events
Phase 2: Platform Expansion
Add Meetup.com, Facebook Events scrapers
User profiles with saved events
Email notification system (Nodemailer)
Analytics dashboard (lead conversion rates)
Pagination for public event listings
Docker Compose setup for one-command deployment
Phase 3: Advanced Features
Event recommendations based on past imports
Admin notes/comments on events
Bulk import from CSV
Export scrape logs to CSV
Dark mode toggle
Multi-language support (i18n)
🤝 Contributing
Contributions are welcome! Please follow these steps:
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📜 License
Distributed under the MIT License. See LICENSE for details.
🙏 Acknowledgements
Eventbrite for publicly available event data
Google Cloud Platform for OAuth infrastructure
MongoDB Atlas for cloud database hosting
Playwright team for robust browser automation
All open-source contributors to dependencies
Assignment creators for the inspiring challenge!
