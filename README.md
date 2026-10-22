# CureMedix - Medicine Selling E-commerce Website

![CureMedix-HomePage Screenshot](/src/assets/CureMedix-HomePage.webp)

## Live Project  
🔗 [CureMedix Live](https://cure-medix-by-hafiz-al-shams1917.netlify.app/)

## Overview  
CureMedix is a feature-rich e-commerce platform designed for selling medicines online. It provides an intuitive user interface, secure authentication, a robust admin dashboard, and seamless payment processing using Stripe.

## Technologies Used  
- **Frontend:** React, React Router, React Hook Form, React Icons, Swiper.js, React Responsive Carousel
- **Backend & Database:** Express.js, MongoDB
- **Authentication & Security:** JSON Web Tokens (JWT) stored in `localStorage`
- **State Management & Utilities:** React Query, Axios, Match Sorter, LocalForage
- **Payment Integration:** Stripe
- **UI Enhancements:** SweetAlert2, React Tooltip, HTML2PDF.js

## Key Features  

✅ **Dynamic Navbar with Profile Dropdown:** User-friendly navbar featuring profile dropdown for profile updates, dashboard access, and logout options.  

✅ **Home Page Slider Section:** Dynamic product slides managed by the admin, enhancing the homepage's visual appeal and functionality.  

✅ **Category Cards Navigation:** Interactive category cards that navigate users to detailed medicine lists by category.  

✅ **Discount Products Section:** Draggable card slider for showcasing discounted products using Swiper.js.  

✅ **Signup, Login, and Social Authentication:** Firebase-based authentication with role selection and Google login option.  

✅ **Shop Page with Modals:** Medicine listing in both in tabular & cards format as per user's choice with modals for detailed views and selection functionality.  

✅ **Token‑based Authentication:**  
  - Users sign in/up and receive a JWT, stored securely in `localStorage`  
  - Axios interceptor injects `Authorization: Bearer <token>` on every API call  
  - Supports role‑based access (user vs. admin) on protected routes.  

✅ **Cart Functionality:** Users can add medicines to the cart, view details, and remove specific items before checkout.  

✅ **Admin Dashboard - User Management:** Admins can promote/demote users and manage roles dynamically.  

✅ **Admin Dashboard - Category Management:** Admins can add, update, and delete categories with smooth CRUD functionality and a clean UI.  

✅ **Checkout with Stripe Integration:** Secure Stripe payment integration for seamless checkout leading to an invoice page.

✅ **Theme Toggle (Dark/Light):**  
  - Seamless, global dark‑and‑light mode switch  
  - Saves user preference in `localStorage`

---

## 🆕 Recent Enhancements

### ✨ Homepage Improvements
- **Newsletter Subscription:** Improved form design for easier email sign-up.
- **Footer & App Promotion:** Redesigned for consistency and mobile responsiveness.

### 🔧 Feature Updates & Fixes
- **Online Doctor Page:** Converted from static demo to a fully functional dynamic page.
- **Top Categories:** Updated visuals and made fully responsive across all devices.
- **Shop Page:** Redesigned product cards with clean UI and fixed layout bugs.
- **Category Details Page:** Upgraded with a cleaner, more user-friendly grid layout.

### 🛠️ Backend & Banner Advertisement System
- Built full API support (GET, POST, Secured PATCH/DELETE) for banner ads.
- **Admin Dashboard:** "Manage Banner Advertisement" section to control homepage slides.
- **Seller Dashboard:** Request form for sellers to submit products for banner ads.
- **Dynamic Homepage Slider:** Automatically displays slides configured by admin.

---

## 🧪 Default Test Credentials

Use the credentials below to explore the platform in different roles:

| Role   | Email                            | Password      |
|--------|----------------------------------|---------------|
| User   | hafizalshams10115@gmail.com      | asKuseR&1011  |
| Seller | hafizalshams1011@gmail.com       | 12Sw##        |

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
   git clone https://github.com/Hafiz-Al-Shams/CureMedix-client.git
   cd CureMedix-client
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

## Additional Resources  
- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)

---

🚀 **Developed by Hafiz Al Shams**
