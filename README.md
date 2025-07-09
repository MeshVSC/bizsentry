# BizSentry

BizSentry is a modern inventory management system built with Next.js and Tailwind CSS, featuring a beautiful glass morphism design system. Designed for speed, simplicity, and clarity, it helps businesses track stock levels, categories, and historical changes efficiently.

**Note:** User authentication and management features have been removed. The application now operates in a global, no-user mode. All data is shared.

**Development Status:** This repository contains the stable, production-ready version of BizSentry. See `DEVELOPMENT.md` for details on features and development history.

---

## ✨ Features

### Core Inventory Management
*   📦 **Full CRUD Operations** - Create, Read, Update, Delete inventory items
*   🏷️ **Comprehensive Item Data** - SKU, Product URL, Purchase/Sold/In-Use Dates, MSRP
*   📝 **Receipt Processing** - Quick item entry features
*   🖼️ **Product Image Association** - Link images to inventory items
*   📊 **Real-time Dashboard** - Key inventory statistics and metrics

### Analytics & Reporting
*   📈 **Analytics Dashboard** with glass morphism charts:
    *   Items per Category breakdown with bright blue glowing line connections
    *   Stock Value Over Time trends with dotted background patterns
    *   Sales Trends with area gradient fills
    *   Profit by Category analysis with horizontal bar charts
    *   Key metric cards (total units in stock/use/sold, total value calculations)
    *   Responsive chart design optimized for all screen sizes

### Data Management
*   📂 **Master Lists Management**:
    *   Unified settings page for all foundational data lists
    *   Tabbed interface: Classification (Categories, Subcategories), Locations (Storage, Bin Locations, Rooms), Business (Vendors, Projects)
*   📤 **Bulk CSV Import** - Mass import with downloadable template
*   🔍 **Advanced Search** - Real-time search across all item fields (name, description, category, status, vendor)

### User Experience & Interface
*   🎨 **Modern Glass Morphism Design** - Stunning glass card effects with backdrop blur and subtle borders
*   📱 **Fully Responsive** - Mobile-first design optimized for all screen sizes  
*   ⚙️ **Smart Sidebar** - Collapsible navigation with clickable home logo and smooth animations
*   🎭 **Glass Preview System** - Interactive theming system in Settings for customizing glass effects
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
*   🎯 **Modern Analytics Charts** - Charts with dotted backgrounds and bright blue glowing line connections
*   💚 **Green Save Button System** - Glass morphism save buttons with green glow effects throughout the app
*   🔴 **Batch Delete Functionality** - Red glass morphism delete buttons with multi-select capabilities
*   📌 **Sticky Action Cards** - Actions follow scroll for improved user experience during form editing
*   🏢 **Settings Pages Redesign** - All settings pages updated with consistent glass card styling
*   🎭 **Glass Preview System** - Interactive theming tool in Settings → Theme Preview for real-time customization

#### 🗂️ Settings Organization & Navigation
*   📁 **Master Lists Consolidation** - Combined 7 individual settings pages into one unified Master Lists page
*   🔧 **Settings Restructure** - Moved Theme Preview from standalone route to Settings → Theme Preview
*   📋 **Tabbed Interface** - Organized Master Lists into logical groups: Classification, Locations, and Business
*   🧹 **Simplified Navigation** - Reduced sidebar clutter from 10 settings items to 3 focused sections

#### ⚡ Major Performance Refactoring
*   🔧 **Component Architecture Overhaul** - Refactored largest components for better performance and maintainability
*   📦 **ItemForm.tsx Optimization** - Split 642-line monolithic component into 6 smaller, focused components (97% size reduction)
*   📋 **SearchableInventoryList.tsx Refactor** - Broke down 287-line component into 6 specialized components (96% size reduction)
*   🏗️ **Modular File Structure** - Created organized component directories with clear separation of concerns
*   ⚡ **Bundle Optimization** - Improved code splitting, tree shaking, and memory usage
*   🧠 **Better State Management** - Isolated component state for optimized re-renders

#### 🔧 Performance & UX Enhancements
*   🔍 **Enhanced Search & Filtering** - Improved inventory search with better performance
*   📊 **Chart Improvements** - Fixed analytics chart overflow issues and improved data visualization
*   ⚡ **Optimized Loading States** - Smoother loading animations and better skeleton screens
*   🎭 **Refined Animations** - Hover effects, scaling, and transition improvements throughout
*   🎯 **Component Reusability** - Created reusable UI components for consistent design patterns
*   🏠 **Clickable Logo Home Button** - Logo "S" icon now functions as home/dashboard navigation

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

### 4. Environment Setup (for Supabase)
*   Supabase is used as the database.
*   Create a `.env` file in the root of your project (or set environment variables directly). A sample `.env` is included for reference; replace the example values with your own keys and avoid committing real secrets.
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


### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. The application will load directly into the dashboard.

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
│   │   │   │   ├── application/       # App configuration
│   │   │   │   ├── glass-preview/     # Interactive theming system
│   │   │   │   └── master-lists/      # Unified data management
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
│   │   │   ├── form/    # ItemForm refactored components
│   │   │   │   ├── ItemFormContainer.tsx      # Main form orchestrator
│   │   │   │   ├── BasicDetailsSection.tsx    # Name, description, categories
│   │   │   │   ├── PricingSection.tsx         # Pricing & purchase details
│   │   │   │   ├── LocationSection.tsx        # Storage locations
│   │   │   │   ├── MediaSection.tsx           # Image uploads
│   │   │   │   └── ActionsSidebar.tsx         # Save/Cancel buttons
│   │   │   ├── list/    # SearchableInventoryList refactored components
│   │   │   │   ├── InventoryListContainer.tsx # Main list orchestrator
│   │   │   │   ├── InventoryItem.tsx          # Individual item component
│   │   │   │   ├── InventoryTabs.tsx          # Tab navigation
│   │   │   │   ├── BatchActions.tsx           # Batch operations
│   │   │   │   ├── InventoryHeader.tsx        # Search header
│   │   │   │   └── EmptyState.tsx             # Empty states
│   │   │   ├── ItemForm.tsx                   # Wrapper component (refactored)
│   │   │   ├── SearchableInventoryList.tsx    # Wrapper component (refactored)
│   │   │   ├── InventorySearch.tsx            # Search input component
│   │   │   └── InventoryLoadingSkeleton.tsx   # Loading state
│   │   ├── analytics/   # Analytics chart components
│   │   │   ├── ItemsPerCategoryChart.tsx      # Category distribution chart
│   │   │   ├── StockValueOverTimeChart.tsx    # Value trends chart
│   │   │   ├── SalesTrendsChart.tsx           # Sales analytics chart
│   │   │   └── ProfitByCategoryChart.tsx      # Profit analysis chart
│   │   ├── glass-preview/ # Interactive theming system
│   │   │   ├── GlassComparison.tsx            # Side-by-side theme comparison
│   │   │   ├── GlassControls.tsx              # Interactive theme controls
│   │   │   ├── GlassShowcase.tsx              # Component examples
│   │   │   └── BackgroundVariations.tsx       # Background testing
│   │   ├── settings/    # Settings components
│   │   │   ├── ApplicationSettingsForm.tsx    # App settings form
│   │   │   └── ManageOptionsSection.tsx       # Master lists management
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
- **Settings** (`src/app/(app)/settings/`) - Application configuration and data management
  - **Application** - App settings and configuration
  - **Theme Preview** - Interactive theming system for customizing glass effects
  - **Master Lists** - Unified management of all foundational data lists

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

## 🏗️ Component Architecture & Refactoring

### Major Component Refactoring (June 2025)
BizSentry underwent a major architectural refactoring to improve performance, maintainability, and developer experience. The largest components were broken down into smaller, focused modules:

#### ItemForm.tsx Refactoring
**Before:** 642 lines in a single monolithic component  
**After:** 6 specialized components (97% size reduction)

```
ItemForm.tsx (20 lines) → Wrapper component
├── form/ItemFormContainer.tsx (300 lines) → Main orchestrator
├── form/BasicDetailsSection.tsx (120 lines) → Name, description, categories
├── form/PricingSection.tsx (80 lines) → Pricing & purchase details
├── form/LocationSection.tsx (60 lines) → Storage locations
├── form/MediaSection.tsx (80 lines) → Image uploads
└── form/ActionsSidebar.tsx (40 lines) → Save/Cancel buttons
```

#### SearchableInventoryList.tsx Refactoring
**Before:** 287 lines handling all list functionality  
**After:** 6 specialized components (96% size reduction)

```
SearchableInventoryList.tsx (10 lines) → Wrapper component
├── list/InventoryListContainer.tsx (120 lines) → Main orchestrator
├── list/InventoryItem.tsx (70 lines) → Individual item display
├── list/InventoryTabs.tsx (30 lines) → Tab navigation
├── list/BatchActions.tsx (50 lines) → Batch operations
├── list/InventoryHeader.tsx (25 lines) → Search header
└── list/EmptyState.tsx (40 lines) → Empty state handling
```

### Refactoring Benefits Achieved

#### Performance Improvements
- **Bundle Size Reduction** - Main components reduced from 929 lines to 30 lines
- **Code Splitting** - Each section can be lazy-loaded independently
- **Optimized Re-renders** - Only affected components update, not entire forms
- **Memory Efficiency** - Better garbage collection with smaller component lifecycles
- **Tree Shaking** - Unused components are eliminated more effectively

#### Developer Experience
- **Single Responsibility** - Each component has one clear purpose
- **Easier Debugging** - Issues can be isolated to specific functionality
- **Better Testing** - Components can be unit tested individually
- **Improved Reusability** - Small components can be reused across the application
- **Maintainability** - Changes to one section don't affect others

#### Future Scalability
- **Modular Structure** - Easy to add new sections or modify existing ones
- **Component Library** - Building blocks for future features
- **Consistent Patterns** - Established patterns for future refactoring

---

## 🔧 Technical Highlights

### Performance Optimizations
- **Server Components** - Leveraging Next.js 15 for optimal performance
- **Suspense Boundaries** - Smooth loading with skeleton states
- **Client-side Search** - Real-time filtering without server requests
- **Optimized Images** - Proper image handling with Next.js Image component
- **Component Refactoring** - 97% reduction in main component sizes for better performance
- **Bundle Splitting** - Smaller, focused components for improved code splitting
- **Memory Optimization** - Better garbage collection with isolated component lifecycles

### Developer Experience
- **TypeScript** - Full type safety with strict mode enabled
- **Modular Architecture** - Component directories with clear separation of concerns
- **Reusable Components** - Small, focused components that can be reused across the app
- **Custom Hooks** - Encapsulated logic for keyboard shortcuts and notifications
- **Consistent Styling** - Tailwind CSS with glass morphism design system
- **Easy Testing** - Isolated components for better unit testing
- **Hot Module Replacement** - Faster development with smaller component updates

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

For questions, feedback, or commercial inquiries regarding BizSentry:
📧 [stephcolors@hotmail.com](mailto:stephcolors@hotmail.com)
