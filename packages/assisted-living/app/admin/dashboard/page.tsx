'use server'
import { getAllResidents, getNestedResidentData } from '@/actions/residents/get'
import {
  ChargeSchema,
  PaymentSchema,
  AdjustmentSchema,
  ClaimSchema,
} from '@/types/schemas'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { z } from 'zod'

type Charge = z.infer<typeof ChargeSchema>
type Claim = z.infer<typeof ClaimSchema>
type Payment = z.infer<typeof PaymentSchema>
type Adjustment = z.infer<typeof AdjustmentSchema>

export type AggregatedChartData = {
  [key: string]: {
    date: string
    currency: string
    charges: number
    claims: number
    payments: number
    adjustments: number
  }
}

export type FormattedChartData = {
  date: string
  currency: string
  charges: number
  claims: number
  payments: number
  adjustments: number
}[]

type UnifiedTransaction = {
  date: string
  type: 'charges' | 'claims' | 'payments' | 'adjustments'
  amount: number
  currency: string
}

async function getChartData(): Promise<FormattedChartData | null> {
  const { residents } = (await getAllResidents({})) || {}

  if (!residents) return null

  const allDataPromises = residents.map((resident) =>
    Promise.all([
      getNestedResidentData(resident.id, 'charges'),
      getNestedResidentData(resident.id, 'claims'),
      getNestedResidentData(resident.id, 'payments'),
      getNestedResidentData(resident.id, 'adjustments'),
    ]),
  )

  const allResidentData = await Promise.all(allDataPromises).catch(
    async (reason: any) => {
      if (reason.toString().match(/(cookies|session|authenticate)/i)) {
        const url =
          process.env.HOST + ':' + process.env.PORT + '/api/auth/logout'
        await fetch(url, {
          method: 'post',
        }).finally(async () => {
          redirect('/sign-in')
        })
      }
      throw new Error(`Failed to fetch all residents data: ${reason.message}`)
    },
  )

  const allTransactions: UnifiedTransaction[] = []

  for (const residentData of allResidentData) {
    const [charges, claims, payments, adjustments] = residentData as [
      Charge[],
      Claim[],
      Payment[],
      Adjustment[],
    ]

    if (charges) {
      allTransactions.push(
        ...charges.map((c) => ({
          date: c.occurrence_datetime.split('T')[0],
          type: 'charges' as const,
          amount: c.unit_price.value * c.quantity,
          currency: c.unit_price.currency,
        })),
      )
    }
    if (claims) {
      allTransactions.push(
        ...claims.map((c) => ({
          date: c.authored_on.split('T')[0],
          type: 'claims' as const,
          amount: c.total.value,
          currency: c.total.currency,
        })),
      )
    }
    if (payments) {
      allTransactions.push(
        ...payments.map((p) => ({
          date: p.occurrence_datetime.split('T')[0],
          type: 'payments' as const,
          amount: p.amount.value,
          currency: p.amount.currency,
        })),
      )
    }
    if (adjustments) {
      allTransactions.push(
        ...adjustments.map((a) => ({
          date: a.authored_on.split('T')[0],
          type: 'adjustments' as const,
          amount: a.approved_amount.value,
          currency: a.approved_amount.currency,
        })),
      )
    }
  }

  const aggregatedData = allTransactions.reduce(
    (acc: AggregatedChartData, transaction) => {
      const { date, type, amount, currency } = transaction
      if (!acc[date]) {
        acc[date] = {
          date,
          currency: currency,
          charges: 0,
          claims: 0,
          payments: 0,
          adjustments: 0,
        }
      }
      acc[date][type] += amount
      return acc
    },
    {},
  )

  const formattedData = Object.values(aggregatedData).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  return { chartData: formattedData, residents }
}

export default async function DashboardPage() {
  const data = await getChartData()
  if (!data) return <div>Error loading chart data.</div>
  return (
    <DashboardClient chartData={data.chartData} residents={data.residents} />
  )
}
