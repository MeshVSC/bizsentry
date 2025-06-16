import type { Item } from '@/types/item';
import InventoryListContainer from './list/InventoryListContainer';

interface SearchableInventoryListProps {
  items: Item[];
}

export default function SearchableInventoryList(props: SearchableInventoryListProps) {
  return <InventoryListContainer {...props} />;
}