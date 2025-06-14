import { getItemById } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import EditItemForm from '@/components/inventory/EditItemForm'

export default async function EditItemPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await params before using its properties
  const resolvedParams = await params
  const id = typeof resolvedParams.id === 'string' ? resolvedParams.id : String(resolvedParams.id)
  
  // Get item with authentication
  const result = await getItemById(id)
  
  // Handle authentication errors
  if (result.error) {
    if (result.error === 'Authentication required') {
      redirect('/login') // Redirect to your login page
    }
    
    // Handle other errors (item not found, etc.)
    return (
      <div className="p-4">
        <h1>Error</h1>
        <p>{result.error}</p>
      </div>
    )
  }
  
  const item = result.data
  
  if (!item) {
    return (
      <div className="p-4">
        <h1>Item Not Found</h1>
        <p>The item you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1>Edit Item</h1>
      {/* Your edit form component here */}
      <EditItemForm item={item} />
    </div>
  )
}
