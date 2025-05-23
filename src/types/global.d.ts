
// This declaration allows us to extend the globalThis object in Node.js
// for storing the in-memory items array across HMR updates in development.

// eslint-disable-next-line no-var
declare var _itemsStore: import('@/types/item').Item[];

// Alternatively, more explicitly for Node.js global:
// declare namespace NodeJS {
//   interface Global {
//     _itemsStore: import('@/types/item').Item[];
//   }
// }
