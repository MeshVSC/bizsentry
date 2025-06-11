
// Managed dropdown option declarations are removed as they are now fully in Supabase without user-specific globals.

// For application settings (still in-memory for prototype)
// eslint-disable-next-line no-var
declare var _appSettingsStore: import('@/lib/actions/settingsActions').AppSettings;

declare global {
  var _itemsStore: import('@/types/item').Item[];
  var _managedCategoriesStore: string[];
  var _managedSubcategoriesStore: string[];
  var _managedStorageLocationsStore: string[];
  var _managedBinLocationsStore: string[];
  var _managedRoomsStore: string[];
  var _managedVendorsStore: string[];
  var _managedProjectsStore: string[];
}
export {};

// User store declarations are removed as authentication is removed.
// // eslint-disable-next-line no-var
// declare var _usersStore: any; // Kept 'any' to avoid import error if user.ts is empty
// // eslint-disable-next-line no-var
// declare var _currentUserStore: any | null; // Kept 'any'
