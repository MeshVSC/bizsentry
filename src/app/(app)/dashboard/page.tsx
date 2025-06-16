
import { getItems } from '@/lib/actions/itemActions';

// TOCK-Style Metric Card Component
function MetricCard({ 
  icon, 
  value, 
  label, 
  description, 
  change,
  changeColor = "text-muted-foreground"
}: {
  icon: string;
  value: string | number;
  label: string;
  description: string;
  change?: string;
  changeColor?: string;
}) {
  return (
    <div className="glass-card p-5 hover:border-[#ff9f43]/30 hover:shadow-[0_0_20px_rgba(255,159,67,0.1)]">
      <div className="text-xs text-muted-foreground mb-3">{label}</div>
      <div className="flex justify-between items-center mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{background: 'rgba(255, 159, 67, 0.15)', boxShadow: '0 0 10px rgba(255, 159, 67, 0.2)'}}>
          {icon}
        </div>
        {change && (
          <div className={`text-xs font-medium ${changeColor}`}>
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-[10px] text-muted-foreground">{description}</div>
    </div>
  );
}

// Fleet-Management Inspired Chart Component
function CategoryChart({ data }: { data: Array<{ name: string; count: number }> }) {
  const maxValue = Math.max(...data.map(d => d.count));
  
  return (
    <div className="glass-card p-5 relative overflow-hidden">
      {/* Dotted Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 159, 67, 0.3) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base font-semibold mb-1">Category Distribution</h3>
            <p className="text-xs text-muted-foreground">Current inventory breakdown</p>
          </div>
          <div className="flex gap-1">
            <div className="px-2 py-1 text-xs rounded bg-[#ff9f43]/15 text-[#ff9f43] cursor-pointer shadow-[0_0_8px_rgba(255,159,67,0.2)]">7D</div>
            <div className="px-2 py-1 text-xs rounded text-muted-foreground hover:text-foreground cursor-pointer hover:bg-[#ff9f43]/10 transition-all">30D</div>
            <div className="px-2 py-1 text-xs rounded text-muted-foreground hover:text-foreground cursor-pointer hover:bg-[#ff9f43]/10 transition-all">90D</div>
          </div>
        </div>
        
        {/* Spending-style Area Chart */}
        <div className="h-48 relative">
          <div className="absolute inset-0 flex items-end justify-center">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 159, 67, 0.6)" />
                  <stop offset="50%" stopColor="rgba(230, 126, 34, 0.4)" />
                  <stop offset="100%" stopColor="rgba(211, 84, 0, 0.1)" />
                </linearGradient>
              </defs>
              
              {/* Area Path */}
              <path
                d={`M 20 ${192 - (data[0]?.count || 0) / maxValue * 120} ${data.map((item, index) => 
                  `L ${60 + index * 80} ${192 - item.count / maxValue * 120}`
                ).join(' ')} L ${60 + (data.length - 1) * 80} 192 L 20 192 Z`}
                fill="url(#areaGradient)"
                className="drop-shadow-lg"
              />
              
              {/* Line */}
              <path
                d={`M 20 ${192 - (data[0]?.count || 0) / maxValue * 120} ${data.map((item, index) => 
                  `L ${60 + index * 80} ${192 - item.count / maxValue * 120}`
                ).join(' ')}`}
                stroke="#ff9f43"
                strokeWidth="2"
                fill="none"
                className="drop-shadow-sm"
              />
              
              {/* Data Points */}
              {data.map((item, index) => (
                <circle
                  key={item.name}
                  cx={60 + index * 80}
                  cy={192 - item.count / maxValue * 120}
                  r="4"
                  fill="#ff9f43"
                  className="drop-shadow-md"
                  style={{filter: 'drop-shadow(0 0 6px rgba(255, 159, 67, 0.6))'}}
                />
              ))}
            </svg>
          </div>
          
          {/* Category Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-around px-5">
            {data.map((item) => (
              <div key={item.name} className="flex flex-col items-center gap-1">
                <div className="text-[10px] text-muted-foreground text-center max-w-[60px] truncate">
                  {item.name}
                </div>
                <div className="text-[10px] font-medium text-[#ff9f43]">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// TOCK-Style Activity Component
function RecentActivity({ items }: { items: Array<{id: string; name: string; status: string; quantity: number; createdAt: string}> }) {
  const getStatusDot = (status: string) => {
    switch (status) {
      case 'in stock': return 'status-active';
      case 'in use': return 'status-pending';
      default: return 'status-inactive';
    }
  };

  const getUnitsColor = (status: string) => {
    switch (status) {
      case 'in stock': return 'text-[#27ae60]';
      case 'in use': return 'text-[#ffeb3b]';
      case 'sold': return 'text-[#e74c3c]';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">Recent Activity</h3>
        <div className="text-xs text-[#ff9f43] cursor-pointer hover:text-[#e67e22] transition-colors">
          View All
        </div>
      </div>
      
      <div className="space-y-3">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="bg-[#0f0f0f]/40 border border-[#1f1f1f] rounded-lg p-3 hover:bg-[#0f0f0f]/70 hover:border-[#ff9f43]/30 hover:shadow-[0_0_15px_rgba(255,159,67,0.1)] transition-all">
            <div className="flex items-center gap-2">
              <div className={`status-dot ${getStatusDot(item.status)}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  Added on {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className={`text-xs font-medium ${getUnitsColor(item.status)}`}>
                {item.quantity} units
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const { items } = await getItems();

  // Calculate metrics
  const totalItemsInStorage = items
    .filter(item => item.status === 'in stock' || item.status === 'in use')
    .reduce((sum, item) => sum + item.quantity, 0);
    
  const totalItemsSoldCount = items.filter(item => item.status === 'sold').length;
  
  const categories = new Set(
    items
      .filter(item => item.status === 'in stock' || item.status === 'in use')
      .map(item => item.category)
      .filter(Boolean)
  );
  
  const totalEstimatedProfitSold = items
    .filter(item => item.status === 'sold' && typeof item.salesPrice === 'number' && typeof item.originalPrice === 'number')
    .reduce((sum, item) => {
      const quantitySoldApproximation = item.quantity > 0 ? item.quantity : 1;
      const profitPerUnit = item.salesPrice! - item.originalPrice!;
      return sum + profitPerUnit * quantitySoldApproximation;
    }, 0);

  // Prepare chart data
  const categoriesData: { [key: string]: number } = {};
  items
    .filter(item => item.status === 'in stock' || item.status === 'in use')
    .forEach(item => {
      const category = item.category || "Uncategorized";
      categoriesData[category] = (categoriesData[category] || 0) + item.quantity;
    });
  
  const chartData = Object.entries(categoriesData)
    .map(([name, count]) => ({ name, count }))
    .slice(0, 4);

  const recentItems = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon="📦"
          value={totalItemsInStorage}
          label="Total Items (In Stock/Use)"
          description="Sum of quantities for active items"
          change="↗ 12%"
          changeColor="text-[#27ae60]"
        />
        <MetricCard
          icon="🏷️"
          value={totalItemsSoldCount}
          label="Distinct Items Sold"
          description="Number of unique item types 'sold'"
          change="0%"
          changeColor="text-muted-foreground"
        />
        <MetricCard
          icon="📁"
          value={categories.size}
          label="Categories with Stock"
          description="Unique categories with active items"
          change="0%"
          changeColor="text-muted-foreground"
        />
        <MetricCard
          icon="💰"
          value={`$${totalEstimatedProfitSold.toFixed(2)}`}
          label="Total Est. Profit (Sold)"
          description="Approx. profit from 'sold' items"
          change="0%"
          changeColor="text-muted-foreground"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CategoryChart data={chartData} />
        </div>
        <div>
          <RecentActivity items={recentItems} />
        </div>
      </div>
    </div>
  );
}
