import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive'
import { SectionCards } from '@/components/dashboard/section-cards'

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <SectionCards />
      <ChartAreaInteractive />
    </div>
  )
}
