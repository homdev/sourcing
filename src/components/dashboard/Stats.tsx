import { Card, CardTitle, CardHeader, CardContent } from "../ui/card"
import { Annonce } from "@/types/dashboard"

export function DashboardStats({ data }: { data: Annonce[] }) {
    const stats = {
      total: data.length,
      pending: data.filter(item => item.status === 'PENDING').length,
      completed: data.filter(item => item.status === 'COMPLETED').length,
      failed: data.filter(item => item.status === 'FAILED').length,
    }
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        {/* ... autres stats ... */}
      </div>
    )
  }