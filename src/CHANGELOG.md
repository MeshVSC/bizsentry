# Changelog (Summarized Development History)

This changelog provides a high-level overview of the major features and refinements implemented for the StockSentry application during an interactive development process.

## Key Development Phases & Features:

### Initial Setup & Core Inventory Management
*   Initialized as a Next.js project with TypeScript and Tailwind CSS.
*   Implemented core CRUD (Create, Read, Update, Delete) functionality for inventory items.
*   Integrated Supabase for database storage. Items and managed options are stored in Supabase.

### AI Integration & Enhanced Item Data
*   Integrated Genkit (using Google AI plugin) for AI-powered receipt data extraction to pre-fill item forms.
*   Expanded the item data model to include:
    *   SKU, Product URL, Purchase Date, Sold Date, In-Use Date, MSRP.
    *   Category, Subcategory, Storage Location, Bin Location, Room, Vendor, Project.
*   Converted text inputs for categorical fields (Category, Subcategory, Locations, Vendor, Project) to managed dropdown menus.
*   Implemented client-side file size validation for image uploads in forms.

### Item Status Overhaul & UI/UX Improvements
*   Refactored item status from a simple `sold` boolean to a more comprehensive `status: 'in stock' | 'in use' | 'sold'`.
    *   Updated item forms, inventory list tables, and detail pages to reflect and manage these new statuses.
    *   Added controls for quick status updates directly in the inventory list.
*   Implemented bulk actions for inventory items: bulk delete and bulk status update.
*   Introduced pagination and filtering (by name, category) for the inventory list.
*   Refined UI feedback using toast notifications and alert dialogs for various actions.

### Analytics & Dashboard Enhancements
*   Developed a Dashboard page with `StatCard` components for key inventory metrics.
*   Created a detailed Analytics page with charts (using Recharts via ShadCN UI):
    *   Items per Category.
    *   Stock Value Over Time (based on purchase price).
    *   Sales Trends (approximated based on 'sold' status and update times).
    *   Estimated Profit by Category (approximated).
*   Added new `StatCard` metrics to the Analytics page: Total Units (In Stock, In Use, Sold) and Total Value (In Stock, In Use, Sold).

### Settings & Global Data Management
*   Developed a multi-page settings area:
    *   Application settings (e.g., default items per page for inventory).
    *   Management interfaces for dropdown options: Categories, Subcategories, Storage Locations, Bin Locations, Rooms, Vendors, Projects. These options are now global.
*   **Removed User Authentication:** The application no longer has user login, roles, or user-specific data. All data is global.
    *   The login page and user management sections in settings were removed.
    *   Data operations (items, managed options) now use `NULL` for `user_id` in the database (requires `user_id` columns to be nullable).

### UI Theme & Responsiveness
*   Applied a custom modern dark theme with turquoise/neon blue accents throughout the application.
*   Standardized typography using the Montserrat font.
*   Designed and implemented a collapsible sidebar with a responsive logo display.
*   Improved overall mobile responsiveness of the application layout and key components.

### Bulk Data Management
*   Introduced a Bulk CSV Import feature for inventory items.
*   Added functionality to download a CSV template for the bulk import.

### Development & Build Stability
*   Addressed various Next.js build errors, runtime issues, and parsing errors.
*   Refined server action definitions.
*   Updated `revalidatePath` calls for better data consistency across pages after CRUD operations.

---
_This is a summary of major development milestones and does not represent an exhaustive commit-by-commit log. The development process was iterative and conversational._
