
// This declaration allows us to extend the globalThis object in Node.js
// for storing the in-memory items array across HMR updates in development.
import type { ItemStatus } from './item'; // Import ItemStatus

// eslint-disable-next-line no-var
declare var _itemsStore: import('@/types/item').Item[];

// For managed dropdown options
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
// eslint-disable-next-line no-var
declare var _usersStore: import('@/types/user').User[];
// _currentUserStore is no longer used as sessions are cookie-based.
// eslint-disable-next-line no-var
// declare var _currentUserStore: import('@/types/user').CurrentUser | null;


// TODO: Item 5: Password Reset Functionality (Placeholder from user request)
// Discuss and implement password reset functionality.
// Current challenge: No email addresses are stored for users.

// TODO: Item 7: Consolidating Product Setup Settings (Placeholder from user request)
// Evaluate consolidating all product-related managed options (Category, Subcategory, etc.)
// into a single settings page or a more unified "Product Setup" section.

// TODO: Item 10: Dashboard View Refinement (Placeholder from user request)
// Review and refine the dashboard layout and information displayed
// based on user feedback and evolving needs.
