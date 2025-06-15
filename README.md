# StockSentry

StockSentry is a modern inventory management tool built with Next.js and Tailwind CSS, developed with the assistance of Firebase Studio's App Prototyper. Designed for speed, simplicity, and clarity, it helps track stock levels, categories, and historical changes efficiently.

**Note:** User authentication and management features have been removed. The application now operates in a global, no-user mode. All data is shared.

---

## ✨ Features

### Core Inventory Management
*   📦 **Full CRUD Operations** - Create, Read, Update, Delete inventory items
*   🏷️ **Comprehensive Item Data** - SKU, Product URL, Purchase/Sold/In-Use Dates, MSRP
*   📝 **AI-Powered Receipt Extraction** - Quick item entry via Genkit AI flows
*   🖼️ **Product Image Association** - Link images to inventory items
*   📊 **Real-time Dashboard** - Key inventory statistics and metrics

### Analytics & Reporting
*   📈 **Advanced Analytics** with interactive charts:
    *   Items per Category breakdown
    *   Stock Value Over Time trends
    *   Sales Trends (approximated)
    *   Profit by Category analysis
    *   Key metric cards (total units in stock/use/sold, total value calculations)

### Data Management
*   📂 **Managed Dropdown Options**:
    *   Categories, Subcategories, Storage Locations, Bin Locations
    *   Rooms, Vendors, Projects with dedicated settings pages
*   📤 **Bulk CSV Import** - Mass import with downloadable template
*   🔍 **Advanced Search** - Real-time search across all item fields (name, description, category, status, vendor)

### User Experience & Interface
*   🎨 **Modern Glass Morphism Design** - Stunning glass card effects with backdrop blur and subtle borders
*   📱 **Fully Responsive** - Mobile-first design optimized for all screen sizes
*   ⚙️ **Smart Sidebar** - Collapsible navigation with custom logo support and smooth animations
*   ⚡ **Enhanced Performance**:
    *   Skeleton loading screens with subtle animations
    *   Optimized image handling and component rendering
    *   Backdrop blur effects and modern glassmorphism
*   🎯 **Quick Actions**:
    *   Gradient floating action button with hover scaling
    *   Comprehensive keyboard shortcuts for power users
    *   Modern search with real-time filtering
    *   Batch operations with multi-select functionality
*   🎭 **Polished UI Elements**:
    *   Glass morphism cards with hover effects and scaling animations
    *   Interactive analytics charts with dotted backgrounds and glowing line connections
    *   Green glass morphism save buttons with glowing effects
    *   Red glass morphism delete buttons for batch operations
    *   Sticky action cards that follow scroll for better UX
    *   Toast notifications for seamless user feedback

### Keyboard Shortcuts & Accessibility
*   ⌨️ **Keyboard Navigation**:
    *   `Ctrl/Cmd + N` - Quick new item creation
    *   `Ctrl/Cmd + K` - Focus search bar
    *   `Esc` - Navigate back
    *   `H` - Go to dashboard
    *   `I` - Go to inventory
*   ♿ **Accessibility Features** - Screen reader support, keyboard navigation, proper ARIA labels

---

## 🚀 Deployment History & Recent Improvements

### Latest Deployment - June 2025
#### 🎨 Glass Morphism Design System
*   ✨ **Complete UI Overhaul** - Full glass morphism design implementation across all pages
*   🎯 **Modern Analytics Charts** - Interactive charts with dotted backgrounds and bright blue glowing line connections
*   💚 **Green Save Button System** - Glass morphism save buttons with green glow effects throughout the app
*   🔴 **Batch Delete Functionality** - Red glass morphism delete buttons with multi-select capabilities
*   📌 **Sticky Action Cards** - Actions follow scroll for improved user experience during form editing
*   🏢 **Settings Pages Redesign** - All settings pages updated with consistent glass card styling

#### 🔧 Performance & UX Enhancements
*   🔍 **Enhanced Search & Filtering** - Improved inventory search with better performance
*   📊 **Chart Improvements** - Fixed analytics chart overflow issues and improved data visualization
*   ⚡ **Optimized Loading States** - Smoother loading animations and better skeleton screens
*   🎭 **Refined Animations** - Hover effects, scaling, and transition improvements throughout

### Previous Improvements (2024)

#### UI/UX Enhancements
*   ✨ **Skeleton Loading States** - Smooth loading experience with animated placeholders
*   🎯 **Modern Floating Action Button** - Gradient design with hover effects and scaling animations
*   🖼️ **Enhanced Empty States** - Beautiful gradient illustrations with refined typography
*   🎨 **Custom Logo Support** - Client logo integration in collapsible sidebar
*   📱 **Improved Mobile Experience** - Better responsive design and touch interactions
*   🎭 **Modern Card Design** - React Bites/21dev inspired layouts with subtle borders and hover effects
*   🌟 **Refined Visual Hierarchy** - Better spacing, typography, and component relationships

#### Performance & User Experience
*   🔍 **Real-time Search** - Instant filtering across all inventory fields
*   ⌨️ **Keyboard Shortcuts** - Power user navigation and quick actions
*   🔔 **Toast Notifications** - System-wide feedback for user actions
*   🎭 **Polished Animations** - Smooth transitions and micro-interactions
*   ⚡ **Optimized Loading** - Faster page loads with improved caching

#### Developer Experience
*   🛠️ **Next.js 15 Compatibility** - Full upgrade with latest features
*   🎯 **TypeScript Improvements** - Better type safety and error handling
*   🧩 **Component Architecture** - Modular, reusable component system
*   📁 **Improved Code Organization** - Better file structure and separation of concerns
*   🔧 **Deployment Ready** - Fixed ESLint errors and improved build process

---

## 🚀 Getting Started

### 1. Clone the repository
(If you've cloned this from a Git repository)
```bash
git clone <your-repository-url>
cd studio
```

### 2. Install dependencies
```bash
npm install
```
(Or `yarn install` if using Yarn)
Make sure to install dependencies before running any type checks so packages
like `@types/node` are available.

### 3. Lint and type-check
After installing dependencies you can verify code style and TypeScript types:
```bash
npm run lint
npm run typecheck
```

### 4. Environment Setup (for Genkit AI & Supabase)
*   Genkit is used for AI features (like receipt processing). It's configured to use Google AI by default.
*   Supabase is used as the database.
*   Create a `.env` file in the root of your project (or set environment variables directly). A sample `.env` is included for reference; replace the example values with your own keys and avoid committing real secrets.
*   Add your Google AI API key:
    ```
    GOOGLE_API_KEY=your_google_api_key_here
    ```
*   Add your Supabase URL and Anon Key:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
*   Update the `ADMIN_USER_ID` constant in `src/lib/actions/itemActions.ts` to match the ID of an existing admin user in your Supabase project.
*   **Database Schema Note:** The `items.user_id` and `managed_options.user_id` columns in your Supabase tables should be **nullable** for the current no-user setup to function correctly when creating items or options.
*   **Supabase RLS Note:** If your project uses Supabase Row Level Security (RLS), the policies rely on a session variable named `myapp.current_user_id`.
    Set this variable for each database connection (often to the admin user ID) before performing queries:

    ```sql
    -- Example: run after connecting via psql or inside a Supabase function
    select set_config('myapp.current_user_id', '<ADMIN_USER_UUID>', false);
    ```


    RLS policies on the `items`, `managed_options`, and `audit_log` tables check
    `current_setting('myapp.current_user_id')` to permit or deny access.

*   To run Genkit flows locally during development (e.g., for testing AI features), you might use:
    ```bash
    npm run genkit:dev
    ```
    or
    ```bash
    npm run genkit:watch
    ```

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port specified by Next.js/Firebase Studio) with your browser to see the result. The application will load directly into the dashboard.

### Confirm sidebar persistence
1. Start the development server and open the app in your browser.
2. Collapse the sidebar using the toggle button (or `Cmd/Ctrl + b`).
3. Reload the page.
4. The sidebar should remain in the same state after the reload.

---

## 📁 Project Structure

```
.
├── public/              # Static assets (logos, icons, images)
│   ├── logo-icon.png    # Standard app icon
│   └── logo-icon-custom.png  # Client custom logo
├── src/
│   ├── app/             # Next.js App Router (pages, layouts)
│   │   ├── (app)/       # Protected app routes
│   │   │   ├── dashboard/
│   │   │   ├── inventory/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   └── layout.tsx   # Root layout with toast system
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # ShadCN base components + custom UI
│   │   │   ├── skeleton.tsx        # Loading placeholders
│   │   │   ├── floating-action-button.tsx  # Quick action FAB
│   │   │   └── toaster.tsx         # Toast notification system
│   │   ├── layout/      # Layout components
│   │   │   ├── AppLayout.tsx       # Main app layout with sidebar
│   │   │   └── SidebarNav.tsx      # Navigation component
│   │   ├── inventory/   # Inventory-specific components
│   │   │   ├── SearchableInventoryList.tsx  # Search + item display
│   │   │   ├── InventorySearch.tsx          # Search input component
│   │   │   └── InventoryLoadingSkeleton.tsx # Loading state
│   │   └── shared/      # Shared components across pages
│   ├── hooks/           # Custom React hooks
│   │   └── use-keyboard-shortcuts.ts  # Global keyboard navigation
│   ├── lib/             # Server actions, utilities, database
│   │   ├── actions/     # Server actions for data operations
│   │   └── supabase/    # Database client and utilities
│   ├── types/           # TypeScript type definitions
│   └── ai/              # Genkit AI flows and configuration
├── .env                 # Environment variables
├── next.config.ts       # Next.js configuration
├── package.json         # Dependencies and scripts
└── README.md            # This documentation
```


### Key Components

#### Layout & Navigation
- **AppLayout** (`src/components/layout/AppLayout.tsx`) - Main application layout with collapsible sidebar
- **SidebarNav** (`src/components/layout/SidebarNav.tsx`) - Navigation menu with active state management
- **FloatingActionButton** (`src/components/ui/floating-action-button.tsx`) - Quick action button for adding items

#### Inventory Management
- **SearchableInventoryList** (`src/components/inventory/SearchableInventoryList.tsx`) - Main inventory display with real-time search
- **InventorySearch** (`src/components/inventory/InventorySearch.tsx`) - Search input with clear functionality
- **InventoryLoadingSkeleton** (`src/components/inventory/InventoryLoadingSkeleton.tsx`) - Loading state animations

#### UI Components
- **Skeleton** (`src/components/ui/skeleton.tsx`) - Animated loading placeholders
- **Toaster** (`src/components/ui/toaster.tsx`) - Toast notification system
- **ShadCN UI Components** - Button, Card, Input, Dialog, and other base components

### Pages & Features

#### Main Application Pages
- **Dashboard** (`src/app/(app)/dashboard/page.tsx`) - Overview with key metrics and statistics
- **Inventory** (`src/app/(app)/inventory/page.tsx`) - Main inventory management with search and CRUD operations
- **Analytics** (`src/app/(app)/analytics/page.tsx`) - Charts and reporting dashboard
- **Settings** (`src/app/(app)/settings/`) - Application configuration and managed options

#### Enhanced Inventory Features
- **Real-time Search** - Filter items by name, description, category, status, or vendor
- **Skeleton Loading** - Smooth loading experience with animated placeholders
- **Empty States** - Beautiful illustrations when no items exist
- **Quick Actions** - Floating action button accessible from any page
- **Keyboard Navigation** - Power user shortcuts for rapid navigation

### Libraries & Hooks

#### Custom Hooks
- **useKeyboardShortcuts** (`src/hooks/use-keyboard-shortcuts.ts`) - Global keyboard navigation system
- **useToast** (`src/hooks/use-toast.ts`) - Toast notification management

#### Core Libraries
- **Server Actions** (`src/lib/actions/`) - Database operations and business logic
- **Supabase Client** (`src/lib/supabase/`) - Database connection and utilities
- **Type Definitions** (`src/types/`) - TypeScript interfaces for type safety

### Environment Variables
Ensure the following environment variables are set in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
---

## 🔧 Technical Highlights

### Performance Optimizations
- **Server Components** - Leveraging Next.js 15 for optimal performance
- **Suspense Boundaries** - Smooth loading with skeleton states
- **Client-side Search** - Real-time filtering without server requests
- **Optimized Images** - Proper image handling with Next.js Image component

### Developer Experience
- **TypeScript** - Full type safety with strict mode enabled
- **Component Architecture** - Modular, reusable component system
- **Custom Hooks** - Encapsulated logic for keyboard shortcuts and notifications
- **Consistent Styling** - Tailwind CSS with design system approach

### User Experience Features
- **Responsive Design** - Mobile-first approach with desktop enhancements
- **Accessibility** - Keyboard navigation and screen reader support
- **Progressive Enhancement** - Works without JavaScript for core functions
- **Smooth Animations** - CSS transitions and loading states

---

## 🧠 Tech Stack

*   [Next.js](https://nextjs.org/) (App Router, Server Components, Server Actions)
*   [React](https://react.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [ShadCN UI](https://ui.shadcn.com/) (Component Library)
*   [Lucide React](https://lucide.dev/) (Icons)
*   [Recharts](https://recharts.org/) (for charts, via ShadCN UI)
*   [Genkit (by Firebase)](https://firebase.google.com/docs/genkit) (for AI features, using Google AI plugin)
*   [Zod](https://zod.dev/) (Schema validation for forms)
*   [Supabase](https://supabase.com/) (PostgreSQL Database)

---

## 📜 License

This project is licensed under a **custom license** as defined in `LICENSE.txt`.
You are free to use and modify the code for personal or internal business use.
**Resale or redistribution of the software, in part or whole, is strictly prohibited.**
For commercial inquiries, contact [stephcolors@hotmail.com](mailto:stephcolors@hotmail.com).

---

## 🙋‍♂️ Support & Contact

For questions, feedback, or commercial inquiries regarding StockSentry:
📧 [stephcolors@hotmail.com](mailto:stephcolors@hotmail.com)
