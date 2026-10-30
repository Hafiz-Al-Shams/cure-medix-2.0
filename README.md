# CureMedix - Medicine Selling E-commerce Website

![CureMedix-HomePage Screenshot](/src/assets/CureMedix-HomePage.webp)

## Live Project  
🔗 [CureMedix Live](https://cure-medix.vercel.app/)

## Overview  
CureMedix is a feature-rich web application for buying medicines online and booking online doctor consultations. It combines a public storefront with authenticated customer features and separate role-based dashboards for customers, sellers, and administrators. It provides an intuitive, fully responsive user interface with light/dark themes, secure authentication, and seamless payment processing using Stripe.

This repository is the **frontend application**, built with React and Vite. It connects to a separately hosted API (`https://cure-medix-server.vercel.app/`) for data and server-side operations.

## Technologies Used  
- **Frontend:** React, Vite, React Router, React Hook Form, React Icons, Swiper.js, React Responsive Carousel
- **Styling:** Tailwind CSS, DaisyUI
- **Backend & Database:** Express.js, MongoDB (separately hosted API)
- **Authentication & Security:** Firebase Authentication, JSON Web Tokens (JWT) stored in `localStorage`
- **State Management & Utilities:** React Query, Axios, React Helmet Async, Match Sorter, LocalForage
- **Payment Integration:** Stripe Elements
- **UI Enhancements:** SweetAlert2, React Tooltip, HTML2PDF.js

## Key Features  

✅ **Dynamic Navbar with Profile Dropdown:** User-friendly navbar featuring role-aware dashboard links, profile dropdown for profile updates, dashboard access, and logout options.  

✅ **Home Page Sections:** A complete storefront home page with an admin-managed banner slider, prescription call-to-action, category cards, discounted products, commitments, testimonials, articles, FAQ, and product qualities.  

✅ **Category Cards Navigation:** Interactive category cards that navigate users to detailed medicine lists by category.  

✅ **Discount Products Section:** Draggable card slider for showcasing discounted products using Swiper.js.  

✅ **Signup, Login, and Social Authentication:** Firebase-based authentication with email/password registration, role selection, Google login option, and a password-reset email flow.  

✅ **Profile Management:** Signed-in users can update their profile information from a dedicated profile page.  

✅ **Shop Page with Modals:** Medicine listing in both card & list formats as per user's choice, with search by name or type, type filter chips, sorting by name or price, pagination with adjustable items per page, and a details popup with quantity selection.  

✅ **Category Details Page:** Dedicated page for each category (Tablet, Capsule, Injection, Inhaler, Syrup) with category switching pills, product cards, loading skeletons, and the same details popup as the shop.  

✅ **Token‑based Authentication:**  
  - Users sign in/up and receive a JWT, stored securely in `localStorage`  
  - Axios interceptor injects `Authorization: Bearer <token>` on every API call  
  - Supports role‑based access (user, seller, and admin) on protected routes.  

✅ **Cart Functionality:** Users can add medicines to the cart with a chosen quantity, view details, adjust quantities, remove specific items, or clear the cart before checkout.  

✅ **Checkout with Stripe Integration:** Secure Stripe payment integration for medicine orders and consultation fees, leading to a printable invoice page.

✅ **Payment History:** Customers can review past payment records and search by transaction.  

✅ **Online Doctor Consultations:** Browse doctors loaded from the database, filter by specialty, pick an available date and time slot, enter patient details, and pay the consultation fee through Stripe. Already-booked slots are disabled and re-checked before charging.  

✅ **Appointment Management:**  
  - Customers can review their bookings in **My Appointments**  
  - Admins can search, filter, confirm, or cancel bookings in **Manage Appointments**  

✅ **Customer Dashboard:** Sidebar-based dashboard with User Home summary, cart, payment history, and appointments.  

✅ **Seller Dashboard:**  
  - **Seller Home** with sales, pending revenue, medicine, and banner metrics, plus a sales report that can be exported as a CSV file  
  - **Manage Medicines** to search, add, update, and delete listings (with image upload, category, price, stock, company, unit, and discount details)  
  - **Request Banner** to submit promotional banner requests and track approval status  

✅ **Admin Dashboard - User Management:** Admins can search users, promote/demote them between user, seller, and admin roles, and delete accounts.  

✅ **Admin Dashboard - Category Management:** Admins can add, update, and delete categories with smooth CRUD functionality and a clean UI.  

✅ **Admin Dashboard - Payments & Banners:** Admins can review and accept payments, and approve, unpublish, or delete seller banner requests from the Admin Home.  

✅ **Theme Toggle (Dark/Light):**  
  - Seamless, global dark‑and‑light mode switch (also available inside the dashboard)  
  - Saves user preference in `localStorage`  
  - All pages, modals, and popups adapt to the selected theme  

✅ **Responsive Design:** Fully responsive layouts for mobile, tablet, and desktop, including a slide-in sidebar drawer in the dashboard.  

✅ **Smooth Navigation UX:**  
  - **Back to Top button:** A floating, icon-only button with a scroll-progress ring on the Home, Shop, Online Doctor, and Category Details pages  
  - **Scroll to top on navigation:** Every new main-site and dashboard page opens from the top  

✅ **Polished Feedback & Dialogs:** Form validation, loading states, empty states, and themed SweetAlert2 confirmation and notification dialogs.  

---

## 🆕 Recent Enhancements

### ✨ Homepage Improvements
- **New Homepage Layout:** Redesigned sections (prescription CTA, commitments, testimonials, articles, FAQ, qualities) that each own their full-width background and follow the new design top to bottom.
- **Footer & Navigation:** Redesigned for consistency and mobile responsiveness.
- **Typography:** Switched to the clean geometric *Plus Jakarta Sans* font site-wide.

### 🔧 Feature Updates & Fixes
- **Online Doctor Page:** Converted from static demo to a fully functional dynamic page with database-driven doctors, live slot availability, a two-step booking popup, and Stripe checkout.
- **Appointments:** Added *My Appointments* for customers and *Manage Appointments* for admins.
- **Top Categories:** Updated visuals and made fully responsive across all devices.
- **Shop Page:** Redesigned with card/list views, filter chips, a new details popup with quantity selection, and fixed layout bugs.
- **Category Details Page:** Upgraded to the same card and popup design as the shop, with a cleaner grid layout and category pills.
- **Dashboard Redesign:** New sidebar layout with role-based navigation, mobile drawer, and a built-in theme toggle.
- **Seller Analytics:** Seller Home now shows real seller-specific sales data with CSV export.
- **Back to Top & Scroll Reset:** Added a floating back-to-top button and automatic scroll-to-top on every new page.
- **Forgot Password Flow:** Added a dedicated password-reset page.

### 🛠️ Backend & Banner Advertisement System
- Built full API support (GET, POST, Secured PATCH/DELETE) for banner ads.
- **Admin Dashboard:** "Manage Banner Advertisement" section to control homepage slides.
- **Seller Dashboard:** Request form for sellers to submit products for banner ads.
- **Dynamic Homepage Slider:** Automatically displays slides configured by admin.

---

## Dependencies  
The following dependencies are used in the project:  

```json
{
  "@stripe/react-stripe-js": "^3.1.1",
  "@stripe/stripe-js": "^5.5.0",
  "@tanstack/react-query": "^5.64.2",
  "axios": "^1.7.9",
  "firebase": "^11.1.0",
  "html2pdf.js": "^0.9.0",
  "localforage": "^1.10.0",
  "match-sorter": "^8.0.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-helmet-async": "^2.0.5",
  "react-hook-form": "^7.54.2",
  "react-icons": "^5.4.0",
  "react-responsive-carousel": "^3.2.23",
  "react-router-dom": "^7.1.1",
  "react-tooltip": "^5.28.0",
  "sort-by": "^1.2.0",
  "sweetalert2": "^11.15.10",
  "swiper": "^11.2.1"
}
```

## Installation & Running Locally  
Follow these steps to run the project locally:

1. **Clone the repository:**  
   ```sh
   git clone https://github.com/Hafiz-Al-Shams/cure-medix-2.0.git
   cd cure-medix-2.0
   ```

2. **Install dependencies:**  
   ```sh
   npm install
   ```

3. **Set up environment variables:**  
   Create a `.env.local` file in the root directory and add the following variables:

   ```sh
   VITE_apiKey=YOUR_FIREBASE_API_KEY
   VITE_authDomain=YOUR_FIREBASE_AUTH_DOMAIN
   VITE_projectId=YOUR_FIREBASE_PROJECT_ID
   VITE_storageBucket=YOUR_FIREBASE_STORAGE_BUCKET
   VITE_messagingSenderId=YOUR_FIREBASE_MESSAGING_SENDER_ID
   VITE_appId=YOUR_FIREBASE_APP_ID
   VITE_IMAGE_HOSTING_KEY=YOUR_IMAGE_HOSTING_KEY
   VITE_Payment_Gateway_PK=YOUR_STRIPE_PUBLIC_KEY
   ```

4. **Start the development server:**  
   ```sh
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser to see the app in action.

> **Note:** This repository contains only the frontend. Features that depend on medicines, carts, payments, user roles, banners, doctors, and appointments require the connected CureMedix API (`https://cure-medix-server.vercel.app/`) to be available. The e-prescription and sick-note section on the Online Doctor page is a sample UI only, not a real medical service.

## Additional Resources  
- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)

---

🚀 **Developed by Hafiz Al Shams**