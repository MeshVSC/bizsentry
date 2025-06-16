
import type { Item, ItemInput } from "@/types/item";
import ItemFormContainer from "./form/ItemFormContainer";

interface ItemFormProps {
  item?: Item;
  onSubmitAction: (data: ItemInput) => Promise<Item | { error: string } | undefined>;
  isEditing?: boolean;
  availableCategories: string[];
  availableSubcategories: string[];
  availableStorageLocations: string[];
  availableBinLocations: string[];
  availableRooms: string[];
  availableVendors: string[];
  availableProjects: string[];
}

export default function ItemForm(props: ItemFormProps) {
  return <ItemFormContainer {...props} />;
}
