'use server'
import { getAllResidents, getNestedResidentData } from '@/actions/residents/get'
import { Charge, Payment, Adjustment } from '@/types/schemas'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { FIRESTORE_COLLECTIONS } from '@/types/constants'

export type AggregatedChartData = {
  [key: string]: {
    date: string
    charges: number
    payments: number
    adjustments: number
  }
}

export type FormattedChartData = {
  date: string
  charges: number
  payments: number
  adjustments: number
}[]

async function getChartData(): Promise<FormattedChartData | null> {
  const { residents } =
    (await getAllResidents({}).catch(async (reason) => {
      if (reason.toString().match(/(cookies|session|authenticate)/i)) {
        await fetch('/api/auth/logout', {
          method: 'post',
        }).then(async (result) => {
          if (result.status === 200) redirect('/sign-in') // Navigate to the login page
        })
      }
    })) || {}

  if (!residents) return null

  const allCharges: Charge[] = []
  const allPayments: Payment[] = []
  const allAdjustments: Adjustment[] = []

  await Promise.all(
    residents.map(async (resident) => {
      const residentCharges =
        (await getNestedResidentData(
          resident.id,
          FIRESTORE_COLLECTIONS.CHARGES,
        )) || []
      const residentPayments =
        (await getNestedResidentData(
          resident.id,
          FIRESTORE_COLLECTIONS.PAYMENTS,
        )) || []
      const residentAdjustments =
        (await getNestedResidentData(
          resident.id,
          FIRESTORE_COLLECTIONS.ADJUSTMENTS,
        )) || []

      allCharges.push(...(residentCharges as Charge[]))
      allPayments.push(...(residentPayments as Payment[]))
      allAdjustments.push(...(residentAdjustments as Adjustment[]))
    }),
  )

  const aggregatedData: AggregatedChartData = {}

  // Aggregate charges
  allCharges.forEach((charge) => {
    const date = charge.occurrence_datetime.split('T')[0]
    if (!aggregatedData[date]) {
      aggregatedData[date] = { date, charges: 0, payments: 0, adjustments: 0 }
    }
    aggregatedData[date].charges += charge.unit_price.value * charge.quantity
  })

  // Aggregate payments
  allPayments.forEach((payment) => {
    const date = payment.occurrence_datetime.split('T')[0]
    if (!aggregatedData[date]) {
      aggregatedData[date] = { date, charges: 0, payments: 0, adjustments: 0 }
    }
    aggregatedData[date].payments += payment.amount.value
  })

  // Aggregate adjustments
  allAdjustments.forEach((adjustment) => {
    const date = adjustment.authored_on.split('T')[0]
    if (!aggregatedData[date]) {
      aggregatedData[date] = { date, charges: 0, payments: 0, adjustments: 0 }
    }
    aggregatedData[date].adjustments += adjustment.approved_amount.value
  })

  const formattedData = Object.values(aggregatedData).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  return formattedData
}

export default async function DashboardPage() {
  const chartData = await getChartData()
  if (!chartData) return <div>Error loading chart data.</div>
  return <DashboardClient chartData={chartData} />
}
