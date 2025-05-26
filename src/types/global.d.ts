
// This declaration allows us to extend the globalThis object in Node.js
// for storing the in-memory items array across HMR updates in development.

// eslint-disable-next-line no-var
declare var _itemsStore: import('@/types/item').Item[];

// For managed dropdown options
// eslint-disable-next-line no-var
declare var _managedCategoriesStore: string[];
// eslint-disable-next-line no-var
declare var _managedStorageLocationsStore: string[];
// eslint-disable-next-line no-var
declare var _managedBinLocationsStore: string[];
