
// This declaration allows us to extend the globalThis object in Node.js
// for storing the in-memory items array across HMR updates in development.
import type { ItemStatus } from './item'; // Import ItemStatus

// eslint-disable-next-line no-var
declare var _itemsStore: import('@/types/item').Item[];

// For managed dropdown options
// eslint-disable-next-line no-var
declare var _managedCategoriesStore: string[];
// eslint-disable-next-line no-var
declare var _managedSubcategoriesStore: string[]; // New
// eslint-disable-next-line no-var
declare var _managedStorageLocationsStore: string[];
// eslint-disable-next-line no-var
declare var _managedBinLocationsStore: string[];
// eslint-disable-next-line no-var
declare var _managedRoomsStore: string[]; // New
// eslint-disable-next-line no-var
declare var _managedVendorsStore: string[]; // New
// eslint-disable-next-line no-var
declare var _managedProjectsStore: string[]; // New


// For application settings
// eslint-disable-next-line no-var
declare var _appSettingsStore: import('@/lib/actions/settingsActions').AppSettings;

// For basic user authentication prototype
// eslint-disable-next-line no-var
declare var _usersStore: import('@/types/user').User[];
// eslint-disable-next-line no-var
declare var _currentUserStore: import('@/types/user').CurrentUser | null;

// Placeholder for Password Reset discussion - Item 5
// TODO: Discuss and implement password reset functionality.
// Current challenge: No email addresses are stored for users.
// Possible approaches: Security questions (less secure), admin-initiated reset,
// or requiring email collection for password reset.

// Placeholder for Consolidating Product Setup Settings - Item 7
// TODO: Evaluate consolidating all product-related managed options (Category, Subcategory, Storage Location, Bin Location, Room, Vendor, Project)
// into a single settings page or a more unified "Product Setup" section if the current tabbed interface becomes too cluttered.

// Placeholder for Dashboard View Refinement - Item 10
// TODO: Review and refine the dashboard layout and information displayed
// based on user feedback and evolving needs. Consider most critical KPIs
// for an at-a-glance view.
