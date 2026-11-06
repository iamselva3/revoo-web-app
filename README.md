# REVOO Customer Web App

A modern, responsive, and aesthetic customer-facing web application built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**. It replicates the complete experience and visual identity of the REVOO mobile application across Mobile, Tablet, and Desktop screens.

## Features

- **Home Experience**:
  - Live promotional banner carousel (`/catalogue/banners`)
  - Quick category selector (Phones, Laptops, Tablets, TVs)
  - Interactive Brand grid with crisp logos (`/catalogue/brands`)
  - Certified Refurbished phones showcase with inspection badges
  - 3-Step "How Selling Works" guide
  - Verified customer reviews & ratings (`/catalogue/reviews`)
  - Promotional popup modal (`/catalogue/popup`)

- **Instant Sell / Valuation Flow (`/sell`)**:
  - Step 1: Brand selection
  - Step 2: Model search & selection (with high-res device photos & starting prices)
  - Step 3: Storage variant selection
  - Step 4: 30-second condition diagnostic assessment (Display, Body, Battery, Faults, Accessories)
  - Step 5: Guaranteed instant price calculation (`/catalogue/estimate`) with celebration confetti

- **Doorstep Pickup Booking (`/pickup`)**:
  - India State, City, and Pincode autocomplete (`/geo/states`, `/geo/cities`, `/geo/pincode/:pincode`)
  - Pickup date & time slot scheduling
  - Instant UPI / IMPS bank account details for on-spot payout
  - Live order confirmation and booking reference ID

- **Certified Refurbished Store (`/buy` & `/buy/:id`)**:
  - Catalog with brand filter and search
  - Extended product details view with multi-angle photo gallery carousel
  - 32-point inspection score, battery health percentage, and 12-month warranty badge
  - 1-Click Buy & Cart management

- **Order Tracking & Profile (`/track` & `/profile`)**:
  - Live progress timeline tracker (Placed -> Assigned -> Out for Pickup -> Inspected -> Paid)
  - Customer authentication via instant Mobile OTP or Password
  - Request history and account profile

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

