
// This declaration allows us to extend the globalThis object in Node.js
// for storing in-memory data across HMR updates in development.

// Item store is now in Supabase, _itemsStore is removed.

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


// TODO: Item 5 (from user request): Password Reset Functionality
// Implement password reset functionality. This will require a mechanism for users
// to securely verify their identity (e.g., email verification, security questions if desired,
// or admin-initiated reset). Current system uses Supabase auth which handles this.
// We need a UI flow if we want to trigger it from within the app.

// TODO: Item 7 (from user request): Consolidating Product Setup Settings
// Evaluate consolidating all product-related managed options (Category, Subcategory, etc.)
// into a single settings page or a more unified "Product Setup" section.

// TODO: Item 10 (from user request): Dashboard View Refinement
// Review and refine the dashboard layout and information displayed
// based on user feedback and evolving needs.

