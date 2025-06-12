
// Managed dropdown option declarations are removed as they are now fully in Supabase without user-specific globals.

// For application settings (still in-memory for prototype)
declare global {
  // eslint-disable-next-line no-var
  var _appSettingsStore: import('@/lib/actions/settingsActions').AppSettings;
  const _itemsStore: import('@/types/item').Item[];
  const _managedCategoriesStore: string[];
  const _managedSubcategoriesStore: string[];
  const _managedStorageLocationsStore: string[];
  const _managedBinLocationsStore: string[];
  const _managedRoomsStore: string[];
  const _managedVendorsStore: string[];
  const _managedProjectsStore: string[];
}
export {}
