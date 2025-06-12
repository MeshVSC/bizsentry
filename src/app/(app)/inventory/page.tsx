import { getAllItems } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function InventoryPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams
  
  const nameFilter = typeof resolvedSearchParams.name === "string" ? resolvedSearchParams.name : ""
  const categoryFilter = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : ""
  const currentPage = parseInt(typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : "1", 10)
  
  // Get app settings (you'll need to update this function too)
  // const appSettings = await getAppSettings()
  const itemsPerPage = 10 // Or get from settings
  
  // Get items with filters
  const result = await getAllItems({
    name: nameFilter || undefined,
    category: categoryFilter || undefined,
    page: currentPage,
    limit: itemsPerPage
  })
  
  // Handle authentication errors
  if (result.error) {
    if (result.error === 'Authentication required') {
      redirect('/login') // Redirect to your login page
    }
    
    return (
      <div className="p-4">
        <h1>Error</h1>
        <p>{result.error}</p>
      </div>
    )
  }
  
  const items = result.data || []

  return (
    <div className="p-4">
      <h1>Inventory</h1>
      {/* Your inventory list component here */}
      <InventoryList items={items} />
    </div>
  )
}
