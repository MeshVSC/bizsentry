# StockSentry

StockSentry is a modern inventory management tool built with Next.js and Tailwind CSS, developed with the assistance of Firebase Studio's App Prototyper. Designed for speed, simplicity, and clarity, it helps track stock levels, categories, and historical changes efficiently.

**Note:** User authentication and management features have been removed. The application now operates in a global, no-user mode. All data is shared.

---

## ✨ Features

*   📦 Inventory CRUD (Create, Read, Update, Delete items)
*   🏷️ Support for SKU, Product URL, Purchase/Sold/In-Use Dates, MSRP.
*   📝 AI-Powered Receipt Data Extraction for quick item entry (via Genkit).
*   🖼️ Product Image URL association.
*   📊 Dashboard with key inventory statistics.
*   📈 Analytics Page with charts:
    *   Items per Category
    *   Stock Value Over Time
    *   Sales Trends (approximated)
    *   Profit by Category (approximated)
    *   Key metric cards (total units in stock/use/sold, total value in stock/use/sold).
*   📂 Managed Dropdown Options:
    *   Categories, Subcategories, Storage Locations, Bin Locations, Rooms, Vendors, Projects.
    *   Settings pages to manage these options (globally).
*   📤 Bulk CSV Import for items (with template download functionality).
*   🎨 Modern Dark Theme with Turquoise Accents (Montserrat font).
*   📱 Responsive Design for Desktop, Tablet, and Mobile.
*   ⚙️ Collapsible Sidebar navigation.

---

## 🚀 Getting Started

### 1. Clone the repository
(If you've cloned this from a Git repository)
```bash
git clone <your-repository-url>
cd stocksentry
```

### 2. Install dependencies
```bash
npm install
```
(Or `yarn install` if using Yarn)

### 3. Environment Setup (for Genkit AI & Supabase)
*   Genkit is used for AI features (like receipt processing). It's configured to use Google AI by default.
*   Supabase is used as the database.
*   Create a `.env` file in the root of your project (or set environment variables directly).
*   Add your Google AI API key:
    ```
    GOOGLE_API_KEY=your_google_api_key_here
    ```
*   Add your Supabase URL and Anon Key:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
*   **Database Schema Note:** The `items.user_id` and `managed_options.user_id` columns in your Supabase tables should be **nullable** for the current no-user setup to function correctly when creating items or options.
*   **Supabase RLS Note:** If your project uses Supabase Row Level Security, ensure `myapp.current_user_id` (or your configured admin user ID) is set so data operations succeed.

*   To run Genkit flows locally during development (e.g., for testing AI features), you might use:
    ```bash
    npm run genkit:dev
    ```
    or
    ```bash
    npm run genkit:watch
    ```

### 4. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port specified by Next.js/Firebase Studio) with your browser to see the result. The application will load directly into the dashboard.

---

## 📁 Project Structure (Simplified)

```
.
├── public/              # Static assets (e.g., logo.png, logo-icon.png)
├── src/
│   ├── app/             # Next.js App Router (pages, layouts)
│   ├── components/      # Reusable UI components (ShadCN, custom)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Server actions, utility functions, Supabase client
│   ├── types/           # TypeScript type definitions
│   └── ai/              # Genkit AI flows and configuration
├── .env                 # Environment variables (GOOGLE_API_KEY, Supabase)
├── next.config.ts       # Next.js configuration
├── package.json         # Project dependencies and scripts
├── README.md            # This file
└── ...
```

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
