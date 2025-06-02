
// Managed dropdown option declarations are removed as they are now fully in Supabase without user-specific globals.

// For application settings (still in-memory for prototype)
// eslint-disable-next-line no-var
declare var _appSettingsStore: import('@/lib/actions/settingsActions').AppSettings;

// User store declarations are removed as authentication is removed.
// // eslint-disable-next-line no-var
// declare var _usersStore: any; // Kept 'any' to avoid import error if user.ts is empty
// // eslint-disable-next-line no-var
// declare var _currentUserStore: any | null; // Kept 'any'
