# 🏔️ Indus Tours & Travel — Premium Pakistan Tourism Platform

> A full-featured travel booking platform showcasing Pakistan's most spectacular destinations — from the peaks of Karakoram to the valleys of Kashmir.

## ✨ Key Features

### 🗺️ Tours & Destinations
- **25+ curated tour packages** covering Hunza, Skardu, Fairy Meadows, Swat, Chitral, Kumrat, Neelum Valley, Astore, Khunjerab, Naltar, Murree, Ayubia, Nathia Gali, Islamabad & more
- **Interactive destination map** with live pins, user geolocation & distance calculator
- **Rich tour detail dialogs** with day-by-day itineraries, meal plans, packing lists, altitude data, safety tips & photography spots
- **Tour comparison** side-by-side tool
- **Availability calendar** per tour with slot tracking
- **Wishlist** system for saved tours & destinations

### 🚗 Vehicle Rentals
- Fleet of SUVs, vans & coasters with per-day pricing
- Vehicle detail dialogs with features & specs

### 🏨 Hotels
- Hotel listings with star ratings, amenities & location
- Linked to tour packages for bundled stays

### 💰 Deals & Dynamic Pricing
- Active deal management with promo codes
- Seasonal, group-size & early-bird pricing rules
- Currency toggle (PKR / USD)

### 📝 Booking System
- Full booking flow with traveler details, date selection & price calculation
- Abandoned booking recovery
- Booking management dashboard for users

### 👤 User System
- Email + Google authentication
- User dashboard with booking history, loyalty points & preferences
- Referral program with reward points
- Wishlist management

### 🛡️ Admin Panel
- Complete CMS for tours, destinations, hotels, vehicles, deals
- Blog editor with rich text (Tiptap WYSIWYG)
- Photo gallery management
- Booking & user management
- Analytics dashboards & visitor tracking
- Security monitoring, audit trails & activity logs
- Newsletter & email template management
- SEO & site settings control

### 🤖 AI Chatbot
- Integrated AI assistant for travel queries
- Powered by Lovable AI Gateway

### 📊 Analytics & Tracking
- Visitor fingerprinting & session tracking
- User behavior analytics (scroll, clicks, engagement)
- UTM campaign tracking
- System health monitoring

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript 5 · Vite 5 |
| Styling | Tailwind CSS v3 · shadcn/ui · Framer Motion |
| Backend | Lovable Cloud (Supabase) |
| Maps | Leaflet · React-Leaflet |
| Editor | Tiptap (rich text) |
| Charts | Recharts |
| Auth | Email + Google OAuth |
| AI | Lovable AI Gateway |

## 🚀 Getting Started

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project
cd indus-tours

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
src/
├── assets/          # Tour & destination images
├── components/
│   ├── admin/       # Admin panel modules (30+ components)
│   ├── common/      # Shared widgets (chatbot, weather, newsletter)
│   ├── destinations/# Map & detail dialogs
│   ├── home/        # Landing page sections
│   ├── hotels/      # Hotel components
│   ├── layout/      # Navbar & Footer
│   ├── tours/       # Tour cards, comparison, calendar
│   ├── ui/          # shadcn/ui primitives
│   └── vehicles/    # Vehicle components
├── hooks/           # Custom hooks (auth, currency, theme, tracking)
├── lib/             # Utilities (image mappers, API, logging)
├── pages/           # Route pages (15+ pages)
└── integrations/    # Supabase client & types
supabase/
├── functions/       # Edge functions (booking, AI, tracking, APIs)
└── config.toml      # Project configuration
```

## 🌍 Supported Destinations

| Region | Destinations |
|--------|-------------|
| Gilgit-Baltistan | Hunza Valley, Skardu, Fairy Meadows, Deosai, Astore, Naltar, Khunjerab Pass |
| Khyber Pakhtunkhwa | Swat, Chitral & Kalash, Kumrat Valley, Naran Kaghan, Malam Jabba |
| Azad Kashmir | Neelum Valley, Ratti Gali Lake, Arang Kel |
| Galyat | Murree, Nathia Gali, Ayubia National Park |
| Capital | Islamabad, Taxila (UNESCO Heritage) |

## 📄 License

Private project — all rights reserved.

---

Built with [Lovable](https://lovable.dev) ❤️
