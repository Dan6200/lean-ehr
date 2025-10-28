'use client'

import * as React from 'react'
import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive'
import { SectionCards } from '@/components/dashboard/section-cards'
import { FormattedChartData } from '@/app/admin/dashboard/page'

export function DashboardClient({
  chartData,
}: {
  chartData: FormattedChartData
}) {
  const [timeRange, setTimeRange] = React.useState('90d')

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <SectionCards chartData={chartData} timeRange={timeRange} />
      <div className="@5xl/main:col-span-2">
        <ChartAreaInteractive
          chartData={chartData}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
      </div>
    </div>
  )
}
