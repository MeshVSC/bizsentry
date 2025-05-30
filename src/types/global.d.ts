
// This declaration allows us to extend the globalThis object in Node.js
// for storing in-memory data across HMR updates in development.

// Item store is now in Supabase, so _itemsStore is removed.

// For managed dropdown options (still in-memory for now)
// eslint-disable-next-line no-var
declare var _managedCategoriesStore: string[];
// eslint-disable-next-line no-var
declare var _managedSubcategoriesStore: string[];
// eslint-disable-next-line no-var
declare var _managedStorageLocationsStore: string[];
// eslint-disable-next-line no-var
declare var _managedBinLocationsStore: string[];
// eslint-disable-next-line no-var
declare var _managedRoomsStore: string[];
// eslint-disable-next-line no-var
declare var _managedVendorsStore: string[];
// eslint-disable-next-line no-var
declare var _managedProjectsStore: string[];


// For application settings
// eslint-disable-next-line no-var
declare var _appSettingsStore: import('@/lib/actions/settingsActions').AppSettings;

// For basic user authentication prototype (user "database")
// This _usersStore is for mapping Supabase authenticated users to app-specific roles.
// eslint-disable-next-line no-var
declare var _usersStore: import('@/types/user').User[];


// TODO: Item 5: Password Reset Functionality (Placeholder from user request)
// Discuss and implement password reset functionality.
// Current challenge: No email addresses are stored for users. (Note: Supabase handles this for its auth)

// TODO: Item 7: Consolidating Product Setup Settings (Placeholder from user request)
// Evaluate consolidating all product-related managed options (Category, Subcategory, etc.)
// into a single settings page or a more unified "Product Setup" section.

// TODO: Item 10: Dashboard View Refinement (Placeholder from user request)
// Review and refine the dashboard layout and information displayed
// based on user feedback and evolving needs.

// TODO: Precise Sales Tracking for Profit: (User re-added to active list)
// Implementing a detailed sales transaction log system.

// TODO: More Comprehensive/Advanced Profit/Loss Analytics: (User re-added to active list)
// Additional dedicated charts or tables for profit.

// TODO: Automated and Manual Testing for all modules: (User re-added to active list)
// No automated testing implemented yet.

// TODO: Advanced File Validation (Server-Side): (User re-added to active list)
// Server-side validation for file type and size for uploads.
