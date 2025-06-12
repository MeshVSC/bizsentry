import React from 'react';

const NewSidebar = () => {
  return <div>New Sidebar Component</div>;
};

export default NewSidebar;

/* ## Project Structure

### Components
The project contains reusable UI components located in the `src/components` directory. Key components include:

- **NewSidebar**: A sidebar component located at `src/components/ui/NewSidebar.tsx`. This component is used in the `/inventory` page.

### Pages
The project uses Next.js for routing. Key pages include:

- **Inventory Page**: Located at `src/app/(app)/inventory/page.tsx`. This page imports and uses the following components:
  - `NewSidebar`
  - `InventoryFilters`
  - `PaginationControls`

### Aliases
The project uses the `@` alias for cleaner imports. Ensure the alias is configured in `tsconfig.json` or `jsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
``` */