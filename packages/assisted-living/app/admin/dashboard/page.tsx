import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive'
import { SectionCards } from '@/components/dashboard/section-cards'

export default async function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <SectionCards />
      <div className="@5xl/main:col-span-2">
        <ChartAreaInteractive />
      </div>
    </div>
  )
}
