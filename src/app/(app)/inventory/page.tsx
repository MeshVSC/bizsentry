import { getSession } from '@/lib/supabase-session';

export default async function InventoryPage() {
  try {
    const session = await getSession();
    if (!session) {
      return (
        <div>
          <h1>Inventory Page</h1>
          <p>Session is missing. Please ensure you are authenticated.</p>
        </div>
      );
    }

    // Proceed with page logic if session exists
    return (
      <div>
        <h1>Inventory Page</h1>
        <p>Welcome to the inventory page!</p>
      </div>
    );
  } catch (error) {
    console.error('Error fetching session:', error);
    return (
      <div>
        <h1>Inventory Page</h1>
        <p>An error occurred while fetching the session.</p>
      </div>
    );
  }
}
