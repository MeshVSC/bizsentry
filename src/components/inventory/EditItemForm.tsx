"use client";

import type { Item } from "@/types/item";
import ItemForm from "./ItemForm";

interface EditItemFormProps {
  item: Item;
}

export function EditItemForm({ item }: EditItemFormProps) {
  return <ItemForm item={item} />;
}

export default EditItemForm;