'use server'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import bigqueryClient from '@/lib/bigquery'
import { getFinancialSummaryQuery } from '@/lib/bigquery/queries'
import { Resident } from '@/types'

// The data types remain the same for the frontend components
export type FormattedChartData = {
  date: string
  currency: string
  charges: number
  claims: number
  payments: number
  adjustments: number
}[]

async function getChartData(): Promise<{
  chartData: FormattedChartData
  residents: Resident[]
} | null> {
  try {
    const options = {
      query: getFinancialSummaryQuery,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'US', // Or your BigQuery dataset location
    }

    // Run the query
    const [rows] = await bigqueryClient.query(options)

    // TODO: We will need to process the rows from the real query here.
    // For now, we will return mock data in the correct shape.
    const mockChartData: FormattedChartData = [
      {
        date: new Date().toISOString().split('T')[0],
        currency: 'NGN',
        charges: 1000,
        claims: 800,
        payments: 700,
        adjustments: 100,
      },
    ]

    // TODO: We will also need to fetch resident growth data from BigQuery.
    const mockResidents: Resident[] = []

    return {
      chartData: mockChartData,
      residents: mockResidents,
    }
  } catch (error) {
    console.error('BigQuery query failed:', error)
    // Handle authentication errors if necessary
    if (error instanceof Error && error.message.match(/(denied|invalid)/i)) {
      redirect('/sign-in')
    }
    return null
  }
}

export default async function DashboardPage() {
  const data = await getChartData()
  if (!data) return <div>Error loading chart data from BigQuery.</div>
  return (
    <DashboardClient chartData={data.chartData} residents={data.residents} />
  )
}
